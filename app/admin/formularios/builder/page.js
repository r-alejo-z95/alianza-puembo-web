"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import FormBuilder from "@/components/admin/forms/FormBuilder";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { initializeGoogleIntegration } from "@/lib/actions";
import { Button } from "@/components/ui/button";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formId = searchParams.get("id");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(!!formId);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    const supabase = createClient();
    const { title, description, fields } = formData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let currentFormId = form?.id;
    let imageUrl = form?.image_url || null;
    const slug = slugify(title);

    try {
      if (imageFile) {
        if (form && form.image_url) {
          const oldFileName = form.image_url.split("/").pop();
          await supabase.storage.from("form-images").remove([oldFileName]);
        }
        const fileName = `${Date.now()}_header_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("form-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          toast.error("Error al subir la imagen de cabecera.");
          setSaving(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("form-images")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }

      const processedFields = await Promise.all(
        fields.map(async (field) => {
          let attachmentUrl = field.attachment_url;
          if (field.attachment_file) {
            const file = field.attachment_file;
            const fileName = `${Date.now()}_field_${field.id}_${file.name}`;
            const { data: uploadData, error: uploadError } =
              await supabase.storage.from("form-images").upload(fileName, file);
            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from("form-images")
                .getPublicUrl(uploadData.path);
              attachmentUrl = urlData.publicUrl;
            }
          }
          const { attachment_file, ...fieldData } = field;
          return {
            ...fieldData,
            attachment_url: attachmentUrl,
            form_id: currentFormId,
          };
        })
      );

      if (currentFormId) {
        const { error: formError } = await supabase
          .from("forms")
          .update({ title, description, image_url: imageUrl, slug })
          .eq("id", currentFormId);
        if (formError) throw formError;
        await supabase
          .from("form_fields")
          .delete()
          .eq("form_id", currentFormId);
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
        if (formError || !newForm) throw formError;
        currentFormId = newForm.id;
        toast.info("Iniciando integración con Google...");
        await initializeGoogleIntegration(
          newForm.id,
          newForm.title,
          newForm.slug,
          fields
        );
      }

      const fieldsToInsert = processedFields.map((field) => ({
        ...field,
        form_id: currentFormId,
      }));
      const { error: fieldsError } = await supabase
        .from("form_fields")
        .insert(fieldsToInsert);
      if (fieldsError) throw fieldsError;

      toast.success("Formulario guardado con éxito.");
      router.push("/admin/formularios");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--puembo-green)] opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
          Cargando Constructor
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col gap-4">
      <header className="bg-black text-white p-6 md:px-12 flex items-center justify-between top-0 z-[60] border-b border-white/10">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/formularios")}
            className="rounded-full hover:bg-(--puembo-green) text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-[var(--puembo-green)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                Constructor
              </span>
            </div>
            <h1 className="text-xl font-serif font-bold truncate max-w-xs md:max-w-md">
              {form?.title || "Nuevo Formulario"}
            </h1>
          </div>
        </div>
      </header>
      <div className="flex-grow">
        <FormBuilder
          form={form}
          onSave={handleSave}
          onCancel={() => router.push("/admin/formularios")}
          isFullScreen={true}
          isSaving={saving}
        />
      </div>
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
