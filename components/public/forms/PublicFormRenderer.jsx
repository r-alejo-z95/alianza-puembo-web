"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  SendHorizontal,
  Loader2,
  CheckCircle2,
  XCircle,
  Home,
  AlertCircle,
  FileUp,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TurnstileCaptcha from "@/components/shared/TurnstileCaptcha";
import { cn } from "@/lib/utils";
import { verifyCaptcha } from "@/lib/actions";
import { revalidateFormSubmissions } from "@/lib/actions/cache";
import { createClient } from "@/lib/supabase/client";
import { formatInEcuador, getNowInEcuador } from "@/lib/date-utils";

// --- Helper Hook for Logic ---
function useFormLogic(form) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepHistory, setStepHistory] = useState([0]);

  const steps = useMemo(() => {
    if (!form?.form_fields) return [];
    const groups = [];
    let currentGroup = { section: null, fields: [] };

    // Sort fields first to be safe
    const sortedFields = [...form.form_fields].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
    );

    sortedFields.forEach((field) => {
      if (field.type === "section") {
        if (currentGroup.fields.length > 0 || currentGroup.section) {
          groups.push(currentGroup);
        }
        currentGroup = { section: field, fields: [] };
      } else {
        currentGroup.fields.push(field);
      }
    });

    if (currentGroup.fields.length > 0 || currentGroup.section) {
      groups.push(currentGroup);
    }
    return groups;
  }, [form]);

  return { steps, currentStep, setCurrentStep, stepHistory, setStepHistory };
}

