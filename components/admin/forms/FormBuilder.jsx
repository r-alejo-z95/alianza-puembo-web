"use client";

import { useState, useEffect, useRef } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PlusCircle,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Type,
  CheckSquare,
  CircleDot,
  FileUp,
  X,
  AlignLeft,
  Hash,
  Mail,
  Calendar as CalendarIcon,
  Paperclip,
  Loader2,
  Plus,
  Layout,
  Settings,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import RichTextEditor from "./RichTextEditor";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Dnd Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Zod Schemas ---
const fieldSchema = z.object({
  id: z.string().default(() => uuidv4()),
  type: z.enum([
    "text",
    "textarea",
    "number",
    "email",
    "date",
    "radio",
    "checkbox",
    "file",
    "image",
  ]),
  label: z.string().min(1, "El label es requerido."),
  options: z
    .array(
      z.object({
        id: z.string().default(() => uuidv4()),
        value: z.string(),
        label: z.string().min(1, "Label requerido."),
      })
    )
    .optional()
    .nullable(),
  required: z.boolean().default(false),
  order_index: z.number().default(0),
  placeholder: z.string().optional().nullable(),
  attachment_url: z.string().optional().nullable(),
  attachment_type: z.string().optional().nullable(),
});

const formSchema = z.object({
  title: z.string().min(3, "Título requerido."),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable().or(z.literal("")),
  fields: z.array(fieldSchema),
});

const FIELD_TYPES = {
  text: { label: "Texto Corto", icon: <Type className="w-4 h-4" /> },
  textarea: { label: "Párrafo", icon: <AlignLeft className="w-4 h-4" /> },
  number: { label: "Número", icon: <Hash className="w-4 h-4" /> },
  email: { label: "Email", icon: <Mail className="w-4 h-4" /> },
  date: { label: "Fecha", icon: <CalendarIcon className="w-4 h-4" /> },
  radio: { label: "Opción Múltiple", icon: <CircleDot className="w-4 h-4" /> },
  checkbox: { label: "Casillas", icon: <CheckSquare className="w-4 h-4" /> },
  file: { label: "Subir Archivo", icon: <FileUp className="w-4 h-4" /> },
  image: { label: "Subir Imagen", icon: <ImageIcon className="w-4 h-4" /> },
};

// --- Subcomponents ---

