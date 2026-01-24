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
  const formSlug = searchParams.get("slug");
  const formId = searchParams.get("id");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(!!(formSlug || formId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (formSlug || formId) {
      const fetchForm = async () => {
        const supabase = createClient();
        let query = supabase.from("forms").select("*, form_fields(*)");

        if (formId) {
          query = query.eq("id", formId);
        } else {
          query = query.eq("slug", formSlug);
        }

        const { data, error } = await query.single();

        if (error) {
          console.error("Error fetching form:", error);
          toast.error("No se pudo cargar el formulario.");
          router.push("/admin/formularios");
        } else {
          if (data.form_fields) {
            data.form_fields.sort(
              (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
            );
          }
          setForm(data);
        }
        setLoading(false);
      };
      fetchForm();
    }
  }, [formSlug, formId, router]);

  const handleSave = async (formData, imageFile) => {
    setSaving(true);
    const supabase = createClient();
    const { title, description, fields } = formData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Priorizar el ID del estado 'form' que se cargó al inicio
    const currentFormId = form?.id;
    let imageUrl = form?.image_url || null;

    // Solo generar slug si el título cambió o si es nuevo
    const slug = form && form.title === title ? form.slug : slugify(title);

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
          const { attachment_file, id, ...fieldData } = field;

          // Preservar el ID original si es un UUID válido de la base de datos
          const isRealUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              id,
            );

          return {
            ...(isRealUuid ? { id } : {}),
            ...fieldData,
            attachment_url: attachmentUrl,
            form_id: currentFormId,
          };
        }),
      );

      if (currentFormId) {
        // ACTUALIZACIÓN
        const { error: formError } = await supabase
          .from("forms")
          .update({ title, description, image_url: imageUrl, slug })
          .eq("id", currentFormId);

        if (formError) throw formError;

        // ESTRATEGIA: Obtener IDs actuales para saber cuáles borrar
        const { data: existingFields } = await supabase
          .from("form_fields")
          .select("id")
          .eq("form_id", currentFormId);

        const currentIds = processedFields.map((f) => f.id).filter(Boolean);
        const idsToDelete =
          existingFields
            ?.map((f) => f.id)
            .filter((id) => !currentIds.includes(id)) || [];

        if (idsToDelete.length > 0) {
          await supabase.from("form_fields").delete().in("id", idsToDelete);
        }

        // Upsert de los campos (actualiza los que tienen ID, inserta los nuevos)
        const { error: fieldsError } = await supabase
          .from("form_fields")
          .upsert(
            processedFields.map((f) => ({ ...f, form_id: currentFormId })),
          );

        if (fieldsError) throw fieldsError;
      } else {
        // INSERCIÓN NUEVA
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

        const newId = newForm.id;
        toast.info("Iniciando integración con Google...");
        await initializeGoogleIntegration(
          newId,
          newForm.title,
          newForm.slug,
          fields,
        );

        const fieldsToInsert = processedFields.map((field) => ({
          ...field,
          form_id: newId,
        }));

        const { error: fieldsError } = await supabase
          .from("form_fields")
          .insert(fieldsToInsert);

        if (fieldsError) throw fieldsError;
      }

      toast.success("Formulario guardado con éxito.");
      router.push("/admin/formularios");
    } catch (error) {
      console.error("Save Error:", error);
      toast.error(
        "Error al guardar: " + (error.message || "Error desconocido"),
      );
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
      <header className="bg-black text-white p-6 md:px-12 flex items-center justify-between top-0 z-[60] border-b rounded-2xl border-white/10">
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
            <h1 className="text-xl font-serif font-bold wrap-break-word whitespace-normal max-w-xs md:max-w-md">
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
