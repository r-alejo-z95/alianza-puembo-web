"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFormContext, Controller } from "react-hook-form";
import {
  GripHorizontal,
  Trash2,
  Copy,
  MoreVertical,
  Image as ImageIcon,
  X,
  Plus,
  CheckSquare,
  CircleDot,
  ChevronDown,
  Calendar,
  AlignLeft,
  Type,
  Hash,
  Mail,
  FileUp,
  Layout,
  GitBranch,
  FileText,
  Paperclip,
  AlertCircle,
  Upload,
  Sparkles,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import { useRef, useEffect, memo } from "react";
import { toast } from "sonner";

const FIELD_GROUPS = [
  {
    label: "Texto",
    types: [
      { value: "text", label: "Respuesta Corta", icon: Type },
      { value: "textarea", label: "Párrafo / Texto Largo", icon: AlignLeft },
      { value: "number", label: "Número", icon: Hash },
      { value: "email", label: "Correo Electrónico", icon: Mail },
    ],
  },
  {
    label: "Selección",
    types: [
      { value: "radio", label: "Opción Única", icon: CircleDot },
      { value: "checkbox", label: "Opción Múltiple", icon: CheckSquare },
      { value: "select", label: "Lista Desplegable", icon: ChevronDown },
    ],
  },
  {
    label: "Multimedia y Fecha",
    types: [
      { value: "date", label: "Fecha", icon: Calendar },
      { value: "file", label: "Subida de PDF / Archivo", icon: FileUp },
      { value: "image", label: "Subida de Imagen", icon: ImageIcon },
    ],
  },
];

const ALL_TYPES = FIELD_GROUPS.flatMap((g) => g.types).concat([
  { value: "section", label: "Sección", icon: Layout },
]);

function QuestionCard({
  field,
  index,
  isActive,
  onActivate,
  onDuplicate,
  onDelete,
  sections,
  error,
}) {
  const { control, setValue, getValues, watch } = useFormContext();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 999 : isActive ? 50 : 1,
    position: "relative",
  };

  const type = watch(`fields.${index}.type`);
  const options = watch(`fields.${index}.options`);
  const label = watch(`fields.${index}.label`);
  const helpText = watch(`fields.${index}.help_text`);
  const placeholder = watch(`fields.${index}.placeholder`);
  const required = watch(`fields.${index}.required`);
  const attachmentUrl = watch(`fields.${index}.attachment_url`);
  const attachmentType = watch(`fields.${index}.attachment_type`);
  const attachmentInputRef = useRef(null);

  const isSection = type === "section";

  useEffect(() => {
    return () => {
      if (attachmentUrl?.startsWith("blob:"))
        URL.revokeObjectURL(attachmentUrl);
    };
  }, [attachmentUrl]);

  const handleTypeChange = (newType) => {
    setValue(`fields.${index}.type`, newType);
    if (
      ["radio", "checkbox", "select"].includes(newType) &&
      (!options || options.length === 0)
    ) {
      setValue(`fields.${index}.options`, [
        { id: uuidv4(), label: "Opción 1", value: uuidv4() },
      ]);
    }
  };

  const addOption = () => {
    const current = getValues(`fields.${index}.options`) || [];
    setValue(`fields.${index}.options`, [
      ...current,
      { id: uuidv4(), label: `Opción ${current.length + 1}`, value: uuidv4() },
    ]);
  };

  const removeOption = (optIndex) => {
    const current = getValues(`fields.${index}.options`) || [];
    if (current.length <= 1) return toast.error("Mínimo una opción requerida");
    setValue(
      `fields.${index}.options`,
      current.filter((_, i) => i !== optIndex),
    );
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024)
      return toast.error("Archivo demasiado grande (máx 5MB)");

    if (attachmentUrl?.startsWith("blob:")) URL.revokeObjectURL(attachmentUrl);

    const blob = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");

    setValue(`fields.${index}.attachment_url`, blob, { shouldDirty: true });
    setValue(`fields.${index}.attachment_type`, isImage ? "image" : "file", {
      shouldDirty: true,
    });
    setValue(`fields.${index}.attachment_file`, file, { shouldDirty: true });

    toast.success("Referencia visual añadida");
  };

  const removeAttachment = () => {
    if (attachmentUrl?.startsWith("blob:")) URL.revokeObjectURL(attachmentUrl);
    setValue(`fields.${index}.attachment_url`, null);
    setValue(`fields.${index}.attachment_file`, null);
    setValue(`fields.${index}.attachment_type`, null);
  };

  const renderInputPreview = () => {
    if (["text", "email", "number"].includes(type)) {
      return (
        <div className="border-b border-gray-100 text-gray-300 text-sm py-2 w-full max-w-sm italic font-light">
          {placeholder || "Respuesta del usuario..."}
        </div>
      );
    }
    if (type === "textarea") {
      return (
        <div className="border border-gray-100 rounded-2xl bg-gray-50/50 p-4 text-gray-300 text-sm w-full min-h-[80px] italic font-light">
          {placeholder || "Respuesta larga..."}
        </div>
      );
    }
    if (type === "date") {
      return (
        <div className="flex items-center gap-3 text-gray-300 text-sm border border-gray-100 rounded-xl px-4 py-2.5 w-fit bg-gray-50/50">
          <Calendar className="w-4 h-4 opacity-40" />
          <span>DD / MM / AAAA</span>
        </div>
      );
    }
    if (["radio", "checkbox", "select"].includes(type)) {
      return (
        <div className="space-y-3 pt-2">
          {options?.slice(0, 4).map((opt, i) => (
            <div
              key={opt.id || i}
              className="flex items-center gap-3 text-gray-500 text-sm font-medium"
            >
              {type === "radio" && (
                <div className="w-5 h-5 rounded-full border border-gray-200 bg-white" />
              )}
              {type === "checkbox" && (
                <div className="w-5 h-5 rounded-md border border-gray-200 bg-white" />
              )}
              {type === "select" && (
                <span className="text-gray-300 w-5 text-center font-mono text-[10px]">
                  {i + 1}.
                </span>
              )}
              <span className="truncate">{opt.label || `Opción ${i + 1}`}</span>
            </div>
          ))}
          {options?.length > 4 && (
            <div className="text-[10px] text-gray-300 uppercase font-black tracking-widest pl-8">
              + {options.length - 4} opciones más
            </div>
          )}
        </div>
      );
    }
    if (type === "file" || type === "image") {
      return (
        <div className="border-2 border-dashed border-gray-100 rounded-[1.5rem] p-6 text-[10px] text-gray-400 bg-gray-50/50 w-fit flex items-center gap-4 font-black uppercase tracking-[0.2em]">
          <Upload className="w-5 h-5 text-[var(--puembo-green)] opacity-50" />
          {type === "image"
            ? "Cargar Imagen Habilitado"
            : "Cargar Archivo Habilitado"}
        </div>
      );
    }
    return null;
  };

  const renderEditContent = () => {
    const selectedType = ALL_TYPES.find((t) => t.value === type);
    const TypeIcon = selectedType ? selectedType.icon : Sparkles;

    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-grow w-full space-y-4">
            <div
              className={cn(
                "p-6 rounded-[2rem] border transition-all duration-300",
                error
                  ? "border-red-500 bg-red-50/30"
                  : "border-gray-100 bg-[#FAFAFA]",
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "h-1 w-6 rounded-full",
                    error ? "bg-red-500" : "bg-[var(--puembo-green)]",
                  )}
                />
                <span
                  className={cn(
                    "text-[9px] font-black uppercase tracking-[0.3em]",
                    error ? "text-red-500" : "text-gray-400",
                  )}
                >
                  {isSection
                    ? "Título de la Sección"
                    : "Pregunta del Formulario"}
                </span>
              </div>
              <Controller
                control={control}
                name={`fields.${index}.label`}
                render={({ field: inputField }) => (
                  <Input
                    {...inputField}
                    value={inputField.value || ""}
                    autoFocus={!inputField.value}
                    placeholder={
                      isSection
                        ? "Título de la sección"
                        : "¿Cuál es tu pregunta?"
                    }
                    className="bg-transparent border-none text-xl font-bold p-0 focus-visible:ring-0 shadow-none h-auto py-1 placeholder:text-gray-200"
                  />
                )}
              />
              {error && (
                <div className="flex items-center gap-1.5 mt-2 text-red-500 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Este campo es requerido
                  </span>
                </div>
              )}
            </div>

            {attachmentUrl && !isSection && (
              <div className="relative w-fit group/att rounded-[2rem] overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-100">
                {attachmentType === "image" ? (
                  <img
                    src={attachmentUrl}
                    className="h-40 w-auto object-contain bg-gray-50"
                    alt="Preview"
                  />
                ) : (
                  <div className="h-20 px-8 bg-gradient-to-br from-blue-50 to-white text-blue-600 flex items-center gap-4 text-sm font-bold">
                    <FileText className="w-6 h-6" /> <span>Referencia PDF</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover/att:opacity-100 transition-all hover:scale-110"
                  onClick={removeAttachment}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {!isSection && (
            <div className="w-full lg:w-72 shrink-0 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 px-1 flex items-center gap-2">
                <Settings2 className="w-3 h-3" /> Tipo de Respuesta
              </span>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-14 bg-white border-gray-200 rounded-[1.25rem] shadow-sm hover:border-[var(--puembo-green)] transition-all px-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[var(--puembo-green)]/10">
                      <TypeIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                  {FIELD_GROUPS.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 px-4 py-3">
                        {group.label}
                      </SelectLabel>
                      {group.types.map((t) => (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          className="rounded-xl py-3 px-4 focus:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <t.icon className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-xs uppercase tracking-tight">
                              {t.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 px-1">
              Ayuda / Contexto
            </span>
            <Controller
              control={control}
              name={`fields.${index}.help_text`}
              render={({ field: hField }) => (
                <Input
                  {...hField}
                  value={hField.value || ""}
                  placeholder={
                    isSection
                      ? "Subtítulo opcional de sección..."
                      : "Explica qué debe responder el usuario..."
                  }
                  className="text-sm border-gray-100 rounded-2xl h-12 bg-gray-50/30 px-5 focus-visible:ring-[var(--puembo-green)]/20 italic"
                />
              )}
            />
          </div>

          {["text", "textarea", "number", "email"].includes(type) && (
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 px-1">
                Texto de Guía (Placeholder)
              </span>
              <Controller
                control={control}
                name={`fields.${index}.placeholder`}
                render={({ field: pField }) => (
                  <Input
                    {...pField}
                    value={pField.value || ""}
                    placeholder="Ejem: 'Tu respuesta aquí...'"
                    className="text-sm border-gray-100 rounded-2xl h-12 bg-gray-50/30 px-5 focus-visible:ring-[var(--puembo-green)]/20"
                  />
                )}
              />
            </div>
          )}
        </div>

        {["radio", "checkbox", "select"].includes(type) && (
          <div className="space-y-3 p-6 rounded-[2rem] bg-[#FDFDFD] border border-gray-100 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
                Opciones de Respuesta
              </span>
              <div className="h-px flex-grow mx-4 bg-gray-50" />
            </div>
            <div className="space-y-2">
              {options?.map((opt, optIdx) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-4 group/opt bg-white p-2 pr-4 rounded-2xl border border-transparent hover:border-gray-100 transition-all hover:shadow-sm"
                >
                  <div className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-gray-300 bg-gray-50 rounded-xl">
                    {optIdx + 1}
                  </div>
                  <Controller
                    control={control}
                    name={`fields.${index}.options.${optIdx}.label`}
                    render={({ field: oField }) => (
                      <Input
                        {...oField}
                        value={oField.value || ""}
                        placeholder={`Nueva Opción ${optIdx + 1}`}
                        className="h-10 border-none bg-transparent focus:bg-gray-50/50 transition-all rounded-xl px-4 font-bold text-sm flex-grow shadow-none focus-visible:ring-0"
                      />
                    )}
                  />
                  {type === "radio" && sections?.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-300 hover:text-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/5 rounded-xl"
                        >
                          <GitBranch className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-72 rounded-3xl shadow-2xl p-4 border-none bg-black text-white"
                      >
                        <Controller
                          control={control}
                          name={`fields.${index}.options.${optIdx}.next_section_id`}
                          render={({ field: jField }) => (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <GitBranch className="w-4 h-4 text-[var(--puembo-green)]" />
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white">
                                  Salto Lógico
                                </span>
                              </div>
                              <Select
                                value={jField.value || "default"}
                                onValueChange={(v) =>
                                  jField.onChange(v === "default" ? null : v)
                                }
                              >
                                <SelectTrigger className="w-full h-12 text-xs rounded-2xl bg-white/10 border-none text-white hover:bg-white/20 transition-all px-4">
                                  <SelectValue placeholder="Siguiente sección" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                  <SelectItem
                                    value="default"
                                    className="text-xs uppercase font-black"
                                  >
                                    → Siguiente paso
                                  </SelectItem>
                                  {sections.map((s) => (
                                    <SelectItem
                                      key={s.id}
                                      value={s.id}
                                      className="text-xs font-bold"
                                    >
                                      → {s.label}
                                    </SelectItem>
                                  ))}
                                  <SelectItem
                                    value="submit"
                                    className="text-xs font-black text-red-500 uppercase tracking-widest"
                                  >
                                    ✓ Finalizar Formulario
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-200 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-all"
                    onClick={() => removeOption(optIdx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-4 text-[var(--puembo-green)] font-black uppercase tracking-[0.2em] text-[10px] h-12 hover:bg-[var(--puembo-green)]/5 rounded-2xl border-2 border-dashed border-[var(--puembo-green)]/10 hover:border-[var(--puembo-green)]/30 transition-all"
              onClick={addOption}
            >
              <Plus className="w-4 h-4 mr-2" /> Añadir Opción
            </Button>
          </div>
        )}

        {!isSection && !attachmentUrl && (
          <div className="pt-2 px-1">
            <Button
              type="button"
              variant="ghost"
              className="text-gray-400 hover:text-black gap-3 font-black uppercase tracking-[0.2em] text-[9px] h-12 px-6 rounded-2xl border-2 border-dashed border-gray-100 hover:border-gray-300 transition-all"
              onClick={() => attachmentInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
              <span>Adjuntar Referencia Visual</span>
            </Button>
            <input
              type="file"
              ref={attachmentInputRef}
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleAttachment}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-4 px-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(index)}
              className="rounded-xl h-10 hover:bg-gray-100 gap-2 px-4"
            >
              <Copy className="w-4 h-4 text-gray-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Duplicar
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="rounded-xl h-10 hover:bg-red-50 hover:text-red-600 gap-2 px-4"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Eliminar
              </span>
            </Button>
          </div>

          {!isSection ? (
            <div className="flex items-center gap-4 px-6 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                Requerido
              </Label>
              <Controller
                control={control}
                name={`fields.${index}.required`}
                render={({ field: rField }) => (
                  <Switch
                    checked={rField.value}
                    onCheckedChange={rField.onChange}
                  />
                )}
              />
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-10 w-10 border border-gray-100"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 p-4 rounded-3xl shadow-2xl border-none"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--puembo-green)]" />
                    <Label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                      Comportamiento Post-Sección
                    </Label>
                  </div>
                  <Controller
                    control={control}
                    name={`fields.${index}.next_section_id`}
                    render={({ field: jsField }) => (
                      <Select
                        value={jsField.value || "default"}
                        onValueChange={(v) =>
                          jsField.onChange(v === "default" ? null : v)
                        }
                      >
                        <SelectTrigger className="h-12 text-xs rounded-2xl bg-gray-50 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-xl">
                          <SelectItem
                            value="default"
                            className="text-xs font-bold uppercase tracking-tight"
                          >
                            Pasar a la siguiente bloque
                          </SelectItem>
                          <SelectItem
                            value="submit"
                            className="text-xs font-black text-red-500 uppercase tracking-widest"
                          >
                            Finalizar y Enviar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const renderViewContent = () => (
    <div className="space-y-4 transition-all duration-300 pointer-events-none group-hover:px-1">
      <div className="flex justify-between items-start gap-6">
        <div className="space-y-2.5 flex-grow">
          {isSection && (
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1.5 w-10 rounded-full bg-black" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black">
                Sección
              </span>
            </div>
          )}
          <h3
            className={cn(
              "text-lg font-bold text-gray-800 leading-snug tracking-tight",
              isSection && "font-serif text-3xl md:text-4xl text-black",
              error && "text-red-500",
              !label && "text-gray-200 italic font-light",
            )}
          >
            {label ||
              (isSection
                ? "Sección sin título"
                : "Bloque de pregunta sin título")}
            {!isSection && required && (
              <span className="text-red-500 ml-2 font-black text-xl">*</span>
            )}
          </h3>
          {helpText && (
            <p className="text-sm text-gray-400 font-light italic leading-relaxed line-clamp-2">
              {helpText}
            </p>
          )}
        </div>
        {attachmentUrl && (
          <div className="w-24 h-24 rounded-[2rem] border-4 border-white bg-gray-50 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-gray-100 rotate-2">
            {attachmentType === "image" ? (
              <img
                src={attachmentUrl}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <FileText className="w-10 h-10 text-gray-200" />
            )}
          </div>
        )}
      </div>
      <div className="pt-2">{renderInputPreview()}</div>
      {error && (
        <div className="flex items-center gap-2 mt-4 text-red-500 animate-bounce">
          <AlertCircle className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Falta información obligatoria
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`field-${field.id}`}
      data-field-id={field.id}
      data-field-card
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      className={cn(
        "bg-white border-2 rounded-[3rem] transition-all duration-500 group relative cursor-pointer",
        isActive
          ? "border-[var(--puembo-green)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] scale-[1.01] my-10"
          : "border-gray-200 hover:border-gray-300 hover:shadow-xl my-4",
        isSection && !isActive && "bg-[#F8F9FA] border-gray-100",
        error && !isActive && "border-red-400 bg-red-50/10",
        isDragging &&
          "shadow-2xl scale-105 rotate-1 opacity-100 ring-8 ring-[var(--puembo-green)]/10",
      )}
    >
      {/* Dynamic Left accent */}
      {isActive && (
        <div className="absolute left-0 top-12 bottom-12 w-1.5 bg-[var(--puembo-green)] rounded-r-full" />
      )}

      {/* Improved Drag Handle */}
      <div
        className={cn(
          "absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-9 bg-white border-2 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-all z-[60]",
          isActive
            ? "opacity-100 border-[var(--puembo-green)] text-[var(--puembo-green)]"
            : "opacity-0 group-hover:opacity-100 border-gray-200 text-gray-300",
        )}
        {...attributes}
        {...listeners}
      >
        <GripHorizontal className="w-6 h-6" />
      </div>

      <div
        className={cn(
          "p-10 md:p-14 transition-all duration-500",
          isActive ? "pt-16" : "pt-10",
        )}
      >
        {isActive ? renderEditContent() : renderViewContent()}
      </div>

      {/* Decorative hover elements */}
      {!isActive && (
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-transparent via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  );
}

export default memo(QuestionCard);
