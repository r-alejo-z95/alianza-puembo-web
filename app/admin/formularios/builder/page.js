"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import FormBuilder from "@/components/admin/forms/FormBuilder";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { initializeGoogleIntegration } from "@/lib/actions";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formId = searchParams.get("id");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(!!formId);

  useEffect(() => {
    if (formId) {
      const fetchForm = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("forms")
          .select("*, form_fields(*)")
          .eq("id", formId)
          .single();

        if (error) {
          console.error("Error fetching form:", error);
          toast.error("No se pudo cargar el formulario.");
          router.push("/admin/formularios");
        } else {
          // Sort fields securely
          if (data.form_fields) {
            data.form_fields.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
          }
          setForm(data);
        }
        setLoading(false);
      };
      fetchForm();
    }
  }, [formId, router]);

  const handleSave = async (formData, imageFile) => {
    const supabase = createClient();
    const { title, description, fields } = formData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let currentFormId = form?.id;
    let imageUrl = form?.image_url || null;
    const slug = slugify(title);

    // Handle image upload
    if (imageFile) {
      // If updating an existing form and a new image is provided, delete the old one
      if (form && form.image_url) {
        const oldFileName = form.image_url.split("/").pop();
        const { error: deleteOldStorageError } = await supabase.storage
          .from("form-images") // Assuming a bucket named 'form-images'
          .remove([oldFileName]);

        if (deleteOldStorageError) {
          console.error(
            "Error deleting old form image from storage:",
            deleteOldStorageError
          );
          toast.error(
            "Error al eliminar la imagen antigua del almacenamiento."
          );
        }
      }

      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("form-images") // Assuming a bucket named 'form-images'
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Error uploading form image:", uploadError);
        toast.error("Error al subir la imagen del formulario.");
        return;
      } else {
        const { data: urlData } = supabase.storage
          .from("form-images")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }
    }

    if (currentFormId) {
      // Update existing form
      const { error: formError } = await supabase
        .from("forms")
        .update({ title, description, image_url: imageUrl, slug })
        .eq("id", currentFormId);

      if (formError) {
        console.error("Error updating form:", formError);
        toast.error("Error al actualizar el formulario.");
        return;
      }

      // Delete existing fields and insert new ones
      const { error: deleteFieldsError } = await supabase
        .from("form_fields")
        .delete()
        .eq("form_id", currentFormId);

      if (deleteFieldsError) {
        console.error("Error deleting old form fields:", deleteFieldsError);
        toast.error("Error al actualizar los campos del formulario.");
        return;
      }
    } else {
      // Create new form
      const { data: newForm, error: formError } = await supabase
        .from("forms")
        .insert([
          { title, description, image_url: imageUrl, user_id: user?.id, slug },
        ])
        .select()
        .single();

      if (formError || !newForm) {
        console.error("Error creating form:", formError);
        toast.error("Error al crear el formulario.");
        return;
      }
      currentFormId = newForm.id;

      // Initialize Google integration for the new form
      toast.info("Iniciando integración con Google...");
      const googleResult = await initializeGoogleIntegration(
        newForm.id,
        newForm.title,
        newForm.slug,
        fields
      );
      if (googleResult.error) {
        console.error("Error initializing Google integration:", googleResult.error);
        toast.error(
          `Formulario creado, pero hubo un error con Google: ${googleResult.error}`
        );
      } else {
        toast.success("Integración con Google completada con éxito.");
      }
    }

    // Insert form fields
    const fieldsToInsert = fields.map((field) => ({
      ...field,
      form_id: currentFormId,
    }));

    const { error: fieldsError } = await supabase
      .from("form_fields")
      .insert(fieldsToInsert);

    if (fieldsError) {
      console.error("Error inserting form fields:", fieldsError);
      toast.error("Error al guardar los campos del formulario.");
      return;
    }

    toast.success("Formulario guardado con éxito.");
    router.push("/admin/formularios");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const handleCancel = () => {
    router.push("/admin/formularios");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FormBuilder 
        form={form} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        isFullScreen={true}
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
