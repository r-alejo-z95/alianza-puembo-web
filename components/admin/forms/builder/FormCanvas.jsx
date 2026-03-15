import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Trash2, Layout, Plus, ShieldCheck, Globe, Receipt, Banknote, Hash, AlertCircle, CheckCircle2, Circle, ArrowDown } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { useRef, useMemo } from "react";
import RichTextEditor from "../RichTextEditor";
import { toast } from "sonner";

const FormHeader = ({
  isActive,
  onActivate,
  headerFile,
  setHeaderFile,
  error,
  errors,
  fields,
}) => {
  const { control, watch, setValue } = useFormContext();
  const imageUrl = watch("image_url");
  const description = watch("description");
  const title = watch("title");
  const isInternal = watch("is_internal");
  const isFinancial = watch("is_financial");
  const fileInputRef = useRef(null);

  const currentFields = watch("fields") || [];
  const receiptFields = currentFields.filter(
    (f) => f.type === "image" || f.type === "file",
  );

  const hasSettingsError = !!(errors?.financial_field_label || errors?.max_responses);
  const hasError = error || hasSettingsError;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast.error("Imagen demasiado pesada", {
          description: "El límite es de 5MB",
        });
        return;
      }

      setHeaderFile(file);
      const objectUrl = URL.createObjectURL(file);
      setValue("image_url", objectUrl, { shouldDirty: true });
    }
  };

  const removeHeaderImage = (e) => {
    e.stopPropagation();
    if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    setHeaderFile(null);
    setValue("image_url", "", { shouldDirty: true });
  };

  return (
    <div
      id="field-header"
      data-field-card
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      className={cn(
        "bg-white rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group mb-8 cursor-pointer form-header-card",
        isActive
          ? "border-[var(--puembo-green)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] ring-8 ring-[var(--puembo-green)]/5 max-w-screen"
          : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md",
        hasError && !isActive && "border-red-500 ring-4 ring-red-500/5",
      )}
    >
      {/* Top Accent line for visual cues */}
      <div
        className={cn(
          "h-1.5 w-full transition-colors",
          isActive
            ? "bg-[var(--puembo-green)]"
            : hasError
              ? "bg-red-400"
              : "bg-gray-100 group-hover:bg-gray-200",
        )}
      />

      {/* Hero Image Section */}
      <div
        className={cn(
          "relative transition-all duration-700 ease-in-out bg-[#FDFDFD] flex items-center justify-center overflow-hidden border-b border-gray-50",
          imageUrl ? "h-56 md:h-72" : isActive ? "h-32" : "h-12",
        )}
      >
        {imageUrl ? (
          <div className="w-full h-full relative group/img">
            <img
              src={imageUrl}
              alt="Portada"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
            />
            {isActive && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                <div className="flex gap-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" /> Cambiar Portada
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-xl"
                    onClick={removeHeaderImage}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          isActive && (
            <Button
              variant="ghost"
              className="w-full h-full rounded-none flex flex-col gap-3 hover:bg-gray-50 text-gray-400 hover:text-[var(--puembo-green)] group/upload"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <div className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 group-hover/upload:shadow-md transition-all">
                <ImageIcon className="w-8 h-8 opacity-40 group-hover/upload:opacity-100" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Añadir Portada del Formulario
              </span>
            </Button>
          )
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Header Info Section */}
      <div className="p-5 sm:p-8 md:p-14 space-y-6 md:space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-px w-8 transition-colors",
                error ? "bg-red-500" : "bg-[var(--puembo-green)]",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.4em]",
                error ? "text-red-500" : "text-[var(--puembo-green)]",
              )}
            >
              {error ? "Título Requerido" : "Formulario"}
            </span>
            {hasSettingsError && !isActive && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> Configuración incompleta
              </span>
            )}
          </div>

          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value || ""}
                placeholder="Título del Formulario"
                className={cn(
                  "text-2xl md:text-5xl font-serif font-bold border-none shadow-none px-0 focus-visible:ring-0 rounded-none h-auto py-2 transition-all bg-transparent placeholder:text-gray-200",
                  isActive ? "border-b border-gray-100" : "pointer-events-none",
                  error && "text-red-500",
                )}
              />
            )}
          />
        </div>

        {/* Configuration Switches */}
        {isActive && (
          <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-300">
            {/* Row 1: Access + Max Responses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Internal Switch */}
              <div className="bg-gray-50 rounded-2xl md:rounded-[2rem] border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6">
                  <div className="flex items-center gap-2">
                    {isInternal ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-900">
                      {isInternal ? "Uso Interno" : "Acceso Público"}
                    </Label>
                  </div>
                  <Controller
                    control={control}
                    name="is_internal"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    )}
                  />
                </div>
                <p className="hidden md:block text-[10px] text-gray-500 leading-relaxed px-6 pb-6 -mt-2">
                  {isInternal
                    ? "Solo visible para staff autorizado."
                    : "Accesible mediante enlace público."}
                </p>
              </div>

              {/* Max Responses */}
              <div className={cn(
                "rounded-2xl md:rounded-[2rem] border transition-colors overflow-hidden",
                errors?.max_responses ? "border-red-300 bg-red-50/30" : "bg-gray-50 border-gray-100"
              )}>
                <div className="flex items-center justify-between gap-3 p-4 md:p-6">
                  <div className="flex items-center gap-2 min-w-0">
                    <Hash className={cn("w-4 h-4 shrink-0", errors?.max_responses ? "text-red-500" : "text-violet-600")} />
                    <Label className={cn("text-xs font-black uppercase tracking-widest truncate", errors?.max_responses ? "text-red-600" : "text-gray-900")}>
                      Límite
                    </Label>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0", errors?.max_responses ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-700")}>
                      Req.
                    </span>
                  </div>
                  <Controller
                    control={control}
                    name="max_responses"
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        placeholder="ej. 100"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? null : parseInt(val, 10));
                        }}
                        className={cn(
                          "h-9 text-sm font-bold rounded-xl bg-white w-24 shrink-0",
                          errors?.max_responses ? "border-red-300 focus-visible:ring-red-300" : "border-gray-200"
                        )}
                      />
                    )}
                  />
                </div>
                {errors?.max_responses ? (
                  <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 px-4 md:px-6 pb-4 -mt-2">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.max_responses.message}
                  </p>
                ) : (
                  <p className="hidden md:block text-[10px] text-gray-500 leading-relaxed px-6 pb-6 -mt-2">
                    El formulario se cerrará automáticamente al alcanzar este límite.
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Financial Switch (full width) */}
            <div className={cn(
              "rounded-2xl md:rounded-[2rem] border transition-colors overflow-hidden",
              errors?.financial_field_label ? "border-red-300 bg-red-50/30" : "bg-gray-50 border-gray-100"
            )}>
              <div className="flex items-center justify-between gap-3 p-4 md:p-6">
                <div className="flex items-center gap-2">
                  {isFinancial ? (
                    <Banknote className={cn("w-4 h-4 shrink-0", errors?.financial_field_label ? "text-red-500" : "text-amber-600")} />
                  ) : (
                    <Receipt className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <Label className={cn("text-xs font-black uppercase tracking-widest", errors?.financial_field_label ? "text-red-600" : "text-gray-900")}>
                    Financiero
                  </Label>
                </div>
                <Controller
                  control={control}
                  name="is_financial"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={(val) => {
                        field.onChange(val);
                        if (!val) setValue("financial_field_label", "");
                      }}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  )}
                />
              </div>

              {isFinancial ? (
                <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 -mt-1">
                  {receiptFields.length === 0 ? (
                    /* No file/image fields exist — prominent amber banner */
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                      <p className="text-[11px] font-black text-amber-700 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Falta una pregunta de tipo archivo
                      </p>
                      <p className="text-[10px] text-amber-600/90 leading-relaxed">
                        Para procesar comprobantes necesitas agregar una pregunta de tipo <strong>Imagen</strong> o <strong>Archivo</strong> al formulario. Luego podrás seleccionarla aquí.
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <ArrowDown className="w-3 h-3 text-amber-500 animate-bounce" />
                        <span className="text-[10px] font-bold text-amber-600">Agrega la pregunta en el formulario de abajo</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Controller
                        control={control}
                        name="financial_field_label"
                        render={({ field }) => {
                          const isUnselected = !field.value && !errors?.financial_field_label;
                          return (
                            <div className="space-y-1.5">
                              {isUnselected && (
                                <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                  Selecciona cuál pregunta captura el comprobante
                                </p>
                              )}
                              {errors?.financial_field_label && (
                                <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 shrink-0" />
                                  Debes seleccionar el campo del comprobante
                                </p>
                              )}
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger className={cn(
                                  "h-10 overflow-clip whitespace-nowrap w-full bg-white text-xs font-medium rounded-xl",
                                  errors?.financial_field_label
                                    ? "border-red-300 ring-1 ring-red-300"
                                    : isUnselected
                                    ? "border-amber-300 ring-1 ring-amber-200"
                                    : "border-amber-200/50"
                                )}>
                                  <SelectValue placeholder="Campo de la foto del comprobante..." />
                                </SelectTrigger>
                                <SelectContent align="left">
                                  {receiptFields.map((f) => (
                                    <SelectItem key={f.id} value={f.label} className="h-10 text-ellipsis overflow-hidden whitespace-nowrap w-full bg-white border-amber-200/50 text-xs font-medium rounded-xl">
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <p className="hidden md:block text-[10px] text-gray-500 leading-relaxed px-6 pb-6 -mt-2">
                  Activa esto si el formulario recibe comprobantes de pago para procesarlos con IA.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-(--puembo-green)" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-(--puembo-green)">
              Contexto y Descripción
            </span>
          </div>
          {isActive ? (
            <div className="rounded-[2rem] border-2 border-gray-100 overflow-hidden bg-[#FAFAFA] shadow-inner focus-within:border-[var(--puembo-green)]/30 transition-all">
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value || ""}
                    onChange={field.onChange}
                    className="prose-sm cursor-auto max-w-none min-h-[80px] p-6 text-gray-600 font-light leading-relaxed focus:outline-none bg-transparent"
                  />
                )}
              />
            </div>
          ) : (
            <div
              className={cn(
                "prose prose-sm max-w-none text-gray-600 font-light min-h-[40px] leading-relaxed whitespace-pre-wrap tiptap-content",
                !description && "text-gray-300 italic",
              )}
              dangerouslySetInnerHTML={{
                __html:
                  description ||
                  "Haz clic aquí para añadir una introducción o instrucciones para los usuarios...",
              }}
            />
          )}
        </div>
      </div>

      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--puembo-green)]" />
      )}
    </div>
  );
};

const CheckItem = ({ done, label, sublabel, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-start gap-3 p-4 rounded-2xl border text-left w-full transition-all",
      done
        ? "bg-[var(--puembo-green)]/5 border-[var(--puembo-green)]/20"
        : "bg-amber-50/50 border-amber-200/50 hover:bg-amber-50 hover:border-amber-300",
    )}
  >
    {done ? (
      <CheckCircle2 className="w-5 h-5 text-[var(--puembo-green)] shrink-0 mt-0.5" />
    ) : (
      <Circle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
    )}
    <div>
      <p className={cn("text-xs font-bold", done ? "text-gray-600" : "text-amber-700")}>{label}</p>
      {sublabel && <p className="text-[10px] text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  </button>
);

const OnboardingChecklist = ({ errors, watch, onActivateHeader }) => {
  const title = watch("title");
  const maxResponses = watch("max_responses");
  const isFinancial = watch("is_financial");
  const financialLabel = watch("financial_field_label");

  const hasTitle = title && title.length >= 3;
  const hasMaxResponses = maxResponses && maxResponses >= 1;
  const financialOk = !isFinancial || (isFinancial && !!financialLabel);

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-[3rem] bg-white/60 backdrop-blur-sm p-10 flex flex-col items-center gap-8">
      <div className="relative">
        <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 text-gray-200">
          <Layout className="w-16 h-16" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-[var(--puembo-green)] p-3 rounded-2xl shadow-lg text-white animate-bounce">
          <Plus className="w-6 h-6" />
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <h3 className="text-gray-700 font-bold font-serif text-xl tracking-tight text-center mb-4">
          Configura tu formulario
        </h3>
        <CheckItem
          done={hasTitle}
          label={hasTitle ? "Título configurado" : "Añade un título al formulario"}
          sublabel={!hasTitle ? "Haz clic en la tarjeta de arriba para editarlo" : null}
          onClick={onActivateHeader}
        />
        <CheckItem
          done={hasMaxResponses}
          label={hasMaxResponses ? `Límite: ${maxResponses} respuestas` : "Define el límite de respuestas"}
          sublabel={!hasMaxResponses ? "Requerido — el formulario se cerrará automáticamente" : null}
          onClick={onActivateHeader}
        />
        <CheckItem
          done={financialOk}
          label={financialOk ? "Configuración financiera lista" : "Selecciona el campo del comprobante"}
          sublabel={!financialOk ? "La conciliación financiera requiere un campo de imagen" : null}
          onClick={onActivateHeader}
        />
        <div className="pt-2 text-center">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Una vez configurado el encabezado, añade preguntas con el menú lateral.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function FormCanvas({
  fields,
  activeFieldId,
  onActivateField,
  headerFile,
  setHeaderFile,
  onDuplicate,
  onDelete,
  errors,
}) {
  const { control, watch } = useFormContext();
  // Use useWatch for much better performance and real-time updates of nested fields
  const watchedFields = useWatch({
    control,
    name: "fields",
    defaultValue: fields
  });

  // Analizar qué secciones tienen preguntas con saltos lógicos internos
  const sections = useMemo(() => {
    const groups = [];
    let currentSectionBranching = false;
    let currentSectionId = null;

    // Siempre usar campos observados para capturar cambios en tiempo real
    const fieldsToUse = watchedFields || [];

    // Lista de secciones para destinos
    const sectionList = fieldsToUse
      .filter((f) => f.type === "section")
      .map((f) => ({ id: f.id, label: f.label || "Sección sin título", type: "section" }));

    // Lista de preguntas para destinos (excluyendo secciones)
    const questionList = fieldsToUse
      .filter((f) => f.type !== "section")
      .map((f) => ({ id: f.id, label: f.label || "Pregunta sin título", type: "field" }));

    // Combinar ambas listas ordenadas
    const destinationList = [
      ...sectionList,
      ...questionList,
    ];

    // Analizar la estructura para detectar bifurcaciones por sección
    fieldsToUse.forEach((f) => {
      if (f.type === "section") {
        currentSectionId = f.id;
        currentSectionBranching = false;
      } else if (["radio", "checkbox", "select"].includes(f.type)) {
        const hasJumps = f.options?.some(
          (opt) => opt.next_section_id && opt.next_section_id !== "default",
        );
        if (hasJumps) {
          currentSectionBranching = true;
        }
      }

      if (currentSectionId) {
        const existing = groups.find((g) => g.id === currentSectionId);
        if (existing) {
          existing.hasInternalBranching =
            existing.hasInternalBranching || currentSectionBranching;
        } else {
          groups.push({
            id: currentSectionId,
            hasInternalBranching: currentSectionBranching,
          });
        }
      }
    });

    return { sectionList, destinationList, groupsMeta: groups };
  }, [watchedFields]);

  return (
    <div className="w-full max-w-3xl mx-auto pt-4 md:pt-10">
      <FormHeader
        isActive={activeFieldId === "header"}
        onActivate={() => onActivateField("header")}
        headerFile={headerFile}
        setHeaderFile={setHeaderFile}
        error={!!errors?.title}
        errors={errors}
        fields={fields}
      />

      <SortableContext
        items={fields.map((f) => f.rhf_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-8">
          {fields.map((field, index) => {
            const sectionMeta = sections.groupsMeta.find(
              (g) => g.id === field.id,
            );
            return (
              <QuestionCard
                key={field.rhf_id}
                field={field}
                index={index}
                isActive={activeFieldId === field.id}
                onActivate={() => onActivateField(field.id)}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                sections={sections.destinationList}
                hasInternalBranching={sectionMeta?.hasInternalBranching}
                error={errors?.fields?.[index]?.label}
              />
            );
          })}

          {fields.length === 0 && (
            <OnboardingChecklist errors={errors} watch={watch} onActivateHeader={() => onActivateField("header")} />
          )}
        </div>
      </SortableContext>
    </div>
  );
}
