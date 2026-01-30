"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ArrowLeft,
  Eye,
  Layout,
  Plus,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import FormCanvas from "./FormCanvas";
import FloatingToolbar from "./FloatingToolbar";
import { AdminFAB } from "@/components/admin/layout/AdminFAB";
import { AdminEditorPanel } from "@/components/admin/layout/AdminEditorPanel";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Schemas ---
const fieldSchema = z.object({
  id: z.string().default(() => uuidv4()),
  type: z.string(),
  label: z.string().min(1, "Label requerido"),
  help_text: z.string().optional().nullable(),
  options: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
        label: z.string(),
        next_section_id: z.string().optional().nullable(),
      }),
    )
    .optional()
    .nullable(),
  required: z.boolean().default(false),
  order_index: z.number().default(0),
  placeholder: z.string().optional().nullable(),
  attachment_url: z.string().optional().nullable(),
  attachment_type: z.string().optional().nullable(),
  attachment_file: z.any().optional().nullable(),
  next_section_id: z.string().optional().nullable(),
});

const formSchema = z.object({
  title: z.string().min(3, "Título requerido"),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  fields: z.array(fieldSchema),
});

export default function FormBuilder({
  form: initialForm,
  onSave,
  onCancel,
  isSaving,
}) {
  const [activeFieldId, setActiveFieldId] = useState("header");
  const [headerFile, setHeaderFile] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      fields: [],
    },
    mode: "onBlur",
  });

  const { fields, append, move, remove, insert } = useFieldArray({
    control: form.control,
    name: "fields",
    keyName: "rhf_id", // Prevenir que RHF sobrescriba nuestro 'id' de base de datos
  });

  const { errors } = form.formState;

  // Sync initial data
  useEffect(() => {
    if (initialForm) {
      const preparedFields = (initialForm.form_fields || [])
        .map((f) => ({
          ...f,
          id: f.id || uuidv4(),
          type: f.type || f.field_type,
          required: f.required ?? f.is_required,
          order_index: f.order_index ?? f.order,
          options: (f.options || []).map((o) => ({
            ...o,
            id: o.id || uuidv4(),
            value: o.value || o.label,
          })),
        }))
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

      form.reset({
        title: initialForm.title || "",
        description: initialForm.description || "",
        image_url: initialForm.image_url || "",
        fields: preparedFields,
      });
    }
  }, [initialForm, form]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollToField = useCallback((id, index = null, behavior = "smooth") => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        let element = null;
        if (index !== null) {
          element = document.getElementById(`field-card-${index}`);
        }
        if (!element && id) {
          element = document.querySelector(`[data-field-id="${id}"]`);
        }
        if (!element && id) {
          element = document.getElementById(`field-${id}`);
        }

        if (element) {
          element.scrollIntoView({
            behavior,
            block: "center",
            inline: "nearest",
          });

          element.classList.add("highlight-pulse-effect");
          setTimeout(
            () => element.classList.remove("highlight-pulse-effect"),
            2000,
          );
        }
      });
    }, 300);
  }, []);

  /**
   * handleFieldClick mejorado: Solo activa el campo.
   * Evitamos el toggle para prevenir cierres accidentales al clickar dentro.
   */
  const handleFieldClick = useCallback((fieldId) => {
    setActiveFieldId(fieldId);
  }, []);

  /**
   * Detectar clicks fuera de los campos activos para cerrarlos
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!activeFieldId) return;

      // Un enfoque robusto basado en clases y elementos interactivos
      const isInsideSafeZone =
        event.target.closest(".field-card-container") ||
        event.target.closest(".form-header-card") ||
        event.target.closest("[data-toolbar]") ||
        event.target.closest("[data-panel]") ||
        event.target.closest("button") ||
        event.target.closest("input") ||
        event.target.closest("textarea") ||
        event.target.closest("label") ||
        event.target.closest(".tiptap") ||
        event.target.closest(".ProseMirror") ||
        event.target.closest("[data-radix-popper-content-wrapper]") ||
        event.target.closest(".radix-portal") ||
        event.target.closest(".sonner-toast");

      // Si el click no es dentro de una zona segura, cerramos el estado activo
      if (!isInsideSafeZone) {
        setActiveFieldId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeFieldId]);

  const handleAddField = useCallback(
    (type) => {
      const newFieldId = uuidv4();
      const newField = {
        id: newFieldId,
        type,
        label: "",
        required: false,
        options: ["radio", "checkbox", "select"].includes(type)
          ? [{ id: uuidv4(), label: "Opción 1", value: uuidv4() }]
          : [],
        order_index: fields.length,
      };

      const activeIndex = fields.findIndex((f) => f.id === activeFieldId);
      let targetIndex;

      if (activeIndex !== -1) {
        targetIndex = activeIndex + 1;
        insert(targetIndex, newField);
      } else {
        targetIndex = fields.length;
        append(newField);
      }

      setActiveFieldId(newFieldId);
      setIsMobilePanelOpen(false);
      scrollToField(newFieldId, targetIndex);

      toast.success(`${type === "section" ? "Sección" : "Pregunta"} añadida`, {
        description: "Personaliza tu nuevo bloque",
        icon:
          type === "section" ? (
            <Layout className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          ),
      });
    },
    [activeFieldId, append, fields, insert, scrollToField],
  );

  const handleDuplicateField = useCallback(
    (index) => {
      const field = form.getValues(`fields.${index}`);
      const newId = uuidv4();
      const newField = {
        ...field,
        id: newId,
        label: field.label ? `${field.label} (Copia)` : "",
        options: field.options?.map((o) => ({ ...o, id: uuidv4() })),
      };

      const targetIndex = index + 1;
      insert(targetIndex, newField);
      setActiveFieldId(newId);

      scrollToField(newId, targetIndex);
      toast.success("Elemento duplicado");
    },
    [form, insert, scrollToField],
  );

  const handleDeleteField = useCallback(
    (index) => {
      const fieldId = fields[index]?.id;
      remove(index);
      if (activeFieldId === fieldId) setActiveFieldId(null);
      toast.info("Elemento eliminado");
    },
    [remove, fields, activeFieldId],
  );

  const onInvalid = useCallback(
    (errors) => {
      if (errors.title) {
        toast.error("El título es obligatorio");
        setActiveFieldId("header");
        scrollToField("header");
        return;
      }

      if (errors.fields) {
        const fieldIndices = Object.keys(errors.fields)
          .filter((key) => !isNaN(key))
          .map((key) => parseInt(key))
          .sort((a, b) => a - b);

        if (fieldIndices.length > 0) {
          const firstErrorIndex = fieldIndices[0];
          const field = fields[firstErrorIndex];
          toast.error(`Revisa el bloque #${firstErrorIndex + 1}`);
          if (field?.id) {
            setActiveFieldId(field.id);
            scrollToField(field.id, firstErrorIndex);
          }
        }
      }
    },
    [fields, scrollToField],
  );

  const handleSave = useCallback(
    async (data) => {
      const orderedFields = data.fields.map((f, index) => ({
        ...f,
        order_index: index,
      }));
      await onSave({ ...data, fields: orderedFields }, headerFile);
    },
    [onSave, headerFile],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = fields.findIndex((f) => f.rhf_id === active.id);
        const newIndex = fields.findIndex((f) => f.rhf_id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          move(oldIndex, newIndex);
        }
      }
      setActiveDragId(null);
    },
    [fields, move],
  );

  const formTitle = useMemo(() => {
    return form.watch("title") || "Formulario sin título";
  }, [form.watch("title")]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Premium Header */}
      <div className="sticky top-0 z-[100] w-full bg-black text-white px-6 md:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.1)] backdrop-blur-md bg-black/95">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="rounded-2xl text-white/60 hover:bg-[var(--puembo-green)] hover:text-black transition-all duration-300 h-12 w-12 shrink-0 border border-white/10 hover:border-transparent group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                Editor
              </span>
              <ChevronRight className="w-3 h-3 text-white/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Builder
              </span>
            </div>
            <CardTitle className="text-xl md:text-2xl font-serif font-bold text-white truncate max-w-xs md:max-w-md lg:max-w-2xl tracking-tight">
              {formTitle}
            </CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-2xl px-6 py-6 font-bold border border-white/10 hover:bg-white/5 h-12 transition-all lg:flex hidden uppercase tracking-widest text-[10px] text-gray-400 hover:text-white"
            onClick={() =>
              window.open(`/formularios/${initialForm?.slug}`, "_blank")
            }
            disabled={!initialForm?.slug}
          >
            <Eye className="w-4 h-4 mr-2" /> Vista Previa
          </Button>
          <Button
            variant="green"
            className="rounded-2xl px-8 py-6 font-bold shadow-[0_0_30px_rgba(var(--puembo-green-rgb),0.3)] hover:shadow-[0_0_40px_rgba(var(--puembo-green-rgb),0.5)] transition-all hover:scale-[1.02] active:scale-95 h-12 uppercase tracking-widest text-[10px]"
            onClick={form.handleSubmit(handleSave, onInvalid)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            <span>{isSaving ? "Guardando..." : "Guardar Formulario"}</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-4">
        <FormProvider {...form}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveDragId(active.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex w-full relative min-h-[600px] justify-center items-start gap-8">
              {/* Form Canvas */}
              <div className="flex-1 max-w-3xl">
                <FormCanvas
                  fields={fields}
                  activeFieldId={activeFieldId}
                  onActivateField={handleFieldClick}
                  headerFile={headerFile}
                  setHeaderFile={setHeaderFile}
                  onDuplicate={handleDuplicateField}
                  onDelete={handleDeleteField}
                  errors={errors}
                />
              </div>

              {/* Floating Desktop Toolbar */}
              <div className="hidden lg:block w-20 relative" data-toolbar>
                <div className="fixed top-48">
                  <FloatingToolbar onAdd={handleAddField} />
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <AdminFAB
              onClick={() => setIsMobilePanelOpen(true)}
              label="BLOQUES"
              icon={Plus}
              data-panel
              className="lg:hidden"
            />

            <AdminEditorPanel
              open={isMobilePanelOpen}
              onOpenChange={setIsMobilePanelOpen}
              title={
                <>
                  Añadir{" "}
                  <span className="text-[var(--puembo-green)] italic">
                    Contenido
                  </span>
                </>
              }
              description="Selecciona el tipo de bloque que deseas añadir al formulario."
              data-panel
            >
              <div className="grid grid-cols-1 gap-4 p-4 pb-12">
                <Button
                  onClick={() => handleAddField("text")}
                  variant="outline"
                  className="h-24 flex items-center justify-start gap-6 px-8 rounded-3xl border-2 border-gray-100 hover:border-[var(--puembo-green)] hover:bg-gray-50 transition-all text-left wrap-break-words"
                >
                  <div className="p-3 bg-[var(--puembo-green)]/10 rounded-2xl wrap-normal">
                    <Plus className="w-6 h-6 text-[var(--puembo-green)]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black uppercase tracking-widest text-[10px]">
                      Pregunta
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Añade un campo de entrada
                    </span>
                  </div>
                </Button>
                <Button
                  onClick={() => handleAddField("section")}
                  variant="outline"
                  className="h-24 flex items-center justify-start gap-6 px-8 rounded-3xl border-2 border-gray-100 hover:border-black hover:bg-gray-50 transition-all text-left wrap-break-words"
                >
                  <div className="p-3 bg-black/5 rounded-2xl">
                    <Layout className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black uppercase tracking-widest text-[10px]">
                      Sección
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Organiza por grupos de preguntas
                    </span>
                  </div>
                </Button>
              </div>
            </AdminEditorPanel>

            {/* Dragging Preview */}
            <DragOverlay>
              {activeDragId ? (
                <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-[var(--puembo-green)] opacity-95 flex items-center gap-4 w-full h-52 backdrop-blur-md ring-8 ring-black/5">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[var(--puembo-green)]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-black text-xs text-black uppercase tracking-tight">
                      Reordenando
                    </span>
                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">
                      Suelte para colocar
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </FormProvider>
      </div>
    </div>
  );
}