function FieldCard({
  field,
  index,
  form,
  isActive,
  activeId,
  setActiveId,
  onRemove,
  onUpdateFieldType,
  onUploadAttachment,
  dragHandleProps,
}) {
  const attachmentInputRef = useRef(null);

  const currentField = useWatch({
    control: form.control,
    name: `fields.${index}`,
    defaultValue: field,
  });

  const handleCardClick = (e) => {
    if (
      e.target.closest(
        'input, button, textarea, select, [role="button"], [role="switch"], .tiptap'
      )
    )
      return;
    e.stopPropagation();
    if (activeId !== field.id) setActiveId(field.id);
  };

  const addOption = () => {
    const currentOptions = form.getValues(`fields.${index}.options`) || [];
    form.setValue(
      `fields.${index}.options`,
      [...currentOptions, { id: uuidv4(), value: "", label: "" }],
      { shouldDirty: true }
    );
  };

  const removeOption = (optIndex) => {
    const currentOptions = form.getValues(`fields.${index}.options`) || [];
    form.setValue(
      `fields.${index}.options`,
      currentOptions.filter((_, i) => i !== optIndex),
      { shouldDirty: true }
    );
  };

  return (
    <Card
      className={cn(
        "transition-all duration-500 rounded-[2.5rem] border-2 bg-white overflow-hidden field-card-container",
        isActive
          ? "border-[var(--puembo-green)] shadow-2xl z-10 -translate-y-1"
          : "border-gray-100 hover:border-gray-200 shadow-sm"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-8 md:p-10">
        {isActive ? (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-grow space-y-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <FormField
                    control={form.control}
                    name={`fields.${index}.label`}
                    render={({ field: inputField }) => (
                      <Input
                        placeholder="Escribe la pregunta aquí..."
                        className="text-xl font-bold font-serif border-none px-0 h-auto focus-visible:ring-0 bg-transparent border-b-2 border-gray-100 focus:border-[var(--puembo-green)] rounded-none transition-all flex-grow"
                        {...inputField}
                        value={inputField.value || ""}
                      />
                    )}
                  />

                  {!currentField.attachment_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => attachmentInputRef.current?.click()}
                      className="rounded-full border-dashed text-gray-400 hover:text-[var(--puembo-green)] hover:border-[var(--puembo-green)] h-10 px-4 gap-2"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Adjuntar
                      </span>
                    </Button>
                  )}
                  <input
                    type="file"
                    ref={attachmentInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      onUploadAttachment(index, e.target.files[0])
                    }
                  />
                </div>

                {currentField.attachment_url && (
                  <div className="relative group w-fit rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 p-2">
                    {currentField.attachment_type === "image" ? (
                      <img
                        src={currentField.attachment_url}
                        alt="Ref"
                        className="max-h-64 rounded-[1.5rem] object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--puembo-green)]/10 flex items-center justify-center text-[var(--puembo-green)]">
                          <FileUp className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">
                            Documento de referencia
                          </p>
                          <p className="text-xs text-gray-400">PDF / DOC</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-lg"
                        onClick={() => {
                          form.setValue(`fields.${index}.attachment_url`, "");
                          form.setValue(`fields.${index}.attachment_type`, "");
                          form.setValue(
                            `fields.${index}.attachment_file`,
                            null
                          );
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {(currentField.type === "radio" ||
                  currentField.type === "checkbox") && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-50 mt-6">
                    {currentField.options?.map((option, optionIndex) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-3 group"
                      >
                        {currentField.type === "radio" ? (
                          <CircleDot className="w-4 h-4 text-gray-300" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-gray-300" />
                        )}
                        <FormField
                          control={form.control}
                          name={`fields.${index}.options.${optionIndex}.label`}
                          render={({ field: optionField }) => (
                            <Input
                              placeholder={`Opción ${optionIndex + 1}`}
                              className="flex-grow h-10 border-none bg-gray-50/50 rounded-xl focus:bg-white transition-all px-4"
                              {...optionField}
                              value={optionField.value || ""}
                              onChange={(e) => {
                                optionField.onChange(e);
                                const val = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "_");
                                form.setValue(
                                  `fields.${index}.options.${optionIndex}.value`,
                                  val || uuidv4()
                                );
                              }}
                            />
                          )}
                        />
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-300 hover:text-red-400"
                          onClick={() => removeOption(optionIndex)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[var(--puembo-green)] hover:bg-green-50 rounded-full font-bold uppercase text-[10px] tracking-widest mt-2"
                      onClick={addOption}
                    >
                      <Plus className="w-3 h-3 mr-2" /> Añadir opción
                    </Button>
                  </div>
                )}

                {["text", "textarea", "email", "number"].includes(
                  currentField.type
                ) && (
                  <FormField
                    control={form.control}
                    name={`fields.${index}.placeholder`}
                    render={({ field: inputField }) => (
                      <Input
                        placeholder="Texto de ayuda (ej: Juan Pérez)"
                        className="text-sm text-gray-400 border-none border-b border-gray-100 rounded-none px-0 focus-visible:ring-0 bg-transparent mt-4"
                        {...inputField}
                      />
                    )}
                  />
                )}
              </div>

              <div className="w-full lg:w-64 space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Tipo de Respuesta
                  </span>
                  <Select
                    value={currentField.type}
                    onValueChange={(v) => onUpdateFieldType(index, v)}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {Object.entries(FIELD_TYPES).map(
                        ([key, { label, icon }]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-3">
                              <div className="text-[var(--puembo-green)]">
                                {icon}
                              </div>
                              <span className="font-medium">{label}</span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-gray-50 mt-4">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors group"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Eliminar
                  </span>
                </button>
                <div className="h-4 w-px bg-gray-100" />
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Obligatorio
                  </span>
                  <FormField
                    control={form.control}
                    name={`fields.${index}.required`}
                    render={({ field: itemField }) => (
                      <Switch
                        checked={itemField.value}
                        onCheckedChange={itemField.onChange}
                      />
                    )}
                  />
                </div>
              </div>
              <div
                className="cursor-move p-2 rounded-xl bg-gray-50 text-gray-300 hover:text-gray-600 transition-colors"
                {...dragHandleProps}
              >
                <GripVertical className="w-5 h-5" />
              </div>
            </div>
          </div>
        ) : (
          <div className="group flex items-start justify-between">
            <div className="space-y-4 flex-grow">
              <div className="space-y-1">
                <p className="text-xl font-serif font-bold text-gray-900">
                  {currentField.label || "Pregunta sin título"}
                  {currentField.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)] opacity-60">
                    {FIELD_TYPES[currentField.type]?.icon}
                    <span>{FIELD_TYPES[currentField.type]?.label}</span>
                  </div>
                  {currentField.placeholder && (
                    <p className="text-[10px] text-gray-400 italic">
                      Placeholder: "{currentField.placeholder}"
                    </p>
                  )}
                </div>
              </div>

              {currentField.attachment_url && (
                <div className="mt-4">
                  {currentField.attachment_type === "image" ? (
                    <img
                      src={currentField.attachment_url}
                      alt="Ref"
                      className="max-h-48 rounded-2xl border border-gray-100"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-4 py-2 rounded-full w-fit font-bold">
                      <Paperclip className="w-3 h-3" /> Ver adjunto
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                {["text", "email", "number"].includes(currentField.type) && (
                  <div className="h-1 w-24 bg-gray-100 rounded-full" />
                )}
                {currentField.type === "textarea" && (
                  <div className="h-1 w-48 bg-gray-100 rounded-full" />
                )}
                {(currentField.type === "radio" ||
                  currentField.type === "checkbox") && (
                  <div className="space-y-2 mt-4 border-l-2 border-gray-50 pl-4">
                    {currentField.options?.map((option, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {currentField.type === "radio" ? (
                          <CircleDot className="w-3 h-3 text-gray-300" />
                        ) : (
                          <CheckSquare className="w-3 h-3 text-gray-300" />
                        )}
                        <span className="text-sm text-gray-500 font-light">
                          {option.label || `Opción ${i + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move p-2"
              {...dragHandleProps}
            >
              <GripVertical className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ToolsSidebar({ onAddField }) {
  return (
    <div className="sticky top-28 flex flex-col gap-2 bg-black p-3 rounded-[2rem] shadow-2xl w-fit h-fit border border-white/10">
      <div className="flex flex-col gap-2 items-center">
        <TooltipButton
          onClick={() => onAddField("text")}
          icon={<Plus className="w-6 h-6" />}
          label="Nueva Pregunta"
          className="bg-[var(--puembo-green)] text-white hover:bg-[var(--puembo-green)]/90 hover:scale-110 transition-all mb-2"
        />
        <div className="w-8 h-px bg-white/10 my-1" />
        {Object.entries(FIELD_TYPES).map(([type, info]) => (
          <TooltipButton
            key={type}
            onClick={() => onAddField(type)}
            icon={info.icon}
            label={info.label}
          />
        ))}
      </div>
    </div>
  );
}

function TooltipButton({ onClick, icon, label, className }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 w-12 h-12 transition-all",
              className
            )}
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="bg-white text-black font-bold text-[10px] uppercase tracking-widest border-none shadow-xl px-4 py-2 rounded-full"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// --- Main Builder ---
export default function FormBuilder({
  form: initialForm,
  onSave,
  onCancel,
  isSaving,
}) {
  const [imageFile, setImageFile] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  const fileInputRef = useRef(null);

  const onInvalid = (errors) => {
    // Auto-scroll al primer error
    if (errors.title) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (errors.fields) {
      const firstErrorIndex = Object.keys(errors.fields)[0];
      const element = document.getElementById(`field-card-${firstErrorIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const fieldId = fields[firstErrorIndex]?.id;
        if (fieldId) setActiveId(fieldId);
      }
    }

    if (Object.keys(errors).length > 0) {
      toast.error("Hay errores en el formulario. Revisa los campos marcados.");
    } else {
      toast.error("Error de validación inesperado.");
    }
  };

  const handleGlobalClick = (e) => {
    // Si el clic NO es dentro de una tarjeta de pregunta o el header del form, cerramos el modo edición
    if (!e.target.closest('.field-card-container') && !e.target.closest('.form-header-card')) {
      setActiveId(null);
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", image_url: "", fields: [] },
  });

  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (initialForm) {
      const prepared = (initialForm.form_fields || [])
        .map((f) => ({
          ...f,
          id: f.id || uuidv4(),
          type: f.type || f.field_type,
          required: f.required ?? f.is_required,
          order_index: f.order_index ?? f.order,
          options: (f.options || []).map((o) => ({
            ...o,
            id: o.id || uuidv4(),
            value: o.value || o.label.toLowerCase().replace(/[^a-z0-9]+/g, ""),
          })),
        }))
        .sort((a, b) => a.order_index - b.order_index);
      form.reset({
        title: initialForm.title || "",
        description: initialForm.description || "",
        image_url: initialForm.image_url || "",
        fields: prepared,
      });
    }
  }, [initialForm, form]);

  const addField = (type) => {
    const id = uuidv4();
    append({
      id,
      type,
      label: "",
      options: ["radio", "checkbox"].includes(type)
        ? [{ value: "", label: "", id: uuidv4() }]
        : undefined,
      required: false,
      order_index: fields.length,
    });
    setActiveId(id);
  };

  const updateFieldType = (index, type) => {
    const data = form.getValues(`fields.${index}`);
    const needsOptions = ["radio", "checkbox"].includes(type);
    const updated = {
      ...data,
      type,
      options: needsOptions
        ? data.options?.length
          ? data.options
          : [{ value: "", label: "", id: uuidv4() }]
        : undefined,
    };
    Object.keys(updated).forEach((k) =>
      form.setValue(`fields.${index}.${k}`, updated[k])
    );
  };

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id)
      move(
        fields.findIndex((f) => f.id === active.id),
        fields.findIndex((f) => f.id === over.id)
      );
    setActiveDragId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 cursor-default" onClick={handleGlobalClick}>
      {/* Top Controls */}
      <div className="sticky top-[73px] z-[55] bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 pt-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <Layout className="w-5 h-5 text-gray-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:inline-block">
            Editor de Estructura
          </span>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button
            variant="ghost"
            className="rounded-full px-4 md:px-6 text-gray-400 font-bold h-10 md:h-auto"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Cerrar</span>
          </Button>
          <Button
            variant="green"
            className="rounded-full px-6 md:px-8 py-5 md:py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 h-10 md:h-auto"
            onClick={(e) => {
              e.stopPropagation();
              form.handleSubmit((d) =>
                onSave(
                  {
                    ...d,
                    fields: d.fields.map((f, i) => ({ ...f, order_index: i })),
                  },
                  imageFile
                )
              , onInvalid)();
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
            ) : (
              <Save className="w-4 h-4 md:mr-2" />
            )}
            <span className="hidden md:inline">
              {isSaving ? "Guardando..." : "Guardar Diseño"}
            </span>
          </Button>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto pt-8 px-4 md:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative">
        <div className="col-span-1 md:col-span-10 space-y-8 md:space-y-10 w-full max-w-full">
          <FormProvider {...form}>
          {/* Header Card Editorial */}
          <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden group form-header-card" onClick={(e) => e.stopPropagation()}>
            {/* Area de Imagen (Banner) */}
            <div className="relative h-40 md:h-56 bg-black overflow-hidden flex items-center justify-center">
                {imageFile || initialForm?.image_url ? (
                    <img src={imageFile ? URL.createObjectURL(imageFile) : initialForm.image_url} alt="Header" className="w-full h-full object-cover opacity-50" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-white/30 text-center px-4">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Portada del Formulario</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute bottom-6 right-8 flex gap-3">
                    { (imageFile || initialForm?.image_url) && (
                        <button 
                            type="button" 
                            onClick={() => {
                                setImageFile(null);
                                form.setValue("image_url", "");
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="px-4 py-2 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                        >
                            <Trash2 className="w-3 h-3" />
                            Borrar
                        </button>
                    )}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" />
                        {imageFile || initialForm?.image_url ? "Cambiar" : "Subir Portada"}
                    </button>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
            
            {/* Area de Texto (Limpia) */}
            <CardContent className="p-10 md:p-16 space-y-10 bg-white">
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[var(--puembo-green)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">Título del Formulario</span>
                  </div>
                  <FormField control={form.control} name="title" render={({ field: inputField }) => (
                    <Input 
                        className="text-4xl md:text-5xl font-serif font-bold border-0 border-b-2 border-gray-50 px-4 py-4 h-auto focus-visible:ring-0 focus-visible:border-b-[var(--puembo-green)] focus-visible:bg-gray-50/50 transition-all rounded-t-2xl rounded-b-none bg-transparent text-gray-900 placeholder:text-gray-200 leading-tight shadow-none" 
                        placeholder="Ej: Registro de Bautizos 2026" 
                        {...inputField} 
                        value={inputField.value || ""}
                    />
                  )} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-gray-100" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Descripción Narrativa</span>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-gray-50/50 border-2 border-transparent focus-within:bg-white focus-within:border-[var(--puembo-green)]/20 focus-within:shadow-xl transition-all shadow-inner group/desc">
                    <FormField control={form.control} name="description" render={({ field: inputField }) => (
                      <RichTextEditor 
                        content={inputField.value} 
                        onChange={inputField.onChange} 
                        placeholder="Describe el propósito de este formulario, horarios, requisitos, etc..." 
                        className="border-none px-0 text-lg font-light text-gray-600 leading-relaxed min-h-[60px]" 
                      />
                    )} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Dnd Kit Context */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(e) => setActiveDragId(e.active.id)}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveDragId(null)}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6 pb-20 questions-container">
                  {fields.map((field, index) => (
                    <SortableItem
                      key={field.id}
                      id={field.id}
                      index={index}
                      field={field}
                      form={form}
                      isActive={activeId === field.id}
                      activeId={activeId}
                      setActiveId={setActiveId}
                      onRemove={() => remove(index)}
                      onUpdateFieldType={updateFieldType}
                      onUploadAttachment={(i, f) => {
                        const r = new FileReader();
                        r.onload = (e) => {
                          form.setValue(
                            `fields.${i}.attachment_url`,
                            e.target.result
                          );
                          form.setValue(
                            `fields.${i}.attachment_type`,
                            f.type.startsWith("image/") ? "image" : "file"
                          );
                          form.setValue(`fields.${i}.attachment_file`, f);
                        };
                        r.readAsDataURL(f);
                      }}
                      isDraggingAny={!!activeDragId}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeDragId ? (
                  <div className="opacity-90 rotate-1 scale-[1.02] shadow-2xl">
                    <FieldCard
                      field={fields.find((f) => f.id === activeDragId)}
                      index={fields.findIndex((f) => f.id === activeDragId)}
                      form={form}
                      isActive={true}
                      activeId={activeId}
                      setActiveId={setActiveId}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </FormProvider>

          {fields.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-100 p-12 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                <Settings className="w-10 h-10" />
              </div>
              <p className="text-gray-400 font-light italic">
                El lienzo está en blanco. Utiliza las herramientas para empezar
                a construir.
              </p>
            </div>
          )}
        </div>

        <div className="hidden md:block md:col-span-2">
          <div className="sticky top-42">
            <ToolsSidebar onAddField={addField} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableItem({ id, index, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} id={`field-card-${index}`}>
      <FieldCard {...props} index={index} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}
