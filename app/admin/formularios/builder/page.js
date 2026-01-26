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

/**
 * Sanitiza el nombre de un archivo para evitar problemas en Storage y URLs.
 */
function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
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
    const { title, description, fields, image_url: formImageUrl } = formData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let currentFormId = form?.id;
    let imageUrl = formImageUrl || form?.image_url || null;
    const slug = form && form.title === title ? form.slug : slugify(title);

    try {
      // 0. Si es un formulario nuevo, lo creamos primero para tener el ID para la portada
      if (!currentFormId) {
        const { data: newForm, error: formError } = await supabase
          .from("forms")
          .insert([
            {
              title,
              description,
              user_id: user?.id,
              slug,
            },
          ])
          .select()
          .single();

        if (formError || !newForm) throw formError;
        currentFormId = newForm.id;
      }

      // 1. Manejo de Imagen de Cabecera (Carpeta: header/[formId]/nombre)
      if (imageFile) {
        // Limpiar carpeta anterior
        if (form?.image_url && form.image_url.includes("/api/storage/")) {
          const parts = form.image_url.split("/");
          const oldFileName = parts[parts.length - 1];
          await supabase.storage
            .from("forms")
            .remove([`header/${currentFormId}/${oldFileName}`]);
        }

        const fileName = sanitizeFileName(imageFile.name);
        const supaPath = `header/${currentFormId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("forms")
          .upload(supaPath, imageFile, { upsert: true });

        if (uploadError)
          throw new Error("Error al subir portada: " + uploadError.message);

        imageUrl = `/api/storage/forms/${supaPath}`;
      } else if (formImageUrl === "") {
        if (form?.image_url && form.image_url.includes("/api/storage/")) {
          const parts = form.image_url.split("/");
          const oldFileName = parts[parts.length - 1];
          await supabase.storage
            .from("forms")
            .remove([`header/${currentFormId}/${oldFileName}`]);
        }
        imageUrl = null;
      }

      // 2. Procesar Campos y sus Adjuntos (Carpeta: fields/[fieldId]/nombre)
      const processedFields = await Promise.all(
        fields.map(async (field) => {
          let attachmentUrl = field.attachment_url;
          const existingField = form?.form_fields?.find(
            (f) => f.id === field.id,
          );
          const oldAttachmentUrl = existingField?.attachment_url;

          if (field.attachment_file) {
            // Limpiar anterior
            if (
              oldAttachmentUrl &&
              oldAttachmentUrl.includes("/api/storage/")
            ) {
              const parts = oldAttachmentUrl.split("/");
              const oldFileName = parts[parts.length - 1];
              await supabase.storage
                .from("forms")
                .remove([`fields/${field.id}/${oldFileName}`]);
            }

            const file = field.attachment_file;
            const fileName = sanitizeFileName(file.name);
            const supaPath = `fields/${field.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("forms")
              .upload(supaPath, file, { upsert: true });

            if (uploadError)
              throw new Error(
                `Error en campo "${field.label}": ${uploadError.message}`,
              );

            attachmentUrl = `/api/storage/forms/${supaPath}`;
          } else if (field.attachment_url === "" && oldAttachmentUrl) {
            if (oldAttachmentUrl.includes("/api/storage/")) {
              const parts = oldAttachmentUrl.split("/");
              const oldFileName = parts[parts.length - 1];
              await supabase.storage
                .from("forms")
                .remove([`fields/${field.id}/${oldFileName}`]);
            }
            attachmentUrl = null;
          }

          const { attachment_file, id, ...fieldData } = field;
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

      // 3. ACTUALIZACIÓN FINAL
      const { error: finalFormError } = await supabase
        .from("forms")
        .update({ title, description, image_url: imageUrl, slug })
        .eq("id", currentFormId);

      if (finalFormError) throw finalFormError;

      // ESTRATEGIA DE LIMPIEZA DE CAMPOS ELIMINADOS
      const { data: existingFields } = await supabase
        .from("form_fields")
        .select("id, attachment_url")
        .eq("form_id", currentFormId);

      const currentIds = processedFields.map((f) => f.id).filter(Boolean);
      const fieldsToDelete =
        existingFields?.filter((f) => !currentIds.includes(f.id)) || [];

      if (fieldsToDelete.length > 0) {
        for (const f of fieldsToDelete) {
          if (f.attachment_url && f.attachment_url.includes("/api/storage/")) {
            const parts = f.attachment_url.split("/");
            const oldFileName = parts[parts.length - 1];
            await supabase.storage
              .from("forms")
              .remove([`fields/${f.id}/${oldFileName}`]);
          }
        }
        const idsToDelete = fieldsToDelete.map((f) => f.id);
        await supabase.from("form_fields").delete().in("id", idsToDelete);
      }

      const { error: fieldsError } = await supabase
        .from("form_fields")
        .upsert(processedFields);

      if (fieldsError) throw fieldsError;

      // Si era nuevo, inicializar integración Google
      if (!form) {
        toast.info("Iniciando integración con Google...");
        await initializeGoogleIntegration(currentFormId, title, slug, fields);
      }

      toast.success("Formulario guardado con éxito.");
      router.push("/admin/formularios");
    } catch (error) {
      console.error("Save Error:", error);
      toast.error(error.message || "Error desconocido al guardar");
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
