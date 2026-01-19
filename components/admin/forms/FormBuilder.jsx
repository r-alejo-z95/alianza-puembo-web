"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
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
  MoreVertical,
  X,
  AlignLeft,
  Hash,
  Mail,
  Calendar as CalendarIcon,
  Paperclip,
  Loader2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import RichTextEditor from "./RichTextEditor";
import { cn } from "@/lib/utils";

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
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
  label: z.string().min(1, "El label del campo es requerido."),
  options: z
    .array(
      z.object({
        id: z.string().default(() => uuidv4()),
        value: z.string(),
        label: z.string().min(1, "El label de la opción es requerido."),
      })
    )
    .optional(),
  required: z.boolean().default(false),
  order_index: z.number(),
  placeholder: z.string().optional(),
  attachment_url: z.string().optional(),
  attachment_type: z.string().optional(),
});

const formSchema = z.object({
  title: z.string().min(3, "El título del formulario es requerido."),
  description: z.string().optional(),
  image_url: z
    .string()
    .url("URL de imagen inválida.")
    .optional()
    .or(z.literal("")),
  fields: z.array(fieldSchema),
});

// --- Constants ---
const FIELD_TYPES = {
  text: {
    label: "Texto Corto",
    description: "Respuesta breve de una línea",
    icon: <Type className="w-4 h-4" />,
  },
  textarea: {
    label: "Párrafo",
    description: "Respuesta larga de múltiples líneas",
    icon: <AlignLeft className="w-4 h-4" />,
  },
  number: {
    label: "Número",
    description: "Solo acepta valores numéricos",
    icon: <Hash className="w-4 h-4" />,
  },
  email: {
    label: "Email",
    description: "Valida formato de correo electrónico",
    icon: <Mail className="w-4 h-4" />,
  },
  date: {
    label: "Fecha",
    description: "Selector de fecha",
    icon: <CalendarIcon className="w-4 h-4" />,
  },
  radio: {
    label: "Opción Múltiple",
    description: "Selección única entre varias opciones",
    icon: <CircleDot className="w-4 h-4" />,
  },
  checkbox: {
    label: "Casillas",
    description: "Selección múltiple",
    icon: <CheckSquare className="w-4 h-4" />,
  },
  file: {
    label: "Subir Archivo",
    description: "Permite subir documentos (PDF, Doc, etc.)",
    icon: <FileUp className="w-4 h-4" />,
  },
  image: {
    label: "Subir Imagen",
    description: "Permite subir fotos e imágenes",
    icon: <ImageIcon className="w-4 h-4" />,
  },
};

// --- Components ---

