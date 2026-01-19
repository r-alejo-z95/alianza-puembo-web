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
  const [saving, setSaving] = useState(false); // New state for saving status

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
            data.form_fields.sort(
              (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
            );
          }
          setForm(data);
        }
        setLoading(false);
      };
      fetchForm();
    }
  }, [formId, router]);

  const handleSave = async (formData, imageFile) => {
    setSaving(true); // Start saving
    const supabase = createClient();
    const { title, description, fields } = formData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let currentFormId = form?.id;
    let imageUrl = form?.image_url || null;
    const slug = slugify(title);

    try {
      // 1. Handle Header Image Upload
      if (imageFile) {
        if (form && form.image_url) {
          const oldFileName = form.image_url.split("/").pop();
          const { error: deleteOldStorageError } = await supabase.storage
            .from("form-images")
            .remove([oldFileName]);

          if (deleteOldStorageError) {
            console.error(
              "Error deleting old form image:",
              deleteOldStorageError
            );
          }
        }

        const fileName = `${Date.now()}_header_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("form-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Error uploading form image:", uploadError);
          toast.error("Error al subir la imagen de cabecera.");
          setSaving(false);
          return;
        } else {
          const { data: urlData } = supabase.storage
            .from("form-images")
            .getPublicUrl(uploadData.path);
          imageUrl = urlData.publicUrl;
        }
      }

      // 2. Handle Question Attachments Upload
      const processedFields = await Promise.all(
        fields.map(async (field) => {
          let attachmentUrl = field.attachment_url;

          // If there's a new file to upload
          if (field.attachment_file) {
            const file = field.attachment_file;
            const fileName = `${Date.now()}_field_${field.id}_${file.name}`;

            const { data: uploadData, error: uploadError } =
              await supabase.storage.from("form-images").upload(fileName, file);

            if (uploadError) {
              console.error(
                `Error uploading attachment for field ${field.label}:`,
                uploadError
              );
              toast.error(
                `Error al subir adjunto para la pregunta: ${field.label}`
              );
              // Continue without updating URL if failed
            } else {
              const { data: urlData } = supabase.storage
                .from("form-images")
                .getPublicUrl(uploadData.path);
              attachmentUrl = urlData.publicUrl;
            }
          }

          // Return cleaner object for DB insertion
          const { attachment_file, ...fieldData } = field;
          return {
            ...fieldData,
            attachment_url: attachmentUrl,
            attachment_type: field.attachment_type,
            form_id: currentFormId, // Will be set/overwritten later if creating new
          };
        })
      );

      // 3. Create or Update Form
      if (currentFormId) {
        const { error: formError } = await supabase
          .from("forms")
          .update({ title, description, image_url: imageUrl, slug })
          .eq("id", currentFormId);

        if (formError) {
          console.error("Error updating form:", formError);
          toast.error("Error al actualizar el formulario.");
          setSaving(false);
          return;
        }

        // Delete existing fields to replace with new set
        const { error: deleteFieldsError } = await supabase
          .from("form_fields")
          .delete()
          .eq("form_id", currentFormId);

        if (deleteFieldsError) {
          console.error("Error deleting old fields:", deleteFieldsError);
          toast.error("Error al actualizar los campos.");
          setSaving(false);
          return;
        }
      } else {
        const { data: newForm, error: formError } = await supabase
          .from("forms")
          .insert([
            {
              title,
              description,
              image_url: imageUrl,
              user_id: user?.id,
              slug,
            },
          ])
          .select()
          .single();

        if (formError || !newForm) {
          console.error("Error creating form:", formError);
          toast.error("Error al crear el formulario.");
          setSaving(false);
          return;
        }
        currentFormId = newForm.id;

        // Initialize Google integration
        toast.info("Iniciando integración con Google...");
        const googleResult = await initializeGoogleIntegration(
          newForm.id,
          newForm.title,
          newForm.slug,
          fields // Pass original fields for initial headers
        );
        if (googleResult.error) {
          console.error(
            "Error initializing Google integration:",
            googleResult.error
          );
          toast.error(`Advertencia de Google: ${googleResult.error}`);
        } else {
          toast.success("Integración con Google completada.");
        }
      }

      // 4. Insert Processed Fields
      const fieldsToInsert = processedFields.map((field) => ({
        ...field,
        form_id: currentFormId,
      }));

      const { error: fieldsError } = await supabase
        .from("form_fields")
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error("Error inserting form fields:", fieldsError);
        toast.error("Error al guardar los campos.");
        setSaving(false);
        return;
      }

      toast.success("Formulario guardado con éxito.");
      router.push("/admin/formularios");
    } catch (error) {
      console.error("Unexpected error saving form:", error);
      toast.error("Ocurrió un error inesperado al guardar.");
      setSaving(false);
    }
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
        isSaving={saving} // Pass saving state
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)]" />
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
