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
  FileSpreadsheet,
  Type,
  Hash,
  Mail,
  CalendarDays,
  CircleDot,
  ChevronDown,
  CheckSquare,
  AlignLeft,
  ImageIcon,
  FileUp,
  Columns2,
  ShieldCheck,
  Globe,
  Coins,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import QuestionImporter from "./QuestionImporter";
import { AdminFAB } from "@/components/admin/layout/AdminFAB";
import { AdminEditorPanel } from "@/components/admin/layout/AdminEditorPanel";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Blocks Picker ---
const FIELD_TYPES = [
  { type: "text",     label: "Texto",      icon: Type,        color: "text-sky-600",     bg: "bg-sky-50",     hover: "hover:border-sky-300" },
  { type: "number",   label: "Número",     icon: Hash,        color: "text-violet-600",  bg: "bg-violet-50",  hover: "hover:border-violet-300" },
  { type: "email",    label: "Email",      icon: Mail,        color: "text-rose-500",    bg: "bg-rose-50",    hover: "hover:border-rose-300" },
  { type: "date",     label: "Fecha",      icon: CalendarDays,color: "text-amber-600",   bg: "bg-amber-50",   hover: "hover:border-amber-300" },
  { type: "radio",    label: "Opción única",icon: CircleDot,  color: "text-emerald-600", bg: "bg-emerald-50", hover: "hover:border-emerald-300" },
  { type: "select",   label: "Desplegable",icon: ChevronDown, color: "text-teal-600",    bg: "bg-teal-50",    hover: "hover:border-teal-300" },
  { type: "checkbox", label: "Múltiple",   icon: CheckSquare, color: "text-indigo-600",  bg: "bg-indigo-50",  hover: "hover:border-indigo-300" },
  { type: "textarea", label: "Párrafo",    icon: AlignLeft,   color: "text-orange-600",  bg: "bg-orange-50",  hover: "hover:border-orange-300" },
  { type: "image",    label: "Imagen",     icon: ImageIcon,   color: "text-pink-600",    bg: "bg-pink-50",    hover: "hover:border-pink-300" },
  { type: "file",     label: "Archivo",    icon: FileUp,      color: "text-gray-600",    bg: "bg-gray-100",   hover: "hover:border-gray-400" },
];

function BlocksPicker({ onAdd, onImport }) {
  return (
    <div className="overflow-y-auto flex-1 p-5 pb-10 space-y-5">
      {/* Question types grid */}
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 px-1">
          Preguntas
        </p>
        <div className="grid grid-cols-2 gap-2">
          {FIELD_TYPES.map(({ type, label, icon: Icon, color, bg, hover }) => (
            <button
              key={type}
              type="button"
              onClick={() => onAdd(type)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border-2 border-transparent bg-white hover:bg-white transition-all text-left group active:scale-95",
                hover,
                "shadow-sm hover:shadow-md",
              )}
            >
              <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <span className={cn("text-[10px] font-black uppercase tracking-tight leading-tight", color)}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Structure */}
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 px-1">
          Estructura
        </p>
        <button
          type="button"
          onClick={() => onAdd("section")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-transparent bg-white hover:border-gray-800 hover:bg-white shadow-sm hover:shadow-md transition-all group active:scale-95"
        >
          <div className="p-2 rounded-xl bg-gray-100 shrink-0 group-hover:scale-110 transition-transform">
            <Columns2 className="w-5 h-5 text-gray-700" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-tight text-gray-800">Sección</span>
            <span className="text-[9px] text-gray-400 font-medium leading-tight">Agrupa preguntas en un bloque</span>
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Import */}
      <button
        type="button"
        onClick={onImport}
        className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-transparent bg-white hover:border-blue-400 hover:bg-white shadow-sm hover:shadow-md transition-all group active:scale-95"
      >
        <div className="p-2 rounded-xl bg-blue-50 shrink-0 group-hover:scale-110 transition-transform">
          <FileSpreadsheet className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black uppercase tracking-tight text-blue-600">Importar preguntas</span>
          <span className="text-[9px] text-gray-400 font-medium leading-tight">Copia campos de otro formulario</span>
        </div>
      </button>
    </div>
  );
}

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
  is_internal: z.boolean().default(false),
  is_financial: z.boolean().default(true),
  financial_field_label: z.string().optional().nullable(),
  max_responses: z.number().int().min(1).optional().nullable(),
  fields: z.array(fieldSchema),
}).superRefine((data, ctx) => {
  if (data.is_financial && !data.financial_field_label) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["financial_field_label"],
      message: "Debes seleccionar la pregunta del comprobante",
    });
  }
  if (!data.max_responses || data.max_responses < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["max_responses"],
      message: "Define un límite de respuestas para el formulario",
    });
  }
});