// 1. Field Card UI (Pure Presentational Component)
function FieldCard({
  field,
  index,
  form,
  isActive,
  onClick,
  activeId,
  setActiveId,
  onRemove,
  onAddOption,
  onRemoveOption,
  onUpdateFieldType,
  onUploadAttachment,
  dragHandleProps,
  isDraggingAny,
}) {
  const attachmentInputRef = useRef(null);
  const frozenFieldRef = useRef(null);

  // Watch all field values
  const watchedField = useWatch({
    control: form.control,
    name: `fields.${index}`,
    defaultValue: field,
  });

  // Freeze values when drag starts
  if (isDraggingAny && !frozenFieldRef.current) {
    frozenFieldRef.current = watchedField;
  } else if (!isDraggingAny) {
    frozenFieldRef.current = null;
  }

  // Use frozen values during drag, live values otherwise
  const currentField = isDraggingAny
    ? frozenFieldRef.current || field
    : watchedField || field;

  const handleAttachmentClick = (e) => {
    e.preventDefault();
    attachmentInputRef.current?.click();
  };

  // Logic to prevent focus loss when clicking internal interactive elements
  const handleCardClick = (e) => {
    // Ignore clicks coming from interactive controls
    if (
      e.target.closest(
        'input, button, textarea, select, [role="button"], [role="switch"]'
      )
    ) {
      return;
    }

    e.stopPropagation();

    // Only change if it's not the same card
    if (activeId !== field.id) {
      setActiveId(field.id);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-l-4 bg-white",
        isActive
          ? "border-l-[var(--puembo-green)] shadow-lg ring-1 ring-green-100 z-10"
          : "border-l-transparent hover:border-l-gray-300"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {isActive ? (
          // === EDIT MODE ===
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <div className="flex-grow space-y-4">
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`fields.${index}.label`}
                    render={({ field: itemField }) => (
                      <Input
                        placeholder="Pregunta"
                        className="text-lg font-medium border-x-0 border-t-0 border-b-2 rounded-none px-0 focus-visible:ring-0 bg-gray-50/50 flex-grow"
                        {...itemField}
                      />
                    )}
                  />

                  {/* Attachment Button */}
                  {!currentField.attachment_url && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAttachmentClick}
                            className="text-gray-500 border-dashed hover:border-solid hover:text-[var(--puembo-green)] hover:border-[var(--puembo-green)] shrink-0 gap-2 px-3"
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-xs">Adjuntar</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Añadir imagen o archivo de referencia
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

                {/* Attachment Preview */}
                {currentField.attachment_url && (
                  <div className="relative group w-fit mt-2 border rounded-md overflow-hidden bg-gray-50">
                    {currentField.attachment_type === "image" ? (
                      <img
                        src={currentField.attachment_url}
                        alt="Attachment"
                        className="max-h-64 w-auto object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-4">
                        <FileUp className="w-8 h-8 text-[var(--puembo-green)]" />
                                                        <div className="flex flex-col min-w-0">
                                                          <span className="font-medium text-sm text-gray-700">
                                                            Documento Adjunto
                                                          </span>
                                                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                                            {currentField.attachment_url.split("/").pop()}
                                                          </span>
                                                        </div>
                        
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleAttachmentClick}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
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

                {/* Options Logic */}
                {(currentField.type === "radio" ||
                  currentField.type === "checkbox") && (
                  <div className="space-y-3 pl-2 mt-4">
                    {currentField.options?.map((option, optionIndex) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-2 group"
                      >
                        {currentField.type === "radio" ? (
                          <CircleDot className="w-4 h-4 text-gray-400" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-gray-400" />
                        )}
                        <FormField
                          control={form.control}
                          name={`fields.${index}.options.${optionIndex}.label`}
                          render={({ field: optionField }) => (
                            <Input
                              placeholder={`Opción ${optionIndex + 1}`}
                              className="flex-grow h-8 border-none hover:border-b hover:border-gray-200 focus-visible:border-b-[var(--puembo-green)] rounded-none px-1"
                              {...optionField}
                              onChange={(e) => {
                                optionField.onChange(e);
                                // Auto-generate value if empty
                                if (
                                  !form.getValues(
                                    `fields.${index}.options.${optionIndex}.value`
                                  )
                                ) {
                                  const newLabel = e.target.value;
                                  const newValue = newLabel
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "_")
                                    .replace(/^_|_$/g, "");
                                  form.setValue(
                                    `fields.${index}.options.${optionIndex}.value`,
                                    newValue || uuidv4()
                                  );
                                }
                              }}
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-8 w-8"
                          onClick={() => onRemoveOption(index, optionIndex)}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[var(--puembo-green)] hover:text-green-800 hover:bg-green-50 ml-6"
                      onClick={() => onAddOption(index)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Añadir opción
                    </Button>
                  </div>
                )}

                {/* Placeholder Logic */}
                {["text", "textarea", "email", "number"].includes(
                  currentField.type
                ) && (
                  <FormField
                    control={form.control}
                    name={`fields.${index}.placeholder`}
                    render={({ field: itemField }) => (
                      <Input
                        placeholder="Texto de ayuda (placeholder)..."
                        className="text-sm text-gray-500 border-none border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 mt-2"
                        {...itemField}
                      />
                    )}
                  />
                )}
              </div>

              {/* Type Dropdown */}
              <div className="w-60 shrink-0">
                <Select
                  value={currentField.type}
                  onValueChange={(value) => onUpdateFieldType(index, value)}
                >
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {FIELD_TYPES[currentField.type]?.icon}
                        <span>{FIELD_TYPES[currentField.type]?.label}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FIELD_TYPES).map(
                      ([key, { label, icon }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {icon}
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t mt-2">
              <div className="flex items-center gap-2 border-r pr-4">
                <Trash2
                  className="w-5 h-5 text-gray-500 hover:text-red-600 cursor-pointer transition-colors"
                  onClick={() => onRemove(index)}
                  title="Eliminar pregunta"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
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
              <div
                className="border-l pl-4 flex items-center cursor-move drag-handle"
                {...dragHandleProps}
              >
                <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </div>
            </div>
          </div>
        ) : (
          // === PREVIEW MODE ===
          <div className="group flex items-start gap-4">
            <div className="flex-grow space-y-2">
              <p className="text-base font-medium">
                {currentField.label || "Pregunta sin título"}
                {currentField.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </p>

              {currentField.attachment_url && (
                <div className="mb-3">
                  {currentField.attachment_type === "image" ? (
                    <img
                      src={currentField.attachment_url}
                      alt="Attachment"
                      className="max-h-60 rounded-md border w-auto"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border w-fit">
                      <FileUp className="w-4 h-4 text-gray-500" />
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Ver documento adjunto
                      </a>
                    </div>
                  )}
                </div>
              )}

              {currentField.type === "text" && (
                <Input
                  disabled
                  placeholder={
                    currentField.placeholder || "Texto de respuesta corta"
                  }
                  className="border-dotted bg-gray-50 max-w-md"
                />
              )}
              {currentField.type === "textarea" && (
                <div className="h-20 w-full max-w-md border border-dotted border-gray-300 bg-gray-50 rounded-md p-2 text-sm text-gray-400">
                  {currentField.placeholder || "Texto de respuesta larga"}
                </div>
              )}
              {currentField.type === "email" && (
                <Input
                  disabled
                  placeholder={currentField.placeholder || "ejemplo@correo.com"}
                  className="border-dotted bg-gray-50 max-w-md"
                />
              )}
              {currentField.type === "number" && (
                <Input
                  disabled
                  type="text"
                  placeholder={currentField.placeholder || "099..."}
                  className="border-dotted bg-gray-50 max-w-xs"
                />
              )}
              {currentField.type === "date" && (
                <div className="flex items-center gap-2 border border-dotted border-gray-300 rounded-md p-2 w-fit bg-gray-50 text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>dd/mm/aaaa</span>
                </div>
              )}

              {(currentField.type === "radio" ||
                currentField.type === "checkbox") && (
                <div className="space-y-2 pl-1">
                  {currentField.options?.map((option, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-500 text-sm"
                    >
                      {currentField.type === "radio" ? (
                        <CircleDot className="w-4 h-4" />
                      ) : (
                        <CheckSquare className="w-4 h-4" />
                      )}
                      <span>{option.label || `Opción ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Generic File/Image Previews */}
              {(currentField.type === "file" ||
                currentField.type === "image") && (
                <div className="border border-gray-200 rounded-md p-3 flex items-center gap-2 w-fit bg-gray-50 text-gray-500">
                  {currentField.type === "image" ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : (
                    <FileUp className="w-5 h-5" />
                  )}
                  <span className="text-sm">
                    {currentField.type === "image"
                      ? "Subida de imagen"
                      : "Subida de archivo"}
                  </span>
                </div>
              )}
            </div>

            {/* Drag handle visible on hover */}
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move drag-handle p-2"
              {...dragHandleProps}
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 2. Sortable Wrapper Component
function SortableFieldItem({ id, isActive, isDraggingAny, ...props }) {
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
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <FieldCard
        {...props}
        isActive={isActive}
        isDraggingAny={isDraggingAny}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// 3. Sidebar
function ToolsSidebar({ onAddField }) {
  return (
    <div className="sticky top-28 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-200 w-fit h-fit">
      <div className="flex flex-col gap-1 items-center">
        <TooltipButton
          onClick={() => onAddField("text")}
          icon={<PlusCircle className="w-6 h-6 text-[var(--puembo-green)]" />}
          label="Añadir Pregunta"
          className="mb-2 hover:bg-green-50"
          description="Agrega una nueva pregunta al formulario"
        />
        <div className="w-8 h-[1px] bg-gray-200 my-1"></div>
        <TooltipButton
          onClick={() => onAddField("text")}
          icon={<Type className="w-5 h-5" />}
          label="Texto Corto"
          description="Para nombres, títulos o frases cortas"
        />
        <TooltipButton
          onClick={() => onAddField("textarea")}
          icon={<AlignLeft className="w-5 h-5" />}
          label="Párrafo"
          description="Para respuestas largas o comentarios"
        />
        <TooltipButton
          onClick={() => onAddField("radio")}
          icon={<CircleDot className="w-5 h-5" />}
          label="Opción Múltiple"
          description="El usuario elige UNA sola opción"
        />
        <TooltipButton
          onClick={() => onAddField("checkbox")}
          icon={<CheckSquare className="w-5 h-5" />}
          label="Casillas"
          description="El usuario puede elegir VARIAS opciones"
        />
        <TooltipButton
          onClick={() => onAddField("date")}
          icon={<CalendarIcon className="w-5 h-5" />}
          label="Fecha"
          description="Selector de fecha"
        />
        <TooltipButton
          onClick={() => onAddField("email")}
          icon={<Mail className="w-5 h-5" />}
          label="Email"
          description="Campo validado para emails"
        />
        <TooltipButton
          onClick={() => onAddField("number")}
          icon={<Hash className="w-5 h-5" />}
          label="Número"
          description="Solo acepta números"
        />
        <div className="w-8 h-[1px] bg-gray-200 my-1"></div>
        <TooltipButton
          onClick={() => onAddField("file")}
          icon={<FileUp className="w-5 h-5" />}
          label="Subir Archivo"
          description="Documentos (PDF, Doc)"
        />
        <TooltipButton
          onClick={() => onAddField("image")}
          icon={<ImageIcon className="w-5 h-5" />}
          label="Subir Imagen"
          description="Fotos e imágenes"
        />
      </div>
    </div>
  );
}

function TooltipButton({ onClick, icon, label, description, className }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "text-gray-500 hover:text-[var(--puembo-green)] hover:bg-green-50",
              className
            )}
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="flex flex-col gap-1 max-w-[200px]"
        >
          <span className="font-semibold">{label}</span>
          {description && (
            <span className="text-xs text-gray-300 font-normal">
              {description}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// --- Main Builder Component ---
export default function FormBuilder({
  form: initialForm,
  onSave,
  onCancel,
  isFullScreen = false,
  isSaving = false,
}) {
  const [imageFile, setImageFile] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeDragId, setActiveDragItem] = useState(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      fields: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialForm) {
      const preparedFields = (initialForm.form_fields || [])
        .map((field) => ({
          ...field,
          id: field.id || uuidv4(),
          type: field.type || field.field_type,
          required:
            field.required !== undefined ? field.required : field.is_required,
          order_index:
            field.order_index !== undefined ? field.order_index : field.order,
          placeholder: field.placeholder || "",
          attachment_url: field.attachment_url || "",
          attachment_type: field.attachment_type || "",
          options: (field.options || []).map((option) => ({
            ...option,
            id: option.id || uuidv4(),
            value:
              option.value ||
              option.label.toLowerCase().replace(/[^a-z0-9]+/g, ""),
          })),
        }))
        .sort((a, b) => a.order_index - b.order_index);

      form.reset({
        title: initialForm.title || "",
        description: initialForm.description || "",
        image_url: initialForm.image_url || "",
        fields: preparedFields,
      });
      setImageFile(null);
    }
  }, [initialForm, form]);

  const addField = (type = "text") => {
    const newId = uuidv4();
    const newOrder = fields.length;
    append({
      id: newId,
      type: type,
      label: "",
      options:
        type === "radio" || type === "checkbox"
          ? [{ value: "", label: "", id: uuidv4() }]
          : undefined,
      required: false,
      order_index: newOrder,
      placeholder: "",
      attachment_url: "",
      attachment_type: "",
    });
    setActiveId(newId);
  };

  const updateFieldType = (index, newType) => {
    // Use getValues to get the current live data from the form
    const currentFieldData = form.getValues(`fields.${index}`);
    const needsOptions = newType === "radio" || newType === "checkbox";

    const updatedField = {
      ...currentFieldData,
      type: newType,
      options: needsOptions
        ? currentFieldData.options?.length
          ? currentFieldData.options
          : [{ value: "", label: "", id: uuidv4() }]
        : undefined,
    };

    // Use setValue to update the form state precisely
    Object.keys(updatedField).forEach((key) => {
      form.setValue(`fields.${index}.${key}`, updatedField[key]);
    });
  };

  const addOption = (fieldIndex) => {
    const field = form.getValues(`fields.${fieldIndex}`);
    const newOptions = [
      ...(field.options || []),
      { value: "", label: "", id: uuidv4() },
    ];
    form.setValue(`fields.${fieldIndex}.options`, newOptions, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const field = form.getValues(`fields.${fieldIndex}`);
    const newOptions = field.options.filter((_, i) => i !== optionIndex);
    form.setValue(`fields.${fieldIndex}.options`, newOptions, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleUploadAttachment = async (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const field = form.getValues(`fields.${index}`);
      form.setValue(`fields.${index}.attachment_url`, e.target.result);
      form.setValue(
        `fields.${index}.attachment_type`,
        file.type.startsWith("image/") ? "image" : "file"
      );
      form.setValue(`fields.${index}.attachment_file`, file);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data) => {
    const orderedFields = data.fields.map((field, index) => ({
      ...field,
      order_index: index,
    }));
    onSave({ ...data, fields: orderedFields }, imageFile);
  };

  // Drag Handlers
  const handleDragStart = (event) => {
    setActiveDragItem(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
    setActiveDragItem(null);
  };

  const handleDragCancel = () => {
    setActiveDragItem(null);
  };

  const handleBackgroundClick = (e) => {
    // Only deselect if clicking strictly on the background (not inside cards)
    if (e.target === e.currentTarget) {
      setActiveId(null);
    }
  };

  // Find active dragging field for Overlay
  const activeDragField = fields.find((f) => f.id === activeDragId);
  const activeDragIndex = fields.findIndex((f) => f.id === activeDragId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pb-20 px-4 pt-4">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-700">
          Editor de Formulario
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            variant="green"
            className={cn(!isSaving)}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </div>

      {/* Main Canvas with Click Outside Handler */}
      <div
        className="flex justify-center w-full max-w-5xl mx-auto pt-8 px-4 gap-6 relative"
        onClick={handleBackgroundClick}
      >
        {/* Central Column */}
        <div className="w-full max-w-3xl space-y-4">
          {/* Header Card */}
          <Card
            className="border-t-8 border-t-[var(--puembo-green)] shadow-sm relative group bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <Input
                    className="text-3xl font-bold border-none px-0 py-2 h-auto focus-visible:ring-0 placeholder:text-gray-300 border-b border-b-transparent focus:border-b-gray-300 rounded-none transition-colors"
                    placeholder="Título del formulario"
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Descripción del formulario"
                    className="border-none px-0 py-0 min-h-[40px] text-gray-600 focus:ring-0"
                  />
                )}
              />

              {/* Image Upload Trigger */}
              <div className="absolute top-6 right-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="hidden"
                  ref={fileInputRef}
                />
                {!imageFile && !initialForm?.image_url ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current.click()}
                    className="text-gray-500 hover:text-[var(--puembo-green)] border-dashed"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Añadir Portada
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="bg-white/80 hover:bg-white shadow-sm"
                    onClick={() => fileInputRef.current.click()}
                    title="Cambiar imagen de encabezado"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-700" />
                  </Button>
                )}
              </div>
              {(imageFile ||
                (initialForm?.image_url && initialForm.image_url !== "")) && (
                <div className="mt-4 rounded-md overflow-hidden bg-gray-100 max-h-60 flex justify-center items-center relative group/img">
                  {imageFile ? (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Header Preview"
                      className="w-full object-cover"
                    />
                  ) : (
                    <img
                      src={initialForm.image_url}
                      alt="Header"
                      className="w-full object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity"
                    onClick={() => {
                      setImageFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      form.setValue("image_url", "");
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dnd Context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 pb-20">
                {fields.map((field, index) => (
                  <SortableFieldItem
                    key={field.id}
                    id={field.id}
                    index={index}
                    field={field}
                    form={form}
                    isActive={activeId === field.id}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    onRemove={remove}
                    onAddOption={addOption}
                    onRemoveOption={removeOption}
                    onUpdateFieldType={updateFieldType}
                    onUploadAttachment={handleUploadAttachment}
                    isDraggingAny={!!activeDragId}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay for Smooth Dragging */}
            <DragOverlay
              dropAnimation={{
                duration: 150,
                easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              {activeDragId ? (
                <div className="opacity-95 rotate-1 scale-[1.02]">
                  <FieldCard
                    field={activeDragField}
                    index={activeDragIndex}
                    form={form}
                    isActive={activeId === activeDragId}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    onClick={() => {}}
                    onRemove={() => {}}
                    onAddOption={() => {}}
                    onRemoveOption={() => {}}
                    onUpdateFieldType={() => {}}
                    onUploadAttachment={() => {}}
                    dragHandleProps={{}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {fields.length === 0 && (
            <div
              className="text-center py-10 text-gray-400 bg-white rounded-lg border border-dashed border-gray-300 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <p>Tu formulario está vacío.</p>
              <p className="text-sm">
                Usa el menú de la derecha para añadir preguntas.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar (Tools) */}
        <div
          className="hidden md:block w-fit"
          onClick={(e) => e.stopPropagation()}
        >
          <ToolsSidebar onAddField={addField} />
        </div>
      </div>
    </div>
  );
}
