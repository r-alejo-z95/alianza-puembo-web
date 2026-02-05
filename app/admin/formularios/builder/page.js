"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import FormBuilder from "@/components/admin/forms/builder/FormBuilder";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { initializeGoogleIntegration } from "@/lib/actions";
import { slugify } from "@/lib/utils";

function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formSlug = searchParams.get("slug");
  const formId = searchParams.get("id");
  const isInternalParam = searchParams.get("internal") === "true";
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(!!(formSlug || formId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (formSlug || formId) {
      const fetchForm = async () => {
        const supabase = createClient();
        let query = supabase
          .from("forms")
          .select("*, form_fields(*)")
          .eq("is_archived", false);

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
          setForm(data);
        }
        setLoading(false);
      };
      fetchForm();
    } else {
      // Si es nuevo y viene con el param internal, preparamos un objeto parcial
      if (isInternalParam) {
        setForm({ is_internal: true });
      }
    }
  }, [formSlug, formId, isInternalParam, router]);

  const handleSave = async (formData, imageFile) => {
    setSaving(true);
    const supabase = createClient();
    const { title, description, fields, image_url: formImageUrl, is_internal, is_financial, financial_field_label } = formData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let currentFormId = form?.id;
    let imageUrl = formImageUrl || form?.image_url || null;
    const slug = form && form.title === title ? form.slug : slugify(title);

    try {
      // 0. Create Form if new
      if (!currentFormId) {
        const { data: newForm, error: formError } = await supabase
          .from("forms")
          .insert([{ title, description, user_id: user?.id, slug, is_internal, is_financial, financial_field_label }])
          .select()
          .single();

        if (formError || !newForm) throw formError;
        currentFormId = newForm.id;
      }

      // 1. Handle Header Image
      if (imageFile) {
        // Cleanup old
        if (form?.image_url && form.image_url.includes("/api/storage/")) {
          const oldName = form.image_url.split("/").pop();
          await supabase.storage
            .from("forms")
            .remove([`header/${currentFormId}/${oldName}`]);
        }
        const fileName = sanitizeFileName(imageFile.name);
        const supaPath = `header/${currentFormId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("forms")
          .upload(supaPath, imageFile, { upsert: true });
        if (uploadError)
          throw new Error("Error subiendo portada: " + uploadError.message);
        imageUrl = `/api/storage/forms/${supaPath}`;
      } else if (formImageUrl === "" && form?.image_url) {
        // Explicit removal
        if (form.image_url.includes("/api/storage/")) {
          const oldName = form.image_url.split("/").pop();
          await supabase.storage
            .from("forms")
            .remove([`header/${currentFormId}/${oldName}`]);
        }
        imageUrl = null;
      }

      // 2. Process Fields
      const processedFields = await Promise.all(
        fields.map(async (field) => {
          let attachmentUrl = field.attachment_url;

          // Check for new file upload in attachment_file prop (passed from builder)
          if (field.attachment_file) {
            const file = field.attachment_file;
            const fileName = sanitizeFileName(file.name);
            const supaPath = `fields/${field.id}/${fileName}`;
            const { error: upErr } = await supabase.storage
              .from("forms")
              .upload(supaPath, file, { upsert: true });
            if (upErr)
              throw new Error(
                `Error en adjunto de "${field.label}": ` + upErr.message,
              );
            attachmentUrl = `/api/storage/forms/${supaPath}`;
          } else if (attachmentUrl && attachmentUrl.includes("/fields/")) {
            // Check if it's an IMPORTED attachment (path doesn't match current field.id)
            const pathParts = attachmentUrl.split("/fields/")[1].split("/");
            const originalFieldId = pathParts[0];
            const fileName = pathParts[1];

            if (originalFieldId !== field.id) {
              // Deep copy: Create a new file copy for the imported question
              const sourcePath = `fields/${originalFieldId}/${fileName}`;
              const destPath = `fields/${field.id}/${fileName}`;
              
              const { error: copyErr } = await supabase.storage
                .from("forms")
                .copy(sourcePath, destPath);
              
              if (!copyErr) {
                attachmentUrl = `/api/storage/forms/${destPath}`;
              } else {
                console.error("Error copying imported attachment:", copyErr);
              }
            }
          }

          // Sanitize for DB
          const { attachment_file, id, ...rest } = field;
          return {
            id,
            form_id: currentFormId,
            ...rest,
            attachment_url: attachmentUrl,
            options: rest.options ? rest.options : null, // ensure null if empty for cleaner JSON
          };
        }),
      );

      // 3. Update Form Metadata
      const { error: metaErr } = await supabase
        .from("forms")
        .update({ title, description, image_url: imageUrl, slug, is_internal, is_financial, financial_field_label })
        .eq("id", currentFormId);
      if (metaErr) throw metaErr;

      // 4. Sync Fields (Delete removed ones)
      const { data: existingFields } = await supabase
        .from("form_fields")
        .select("id")
        .eq("form_id", currentFormId);
      const currentIds = processedFields.map((f) => f.id);
      const toDelete =
        existingFields
          ?.filter((f) => !currentIds.includes(f.id))
          .map((f) => f.id) || [];

      if (toDelete.length > 0) {
        await supabase.from("form_fields").delete().in("id", toDelete);
      }

      const { error: fieldsErr } = await supabase
        .from("form_fields")
        .upsert(processedFields);
      if (fieldsErr) throw fieldsErr;

      // 5. Google Integration (New forms only, and only if NOT internal)
      if (!form?.id && !is_internal) {
        toast.info("Conectando con Google Sheets...");
        await initializeGoogleIntegration(currentFormId, title, slug, fields);
      }

      toast.success("Formulario guardado correctamente.");
      // Redirigir según el estado final del toggle
      router.push(is_internal ? "/admin/staff" : "/admin/formularios");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Error al guardar");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Si el formulario es interno o el param dice que lo es, volvemos a staff
    if (form?.is_internal || isInternalParam) {
      router.push("/admin/staff");
    } else {
      router.push("/admin/formularios");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center space-y-4 bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--puembo-green)] opacity-50" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Cargando FormBuilder
        </p>
      </div>
    );
  }

  return (
    <FormBuilder
      form={form}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={saving}
    />
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-gray-50" />}>
      <BuilderContent />
    </Suspense>
  );
}