export default function FormBuilder({
  form: initialForm = {
    title: "",
    description: "",
    image_url: "",
    is_internal: false,
    is_financial: true,
    financial_field_label: "",
    fields: [],
  },
  onSave,
  onCancel,
  isSaving,
}) {

  const [activeFieldId, setActiveFieldId] = useState("header");
  const [headerFile, setHeaderFile] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  // Confirm Save Modal
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);

  // Panel Control (Single Drawer for everything)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelView, setPanelView] = useState("blocks"); // 'blocks' | 'importer'

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const lastScrollY = useRef(0);

  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Smart Header Logic
  useEffect(() => {
    // En nuestro layout, el scroll sucede en el <main>, no en el window
    const scrollableElement = containerRef.current?.closest("main") || window;

    const handleScroll = () => {
      const currentScrollY =
        scrollableElement === window
          ? window.scrollY
          : scrollableElement.scrollTop;

      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    scrollableElement.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => scrollableElement.removeEventListener("scroll", handleScroll);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      is_internal: false,
      is_financial: true,
      financial_field_label: "",
      max_responses: null,
      fields: [],
    },
    mode: "onChange",
  });

  const { fields, append, move, remove, insert } = useFieldArray({
    control: form.control,
    name: "fields",
    keyName: "rhf_id", // Prevenir que RHF sobrescriba nuestro 'id' de base de datos
  });

  const { errors, isValid } = form.formState;

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
        is_internal: initialForm.is_internal || false,
        is_financial: initialForm.is_financial ?? true,
        financial_field_label: initialForm.financial_field_label || "",
        max_responses: initialForm.max_responses ?? null,
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
      setIsPanelOpen(false); // Close panel on field add
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

  const handleImportQuestions = useCallback(
    (questions) => {
      const preparedQuestions = questions.map((q) => ({
        ...q,
        id: uuidv4(),
        options: q.options?.map((o) => ({ ...o, id: uuidv4() })),
      }));

      // Insertar después del campo activo o al final
      const activeIndex = fields.findIndex((f) => f.id === activeFieldId);
      if (activeIndex !== -1) {
        insert(activeIndex + 1, preparedQuestions);
      } else {
        append(preparedQuestions);
      }

      setIsPanelOpen(false); // Close panel on import
      toast.success(`${preparedQuestions.length} preguntas importadas`);
    },
    [activeFieldId, append, fields, insert],
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

  const confirmDeleteField = useCallback(
    (index) => {
      const fieldId = fields[index]?.id;
      remove(index);
      if (activeFieldId === fieldId) setActiveFieldId(null);
      // If this was the financial field, clear the financial_field_label
      const financialLabel = form.getValues("financial_field_label");
      if (financialLabel && fields[index]?.label === financialLabel) {
        form.setValue("financial_field_label", "");
      }
      toast.info("Elemento eliminado");
    },
    [remove, fields, activeFieldId, form],
  );

  const handleDeleteField = useCallback(
    (index) => {
      const financialLabel = form.getValues("financial_field_label");
      const isFinancial = form.getValues("is_financial");
      if (isFinancial && financialLabel && fields[index]?.label === financialLabel) {
        setPendingDeleteIndex(index);
        return;
      }
      confirmDeleteField(index);
    },
    [fields, form, confirmDeleteField],
  );

  const onInvalid = useCallback(
    (errors) => {
      if (errors.title) {
        toast.error("El título es obligatorio");
        setActiveFieldId("header");
        scrollToField("header");
        return;
      }

      if (errors.financial_field_label) {
        toast.error("Selecciona la pregunta del comprobante de pago", {
          description: "Con la conciliación financiera activa, debes indicar qué campo recopila el comprobante.",
          duration: 6000,
        });
        setActiveFieldId("header");
        scrollToField("header");
        return;
      }

      if (errors.max_responses) {
        toast.error("Define un límite de respuestas", {
          description: "Todos los formularios deben tener un número máximo de inscripciones.",
          duration: 6000,
        });
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
      setPendingSaveData(data);
      setIsConfirmSaveOpen(true);
    },
    [],
  );

  const confirmSave = async () => {
    if (!pendingSaveData) return;
    setIsConfirmSaveOpen(false);
    
    const orderedFields = pendingSaveData.fields.map((f, index) => ({
      ...f,
      order_index: index,
    }));
    await onSave({ ...pendingSaveData, fields: orderedFields }, headerFile);
    setPendingSaveData(null);
  };

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

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      onInvalid(form.formState.errors);
      return;
    }

    // Preparar los datos actuales (watch captura todo el estado del formulario)
    const currentData = {
      ...form.getValues(),
      form_fields: form.getValues("fields"),
    };

    // Guardar en sessionStorage para que la página de preview pueda leerlo
    sessionStorage.setItem("ap_form_preview_data", JSON.stringify(currentData));

    // Abrir en una nueva pestaña
    window.open("/admin/formularios/preview", "_blank");
  };

  const formTitle = useMemo(() => {
    return form.watch("title") || "Formulario sin título";
  }, [form.watch("title")]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Confirmation Save Modal */}
      <AlertDialog open={isConfirmSaveOpen} onOpenChange={setIsConfirmSaveOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 max-w-lg max-h-[90vh] overflow-y-auto">
          <VisuallyHidden>
            <AlertDialogTitle>Confirmar Guardado de Formulario</AlertDialogTitle>
          </VisuallyHidden>
          <div className="bg-black p-8 text-white rounded-t-[2.5rem]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--puembo-green)] flex items-center justify-center shrink-0">
                <Save className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold">¿Guardar cambios?</h2>
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-black">Revisa el resumen antes de confirmar</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {pendingSaveData?.is_internal ? (
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-tight text-white/40">Visibilidad</span>
                  </div>
                  <p className="text-sm font-bold">{pendingSaveData?.is_internal ? "Interno (Staff)" : "Público"}</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-[var(--puembo-green)]" />
                    <span className="text-[10px] font-black uppercase tracking-tight text-white/40">Financiero</span>
                  </div>
                  <p className="text-sm font-bold">{pendingSaveData?.is_financial ? "Activado" : "Desactivado"}</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-tight text-white/40">Límite</span>
                  </div>
                  <p className="text-sm font-bold">{pendingSaveData?.max_responses || "Sin límite"} registros</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Layout className="w-4 h-4 text-pink-400" />
                    <span className="text-[10px] font-black uppercase tracking-tight text-white/40">Estructura</span>
                  </div>
                  <p className="text-sm font-bold">{pendingSaveData?.fields?.length || 0} bloques</p>
                </div>
              </div>
              
              {pendingSaveData?.is_financial && (
                <div className="bg-[var(--puembo-green)]/10 rounded-2xl p-4 border border-[var(--puembo-green)]/20">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--puembo-green)] mb-1">Campo de Comprobante</p>
                  <p className="text-xs font-medium text-[var(--puembo-green)] break-words">{pendingSaveData?.financial_field_label}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-white flex gap-3 rounded-b-[2.5rem]">
            <Button 
              variant="ghost" 
              onClick={() => setIsConfirmSaveOpen(false)}
              className="flex-1 rounded-2xl h-14 font-bold uppercase tracking-widest text-[10px] border-gray-100 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmSave}
              className="flex-[2] rounded-2xl h-14 font-bold uppercase tracking-widest text-[10px] bg-black text-white hover:bg-gray-900 transition-all active:scale-95"
            >
              Confirmar y Guardar
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingDeleteIndex !== null} onOpenChange={(open) => { if (!open) setPendingDeleteIndex(null); }}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-xl font-black text-gray-900">
              ¿Eliminar la pregunta del comprobante?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 leading-relaxed">
              Esta pregunta está configurada como la que captura el comprobante financiero. Si la eliminas, tendrás que seleccionar otra o el formulario quedará sin configuración financiera completa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-full border-gray-100">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-red-500 hover:bg-red-600"
              onClick={() => { confirmDeleteField(pendingDeleteIndex); setPendingDeleteIndex(null); }}
            >
              Eliminar de todas formas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <TooltipProvider>
      {/* Premium Header */}
      <div
        className={cn(
          "sticky top-5 md:top-0 z-[10] w-full rounded-3xl bg-black text-white px-4 md:px-12 py-3 md:py-5 flex flex-row items-center justify-between gap-3 md:gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 ease-in-out",
          !isHeaderVisible
            ? "-translate-y-full opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto"
            : "translate-y-0 opacity-100",
        )}
      >
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="rounded-2xl text-white/60 hover:bg-[var(--puembo-green)] hover:text-black transition-all duration-300 h-10 w-10 md:h-12 md:w-12 shrink-0 border border-white/10 hover:border-transparent group"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div className="space-y-0.5 md:space-y-1 min-w-0">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                Editor
              </span>
              <ChevronRight className="w-3 h-3 text-white/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Builder
              </span>
            </div>
            <CardTitle className="text-base md:text-2xl font-serif font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md lg:max-w-2xl tracking-tight">
              {formTitle}
            </CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="ghost"
                  className="rounded-2xl px-3 md:px-6 font-bold border border-white/10 hover:bg-white/5 h-10 md:h-12 transition-all flex uppercase tracking-widest text-[10px] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePreview}
                  disabled={!isValid}
                >
                  <Eye className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Vista Previa</span>
                </Button>
              </span>
            </TooltipTrigger>
            {!isValid && (
              <TooltipContent className="rounded-xl bg-black text-white border-white/10 text-[10px] p-4">
                Completa todos los campos antes de hacer vista previa
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="green"
                  className="rounded-2xl px-4 md:px-8 font-bold shadow-[0_0_30px_rgba(var(--puembo-green-rgb),0.3)] hover:shadow-[0_0_40px_rgba(var(--puembo-green-rgb),0.5)] transition-all hover:scale-[1.02] active:scale-95 h-10 md:h-12 uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                  onClick={form.handleSubmit(handleSave, onInvalid)}
                  disabled={isSaving || !isValid}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin md:mr-2" />
                  ) : (
                    <Save className="w-4 h-4 md:mr-2" />
                  )}
                  <span className="hidden md:inline">{isSaving ? "Guardando..." : "Guardar"}</span>
                </Button>
              </span>
            </TooltipTrigger>
            {!isValid && (
              <TooltipContent className="rounded-xl bg-black text-white border-white/10 text-[10px] p-4">
                Completa todos los campos antes de guardar
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
      </TooltipProvider>

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
                  <FloatingToolbar
                    onAdd={handleAddField}
                    onOpenImporter={() => {
                      setPanelView("importer");
                      setIsPanelOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <AdminFAB
              onClick={() => {
                setPanelView("blocks");
                setIsPanelOpen(true);
              }}
              label="BLOQUES"
              icon={Plus}
              data-panel
              className="lg:hidden"
            />

            <AdminEditorPanel
              open={isPanelOpen}
              onOpenChange={setIsPanelOpen}
              title={
                panelView === "blocks" ? (
                  <>
                    Añadir{" "}
                    <span className="text-[var(--puembo-green)] italic">
                      Contenido
                    </span>
                  </>
                ) : (
                  <>
                    Importar{" "}
                    <span className="text-blue-500 italic">Preguntas</span>
                  </>
                )
              }
              description={
                panelView === "blocks"
                  ? "Selecciona el tipo de bloque que deseas añadir al formulario."
                  : "Selecciona un formulario existente para copiar sus campos."
              }
              data-panel
            >
              {panelView === "blocks" ? (
                <BlocksPicker onAdd={handleAddField} onImport={() => setPanelView("importer")} />
              ) : (
                <QuestionImporter
                  onImport={handleImportQuestions}
                  onCancel={() => setIsPanelOpen(false)}
                />
              )}
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