export default function PublicFormRenderer({ form }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    trigger,
    getValues,
  } = useForm({ mode: "onChange" });

  const { steps, currentStep, setCurrentStep, stepHistory, setStepHistory } =
    useFormLogic(form);

  const [sending, setSending] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const watchedValues = watch();

  const currentSection = steps[currentStep]?.section;
  const currentFields = steps[currentStep]?.fields || [];

  // Determine if it is the last step
  const isLastStep = useMemo(() => {
    // 1. Check current fields for immediate jump to submit (Radios)
    for (const field of currentFields) {
      if (field.type === "radio" && watchedValues[field.label]) {
        const opt = field.options?.find(
          (o) => o.value === watchedValues[field.label],
        );
        if (opt?.next_section_id === "submit") return true;
        // If it jumps somewhere else, it's definitely NOT the last step (unless that section is empty/last, but simplified logic here)
        if (opt?.next_section_id && opt.next_section_id !== "default")
          return false;
      }
    }

    // 2. Check section logic
    if (currentSection?.next_section_id === "submit") return true;
    if (
      currentSection?.next_section_id &&
      currentSection?.next_section_id !== "default"
    )
      return false;

    // 3. Natural end
    return currentStep === steps.length - 1;
  }, [currentStep, steps.length, currentSection, currentFields, watchedValues]);

  const handleNext = async () => {
    const fieldLabels = currentFields.map((f) => f.label);
    const isStepValid = await trigger(fieldLabels);

    if (!isStepValid) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    const values = getValues();
    let nextStepIndex = currentStep + 1;
    let jumpFound = false;

    // Logic Priority 1: Field Logic (Radio)
    for (const field of currentFields) {
      if (field.type === "radio" && values[field.label]) {
        const selectedOption = field.options?.find(
          (opt) => opt.value === values[field.label],
        );
        if (
          selectedOption?.next_section_id &&
          selectedOption.next_section_id !== "default"
        ) {
          if (selectedOption.next_section_id === "submit") {
            handleSubmit(onSubmit)();
            return;
          }
          const targetIndex = steps.findIndex(
            (s) => s.section?.id === selectedOption.next_section_id,
          );
          if (targetIndex !== -1) {
            nextStepIndex = targetIndex;
            jumpFound = true;
            break;
          }
        }
      }
    }

    // Logic Priority 2: Section Logic
    if (
      !jumpFound &&
      currentSection?.next_section_id &&
      currentSection.next_section_id !== "default"
    ) {
      if (currentSection.next_section_id === "submit") {
        handleSubmit(onSubmit)();
        return;
      }
      const targetIndex = steps.findIndex(
        (s) => s.section?.id === currentSection.next_section_id,
      );
      if (targetIndex !== -1) nextStepIndex = targetIndex;
    }

    if (nextStepIndex < steps.length) {
      setStepHistory((prev) => [...prev, nextStepIndex]);
      setCurrentStep(nextStepIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (isLastStep || nextStepIndex >= steps.length) {
      // Safety net: if calculated next step is out of bounds, treat as submit
      handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];
      newHistory.pop();
      const previousStep = newHistory[newHistory.length - 1];
      setStepHistory(newHistory);
      setCurrentStep(previousStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data) => {
    if (form?.enabled === false) {
      toast.error("Este formulario ya no acepta respuestas.");
      return;
    }
    if (!captchaToken) {
      toast.error("Por favor completa la verificación de seguridad.");
      return;
    }

    setSending(true);
    try {
      const { isValid: isCaptchaValid } = await verifyCaptcha(captchaToken);
      if (!isCaptchaValid) {
        toast.error("Verificación fallida. Intenta nuevamente.");
        setCaptchaKey((prev) => prev + 1);
        setSending(false);
        return;
      }

      const supabase = createClient();
      const processedData = {};
      const rawDataForDb = {};

      // Process fields
      for (const key in data) {
        const value = data[key];
        const fieldDef = form.form_fields.find((f) => f.label === key);
        if (!fieldDef) continue; // Skip if not a known field

        const fieldType = fieldDef.type || fieldDef.field_type;

        if (value instanceof FileList && value.length > 0) {
          // Handle File Upload (to Base64 for Sheet, and maybe metadata for DB)
          const file = value[0];
          const reader = new FileReader();
          const fileReadPromise = new Promise((resolve, reject) => {
            reader.onload = () =>
              resolve({
                type: "file",
                name: file.name,
                data: reader.result.split(",")[1], // base64
                mimeType: file.type,
              });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const fileData = await fileReadPromise;
          processedData[key] = fileData; // Sent to Edge Function for Drive Upload
          rawDataForDb[key] = {
            _type: "file",
            name: file.name,
            info: "Archivo subido a Google Drive",
          };
        } else if (fieldType === "checkbox" && typeof value === "object") {
          // Checkboxes return object { val1: true, val2: false }
          const selected = Object.keys(value)
            .filter((k) => value[k])
            .map(
              (k) => fieldDef.options.find((o) => o.value === k)?.label || k,
            );
          processedData[key] = selected.join("\n");
          rawDataForDb[key] = selected;
        } else if (fieldType === "radio" || fieldType === "select") {
          // Find label for value
          const opt = fieldDef.options?.find((o) => o.value === value);
          const labelValue = opt ? opt.label : value;
          processedData[key] = labelValue;
          rawDataForDb[key] = labelValue;
        } else {
          processedData[key] = value;
          rawDataForDb[key] = value;
        }
      }

      processedData.Timestamp = formatInEcuador(
        getNowInEcuador(),
        "d/M/yyyy HH:mm:ss",
      );
      rawDataForDb.Timestamp = processedData.Timestamp;

      // 1. Send to Edge Function (Sheets + Drive)
      await supabase.functions.invoke("sheets-drive-integration", {
        body: { formId: form.id, formData: processedData },
      });

      // 2. Save to Supabase
      const { error: insErr } = await supabase.from("form_submissions").insert([
        {
          form_id: form.id,
          data: rawDataForDb,
          user_agent: navigator.userAgent,
        },
      ]);

      if (insErr) throw insErr;

      await revalidateFormSubmissions(form.id);

      setSubmissionStatus("success");
      reset();
      setCurrentStep(0);
      setStepHistory([0]);
    } catch (e) {
      console.error(e);
      setSubmissionStatus("error");
    }
    setSending(false);
  };

  // Progress calculation
  const progress =
    steps.length > 1 ? ((currentStep + 1) / steps.length) * 100 : 100;

  return (
    <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Branding */}
      <div className="flex flex-col items-center gap-6 mb-4">
        <Image
          src="/brand/logo-puembo.png"
          alt="Logo"
          width={180}
          height={60}
          className="h-12 w-auto object-contain"
          priority
        />
        {steps.length > 1 && (
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--puembo-green)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <Card className="overflow-hidden border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white relative mx-2 md:mx-0">
        {sending && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4 animate-in fade-in">
            <Loader2 className="w-12 h-12 text-[var(--puembo-green)] animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--puembo-green)]">
              Enviando Respuesta...
            </p>
          </div>
        )}

        {/* Cover Image */}
        {currentStep === 0 && form.image_url && (
          <div className="relative w-full aspect-video md:aspect-[21/9]">
            <Image
              src={form.image_url}
              alt={form.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
              <h1 className="text-2xl md:text-4xl font-bold font-serif text-white shadow-black/20 drop-shadow-lg leading-tight">
                {form.title}
              </h1>
            </div>
          </div>
        )}

        <CardHeader
          className={cn(
            "px-6 md:px-12 space-y-4 md:space-y-6 pb-4",
            currentStep === 0 && form.image_url ? "pt-6" : "pt-8 md:pt-12",
          )}
        >
          <div className="space-y-3 md:space-y-4">
            {/* Section Label */}
            <div className="flex items-center gap-3">
              <div className="h-px w-6 md:w-8 bg-[var(--puembo-green)]" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--puembo-green)]">
                {currentStep === 0
                  ? "Información"
                  : currentSection?.label || "Continuación"}
              </span>
            </div>

            {/* Dynamic Title (If not on Cover) */}
            {(!form.image_url || currentStep > 0) && (
              <CardTitle className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight font-serif">
                {currentStep === 0
                  ? form.title
                  : currentSection?.label || "Sección"}
              </CardTitle>
            )}

            {/* Description / Help Text */}
            {currentStep === 0 && form.description && (
              <div
                className="tiptap-content text-gray-600 text-sm md:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: form.description }}
              />
            )}
            {currentStep > 0 && currentSection?.help_text && (
              <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed whitespace-pre-line">
                {currentSection.help_text}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6 md:px-12 pt-6 md:pt-8 pb-10 md:pb-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-12">
            <div className="space-y-8 md:space-y-10 min-h-[100px]">
              {currentFields.map((field) => {
                const fieldId = `field-${field.id}`;
                const isRequired = field.required ?? field.is_required;
                const hasError = errors[field.label];

                return (
                  <div
                    key={field.id}
                    className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-right-4 duration-500"
                  >
                    <Label
                      htmlFor={fieldId}
                      className={cn(
                        "text-sm md:text-base font-bold block ml-1 uppercase tracking-widest",
                        hasError ? "text-red-500" : "text-gray-700",
                      )}
                    >
                      {field.label}{" "}
                      {isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    {field.help_text && (
                      <p className="text-xs text-gray-500 font-light leading-relaxed ml-1">
                        {field.help_text}
                      </p>
                    )}

                    {/* Attachment View */}
                    {field.attachment_url && (
                      <div className="mb-4">
                        {field.attachment_type === "image" ? (
                          <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <Image
                              src={field.attachment_url}
                              alt="Referencia"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <a
                            href={field.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            <AlertCircle className="w-4 h-4" /> Ver Documento
                            Adjunto
                          </a>
                        )}
                      </div>
                    )}

                    <div className="relative">
                      {renderFieldInput(
                        field,
                        fieldId,
                        register,
                        control,
                        isRequired,
                        errors,
                      )}
                    </div>

                    {hasError && (
                      <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Campo requerido
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {isLastStep && (
              <div className="animate-in fade-in zoom-in duration-500 space-y-6 pt-6 border-t border-gray-100">
                <TurnstileCaptcha
                  key={captchaKey}
                  onVerify={setCaptchaToken}
                  className="flex justify-center"
                />
                <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 leading-relaxed text-center">
                    <span className="font-bold text-gray-700 block mb-2 uppercase tracking-widest text-[9px]">
                      Protección de Datos Personales
                    </span>
                    Al enviar esta respuesta, usted autoriza a la Iglesia
                    Alianza Puembo el tratamiento de sus datos personales con
                    fines institucionales.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-50">
              {stepHistory.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-base font-bold rounded-xl hover:bg-gray-50"
                  onClick={handleBack}
                  disabled={sending}
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Anterior
                </Button>
              )}
              <Button
                type={isLastStep ? "submit" : "button"}
                variant="green"
                className="flex-[2] h-12 text-base font-bold rounded-xl shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-[0.98]"
                disabled={isLastStep && (sending || !captchaToken)}
                onClick={isLastStep ? undefined : handleNext}
              >
                {isLastStep ? (
                  sending ? (
                    <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  ) : (
                    <SendHorizontal className="mr-2 w-4 h-4" />
                  )
                ) : (
                  <ChevronRight className="ml-2 w-4 h-4" />
                )}
                {isLastStep
                  ? sending
                    ? "Enviando..."
                    : "Finalizar y Enviar"
                  : "Siguiente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
        Una Familia de Familias
      </p>

      {/* Success/Error Dialog */}
      <Dialog
        open={submissionStatus !== null}
        onOpenChange={(open) =>
          !open && submissionStatus === "error" && setSubmissionStatus(null)
        }
      >
        <DialogContent className="rounded-[2rem] p-10 max-w-sm mx-auto text-center [&>button]:hidden border-none shadow-2xl">
          {submissionStatus === "success" ? (
            <div className="space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-[var(--puembo-green)] mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-serif font-bold">
                  ¡Recibido!
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 font-light">
                  Tu respuesta ha sido enviada correctamente.
                </DialogDescription>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  variant="green"
                  className="w-full h-11 text-xs font-bold uppercase tracking-widest rounded-xl"
                  onClick={() => window.location.reload()}
                >
                  Nueva respuesta
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-11 text-xs font-bold uppercase tracking-widest text-gray-400 gap-2"
                  onClick={() => router.push("/")}
                >
                  <Home className="w-4 h-4" /> Ir al inicio
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in shake duration-300">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto">
                <XCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-serif font-bold">
                  Error
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 font-light">
                  No pudimos procesar tu envío. Inténtalo de nuevo.
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-bold uppercase tracking-widest rounded-xl"
                onClick={() => setSubmissionStatus(null)}
              >
                Intentar de nuevo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Helper for Input Rendering ---
function renderFieldInput(
  field,
  fieldId,
  register,
  control,
  isRequired,
  errors,
) {
  const baseClass =
    "h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white transition-all text-base hover:bg-gray-50";

  switch (field.type || field.field_type) {
    case "text":
    case "email":
      return (
        <Input
          id={fieldId}
          type={field.type === "email" ? "email" : "text"}
          placeholder={field.placeholder}
          className={baseClass}
          {...register(field.label, { required: isRequired })}
        />
      );
    case "textarea":
      return (
        <Textarea
          id={fieldId}
          placeholder={field.placeholder}
          className={cn(baseClass, "min-h-[120px] py-3")}
          {...register(field.label, { required: isRequired })}
        />
      );
    case "number":
      return (
        <Controller
          name={field.label}
          control={control}
          rules={{ required: isRequired }}
          render={({ field: ctrlField }) => (
            <Input
              id={fieldId}
              type="text"
              inputMode="numeric"
              placeholder={field.placeholder}
              className={baseClass}
              value={ctrlField.value || ""}
              onChange={(e) =>
                ctrlField.onChange(e.target.value.replace(/[^0-9]/g, ""))
              }
            />
          )}
        />
      );
    case "date":
      return (
        <Input
          id={fieldId}
          type="date"
          className={baseClass}
          {...register(field.label, { required: isRequired })}
        />
      );
    case "radio":
      return (
        <Controller
          name={field.label}
          control={control}
          rules={{ required: isRequired }}
          render={({ field: ctrlField }) => (
            <RadioGroup
              onValueChange={ctrlField.onChange}
              value={ctrlField.value || ""}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {field.options?.map((opt) => (
                <Label
                  key={opt.id}
                  htmlFor={`${fieldId}-${opt.id}`}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                    ctrlField.value === opt.value
                      ? "bg-white border-[var(--puembo-green)] shadow-md shadow-green-900/5 ring-1 ring-[var(--puembo-green)]"
                      : "bg-gray-50/30 border-gray-200 hover:bg-white",
                  )}
                >
                  <RadioGroupItem
                    value={opt.value}
                    id={`${fieldId}-${opt.id}`}
                    className="text-[var(--puembo-green)]"
                  />
                  <span className="font-bold text-gray-600 text-sm">
                    {opt.label}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      );
    case "checkbox":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field.options?.map((opt) => (
            <Controller
              key={opt.id}
              name={`${field.label}.${opt.value}`}
              control={control}
              render={({ field: ctrlField }) => (
                <Label
                  htmlFor={`${fieldId}-${opt.id}`}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                    ctrlField.value
                      ? "bg-white border-[var(--puembo-green)] shadow-md shadow-green-900/5 ring-1 ring-[var(--puembo-green)]"
                      : "bg-gray-50/30 border-gray-200 hover:bg-white",
                  )}
                >
                  <Checkbox
                    id={`${fieldId}-${opt.id}`}
                    checked={ctrlField.value}
                    onCheckedChange={ctrlField.onChange}
                    className="h-5 w-5 rounded-md"
                  />
                  <span className="font-bold text-gray-600 text-sm">
                    {opt.label}
                  </span>
                </Label>
              )}
            />
          ))}
        </div>
      );
    case "select":
      return (
        <Controller
          name={field.label}
          control={control}
          rules={{ required: isRequired }}
          render={({ field: ctrlField }) => (
            <Select
              onValueChange={ctrlField.onChange}
              value={ctrlField.value || ""}
            >
              <SelectTrigger className={baseClass}>
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-none">
                {field.options?.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.value}
                    className="text-sm font-medium"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      );
    case "file":
    case "image":
      return (
        <div className="bg-gray-50/30 border border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-white transition-colors">
          <Input
            id={fieldId}
            type="file"
            accept={field.type === "image" ? "image/*" : undefined}
            className="hidden"
            {...register(field.label, { required: isRequired })}
          />
          <Label
            htmlFor={fieldId}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] rounded-full flex items-center justify-center">
              <FileUp className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Haz clic para subir archivo
            </span>
            <span className="text-xs text-gray-400">Máximo 10MB</span>
          </Label>
        </div>
      );
    default:
      return null;
  }
}
