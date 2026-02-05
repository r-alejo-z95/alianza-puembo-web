"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TurnstileCaptcha from "@/components/shared/TurnstileCaptcha";
import { cn } from "@/lib/utils";
import {
  verifyCaptcha,
  notifyFormSubmission,
  uploadReceipt,
} from "@/lib/actions";
import { compressImage } from "@/lib/image-compression";
import { createClient } from "@/lib/supabase/client";
import { formatInEcuador, getNowInEcuador } from "@/lib/date-utils";

// --- Logic Hook ---
function useFormLogic(form) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepHistory, setStepHistory] = useState([0]);

  const steps = useMemo(() => {
    if (!form?.form_fields) return [];
    const groups = [];
    let currentGroup = { section: null, fields: [] };

    const sortedFields = [...form.form_fields]
      .map((f) => {
        let normalizedOptions = [];
        try {
          normalizedOptions =
            typeof f.options === "string"
              ? JSON.parse(f.options)
              : f.options || [];
        } catch (e) {
          normalizedOptions = [];
        }
        return {
          ...f,
          type: f.type || f.field_type,
          options: normalizedOptions,
        };
      })
      .sort(
        (a, b) =>
          (a.order_index ?? a.order ?? 0) - (b.order_index ?? b.order ?? 0),
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

  const jumpTargets = useMemo(() => {
    const targets = new Set();
    steps.forEach((step) => {
      step.fields.forEach((f) => {
        f.options?.forEach((o) => {
          if (
            o.next_section_id &&
            o.next_section_id !== "default" &&
            o.next_section_id !== "submit"
          ) {
            targets.add(o.next_section_id);
          }
        });
        if (
          f.next_section_id &&
          f.next_section_id !== "default" &&
          f.next_section_id !== "submit"
        ) {
          targets.add(f.next_section_id);
        }
      });
    });
    return targets;
  }, [steps]);

  return {
    steps,
    currentStep,
    setCurrentStep,
    stepHistory,
    setStepHistory,
    jumpTargets,
  };
}

// --- Components ---

const FieldInput = ({
  field,

  register,

  control,

  errors,

  isRequired,

  watch,

  setValue,
}) => {
  const fieldId = `field-${field.id}`;

  const baseClass =
    "w-full min-h-[56px] bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[var(--puembo-green)]/10 focus:border-[var(--puembo-green)] transition-all px-5 text-base shadow-sm hover:border-gray-300 hover:bg-white";

  const selectedFile = watch(field.label);

  const fileName =
    selectedFile && selectedFile instanceof FileList && selectedFile.length > 0
      ? selectedFile[0].name
      : null;

  const options = field.options || [];

  switch (field.type) {
    case "text":

    case "email":
      return (
        <Input
          id={fieldId}
          type={field.type === "email" ? "email" : "text"}
          placeholder={field.placeholder || "Tu respuesta..."}
          className={baseClass}
          {...register(field.label, { required: isRequired })}
        />
      );

    case "textarea":
      return (
        <Textarea
          id={fieldId}
          placeholder={field.placeholder || "Escribe aquí..."}
          className={cn(
            baseClass,
            "min-h-[140px] py-5 leading-relaxed resize-none",
          )}
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
              placeholder={field.placeholder || "0"}
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
              className="grid grid-cols-1 gap-3"
            >
              {options.map((opt) => (
                <Label
                  key={opt.id}
                  htmlFor={`${fieldId}-${opt.id}`}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden",

                    ctrlField.value === opt.value
                      ? "bg-[var(--puembo-green)]/5 border-[var(--puembo-green)] ring-4 ring-[var(--puembo-green)]/10"
                      : "bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm hover:border-gray-200 hover:bg-white",
                  )}
                >
                  <RadioGroupItem
                    value={opt.value}
                    id={`${fieldId}-${opt.id}`}
                    className={cn(
                      "w-5 h-5 border-2",

                      ctrlField.value === opt.value
                        ? "text-[var(--puembo-green)] border-[var(--puembo-green)]"
                        : "border-gray-300",
                    )}
                  />

                  <span
                    className={cn(
                      "font-semibold text-base transition-colors",

                      ctrlField.value === opt.value
                        ? "text-[var(--puembo-green)]"
                        : "text-gray-700",
                    )}
                  >
                    {opt.label}
                  </span>

                  {ctrlField.value === opt.value && (
                    <motion.div
                      layoutId={`radio-bg-${field.id}`}
                      className="absolute inset-0 bg-[var(--puembo-green)]/5 -z-10"
                      initial={false}
                    />
                  )}
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      );

    case "checkbox":
      return (
        <div className="grid grid-cols-1 gap-3">
          {options.map((opt) => (
            <Controller
              key={opt.id}
              name={`${field.label}.${opt.value}`}
              control={control}
              render={({ field: ctrlField }) => (
                <Label
                  htmlFor={`${fieldId}-${opt.id}`}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group",

                    ctrlField.value
                      ? "bg-[var(--puembo-green)]/5 border-[var(--puembo-green)] ring-4 ring-[var(--puembo-green)]/10"
                      : "bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm hover:border-gray-200 hover:bg-white",
                  )}
                >
                  <Checkbox
                    id={`${fieldId}-${opt.id}`}
                    checked={ctrlField.value}
                    onCheckedChange={ctrlField.onChange}
                    className={cn(
                      "w-5 h-5 rounded-lg transition-all",

                      ctrlField.value
                        ? "data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                        : "border-gray-300",
                    )}
                  />

                  <span
                    className={cn(
                      "font-semibold text-base transition-colors",

                      ctrlField.value
                        ? "text-[var(--puembo-green)]"
                        : "text-gray-700",
                    )}
                  >
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
                <SelectValue placeholder="Selecciona una opción..." />
              </SelectTrigger>

              <SelectContent className="rounded-2xl shadow-2xl border-none p-2 bg-white/95 backdrop-blur-md">
                {options.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.value}
                    className="rounded-xl cursor-pointer text-base py-3 px-4 focus:bg-[var(--puembo-green)]/10 focus:text-[var(--puembo-green)] transition-colors"
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
        <div className="relative group">
          <Input
            id={fieldId}
            type="file"
            accept={field.type === "image" ? "image/*" : undefined}
            className="hidden"
            {...register(field.label, { required: isRequired })}
          />

          {!fileName ? (
            <Label htmlFor={fieldId} className="cursor-pointer block">
              <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-5 text-gray-400 group-hover:border-[var(--puembo-green)] group-hover:bg-[var(--puembo-green)]/5 transition-all bg-white/50 backdrop-blur-sm shadow-sm">
                <div className="p-5 bg-gray-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-[var(--puembo-green)]" />
                </div>

                <div className="text-center space-y-2">
                  <p className="font-black text-[11px] uppercase tracking-[0.25em] text-gray-600 group-hover:text-[var(--puembo-green)]">
                    Haz clic para subir{" "}
                    {field.type === "image" ? "una foto" : "un archivo"}
                  </p>

                  <p className="text-[10px] font-medium opacity-60">
                    Soporta archivos de hasta 5MB
                  </p>
                </div>
              </div>
            </Label>
          ) : (
            <div className="border-2 border-[var(--puembo-green)] bg-[var(--puembo-green)]/5 rounded-[2rem] p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[var(--puembo-green)] shadow-lg ring-4 ring-[var(--puembo-green)]/5">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-base font-bold text-gray-800 line-clamp-1 max-w-[300px]">
                  {fileName}
                </p>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--puembo-green)]">
                  ¡Archivo listo para enviar!
                </p>
              </div>

              <div className="flex gap-3 w-full max-w-[320px]">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-white"
                  onClick={() => document.getElementById(fieldId).click()}
                >
                  Cambiar
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setValue(field.label, null)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default function FluentRenderer({ form, isPreview = false }) {
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
    setValue,
  } = useForm({ mode: "onChange" });

  const {
    steps,
    currentStep,
    setCurrentStep,
    stepHistory,
    setStepHistory,
    jumpTargets,
  } = useFormLogic(form);

  const [sending, setSending] = useState(false);

  const [submissionStatus, setSubmissionStatus] = useState(null);

  const [captchaToken, setCaptchaToken] = useState(null);

  const [captchaKey, setCaptchaKey] = useState(0);

  // Auto-scroll al cambiar de sección
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const watchedValues = watch();

  const currentSection = steps[currentStep]?.section;

  const currentFields = steps[currentStep]?.fields || [];

  const hasBranchingRadio = useMemo(() => {
    return currentFields.some(
      (field) =>
        field.type === "radio" &&
        field.options?.some(
          (opt) => opt.next_section_id && opt.next_section_id !== "default",
        ),
    );
  }, [currentFields]);

  const isBranchingSelected = useMemo(() => {
    if (!hasBranchingRadio) return true;

    const branchingRadios = currentFields.filter(
      (field) =>
        field.type === "radio" &&
        field.options?.some(
          (opt) => opt.next_section_id && opt.next_section_id !== "default",
        ),
    );

    return branchingRadios.every((field) => !!watchedValues[field.label]);
  }, [hasBranchingRadio, currentFields, watchedValues]);

  const isLastStep = useMemo(() => {
    const branchingField = currentFields.find(
      (f) =>
        f.type === "radio" &&
        f.options?.some(
          (o) => o.next_section_id && o.next_section_id !== "default",
        ),
    );

    const val = branchingField ? watchedValues[branchingField.label] : null;

    if (branchingField && !val) return false;

    if (val) {
      const opt = branchingField.options.find((o) => o.value === val);

      if (opt?.next_section_id === "submit") return true;

      if (opt?.next_section_id && opt.next_section_id !== "default")
        return false;
    }

    const nextStep = steps[currentStep + 1];

    if (nextStep?.section) {
      const nextId = nextStep.section.id || nextStep.section._id;

      if (jumpTargets.has(nextId)) return true;
    }

    return currentStep === steps.length - 1;
  }, [currentStep, steps, currentFields, watchedValues, jumpTargets]);

  const handleNext = async () => {
    const fieldLabels = currentFields.map((f) => f.label);

    // Skip validation if in preview mode
    const isStepValid = isPreview ? true : await trigger(fieldLabels);

    if (!isStepValid) {
      toast.error("Por favor completa los campos requeridos.");

      return;
    }

    const values = getValues();

    let jumpTargetId = null;

    for (const field of currentFields) {
      const val = values[field.label];

      if (field.type === "radio" && val) {
        const selectedOption = field.options?.find((opt) => opt.value === val);

        if (
          selectedOption?.next_section_id &&
          selectedOption.next_section_id !== "default"
        ) {
          jumpTargetId = selectedOption.next_section_id;

          break;
        }
      }
    }

    if (!jumpTargetId && currentFields.length > 0) {
      const lastField = currentFields[currentFields.length - 1];

      if (
        lastField.next_section_id &&
        lastField.next_section_id !== "default"
      ) {
        jumpTargetId = lastField.next_section_id;
      }
    }

    if (jumpTargetId === "submit") {
      if (isPreview) {
        onSubmit(values);
      } else {
        handleSubmit(onSubmit)();
      }

      return;
    }

    if (jumpTargetId) {
      const targetIndex = steps.findIndex(
        (s) =>
          s.section?.id === jumpTargetId || s.section?._id === jumpTargetId,
      );

      if (targetIndex !== -1) {
        setStepHistory((prev) => [...prev, targetIndex]);

        setCurrentStep(targetIndex);

        return;
      }
    }

    if (!isLastStep) {
      const nextIndex = currentStep + 1;

      setStepHistory((prev) => [...prev, nextIndex]);

      setCurrentStep(nextIndex);
    } else {
      if (isPreview) {
        onSubmit(values);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];

      newHistory.pop();

      const previousStep = newHistory[newHistory.length - 1];

      setStepHistory(newHistory);

      setCurrentStep(previousStep);
    }
  };

  const onSubmit = async (data) => {
    if (isPreview) {
      toast.success("Vista previa: Formulario válido", {
        description:
          "En el sitio real, esta respuesta se guardaría en la base de datos.",
      });
      return;
    }

    if (form?.enabled === false) {
      toast.error("Formulario cerrado.");
      return;
    }

    // El CAPTCHA solo es requerido si NO es interno y NO es preview
    const needsCaptcha = !form.is_internal && !isPreview;

    if (needsCaptcha && !captchaToken) {
      toast.error("Verificación de seguridad requerida.");
      return;
    }

    setSending(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (needsCaptcha) {
        const { isValid } = await verifyCaptcha(captchaToken);
        if (!isValid) {
          toast.error("Captcha inválido.");
          setCaptchaKey((p) => p + 1);
          setSending(false);
          return;
        }
      }

      const processedData = {};
      const rawDataForDb = {};

      for (const key in data) {
        const value = data[key];
        const fieldDef = form.form_fields.find((f) => f.label === key);

        if (!fieldDef || (fieldDef.type || fieldDef.field_type) === "section")
          continue;

        if (value instanceof FileList && value.length > 0) {
          let file = value[0];

          // 1. Compresión de imagen en el cliente
          if (file.type.startsWith("image/")) {
            try {
              const compressed = await compressImage(file);
              if (compressed) file = compressed;
            } catch (err) {
              console.warn("Error comprimiendo imagen:", err);
            }
          }

          // 2. Subida para conciliación financiera (si aplica)
          let financialReceiptPath = null;
          if (form.is_financial && form.financial_field_label === key) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("formSlug", form.slug);

            try {
              const uploadRes = await uploadReceipt(formData);
              if (uploadRes.success) {
                financialReceiptPath = uploadRes.fullPath;
              }
            } catch (e) {
              console.error("Error subiendo comprobante financiero:", e);
            }
          }

          const reader = new FileReader();
          const fileData = await new Promise((resolve) => {
            reader.onload = () =>
              resolve({
                type: "file",
                name: file.name,
                data: reader.result.split(",")[1],
                mimeType: file.type,
              });
            reader.readAsDataURL(file);
          });

          processedData[key] = fileData;
          rawDataForDb[key] = {
            _type: "file",
            name: file.name,
            info: "Archivo en Drive",
            ...(financialReceiptPath
              ? { financial_receipt_path: financialReceiptPath }
              : {}),
          };
        } else if (typeof value === "object" && !Array.isArray(value)) {
          const fieldOptions =
            typeof fieldDef.options === "string"
              ? JSON.parse(fieldDef.options)
              : fieldDef.options || [];

          const selected = Object.keys(value)
            .filter((k) => value[k])
            .map((k) => fieldOptions.find((o) => o.value === k)?.label || k);

          processedData[key] = selected.join("\n");
          rawDataForDb[key] = selected;
        } else if (fieldDef.options) {
          const fieldOptions =
            typeof fieldDef.options === "string"
              ? JSON.parse(fieldDef.options)
              : fieldDef.options || [];

          const opt = fieldOptions.find((o) => o.value === value);
          const label = opt ? opt.label : value;
          processedData[key] = label;
          rawDataForDb[key] = label;
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

      // Solo llamar a la integración de Google si NO es interno
      if (!form.is_internal) {
        await supabase.functions.invoke("sheets-drive-integration", {
          body: { formId: form.id, formData: processedData },
        });
      }

      const submissionData = {
        form_id: form.id,
        data: rawDataForDb,
        user_agent: navigator.userAgent,
      };

      // Solo incluir user_id si el formulario es interno
      if (form.is_internal && user?.id) {
        submissionData.user_id = user.id;
      }

      const { error } = await supabase
        .from("form_submissions")
        .insert([submissionData]);

      if (error) {
        console.error("Supabase Submission Error:", error);
        throw error;
      }

      // 3. Notificar al autor del formulario (Dashboard + Email)
      // Pasamos el ID del usuario actual si es interno para personalizar el mensaje
      await notifyFormSubmission(form.title, form.slug, form.user_id, user?.id);

      setSubmissionStatus("success");
      reset();
      setCaptchaToken(null);
      setCaptchaKey((p) => p + 1);
    } catch (e) {
      console.error("Form Submission detailed error:", e);
      setSubmissionStatus("error");
    }

    setSending(false);
  };

  const progress = useMemo(() => {
    if (steps.length <= 1) return 0;

    if (isLastStep) return 100;

    let remainingSteps = steps.length - currentStep;

    const branchingField = currentFields.find((f) => f.type === "radio");

    const val = branchingField ? watchedValues[branchingField.label] : null;

    if (val) {
      const opt = branchingField.options.find((o) => o.value === val);

      if (opt?.next_section_id && opt.next_section_id !== "default") {
        const targetIndex = steps.findIndex(
          (s) =>
            s.section?.id === opt.next_section_id ||
            s.section?._id === opt.next_section_id,
        );

        if (targetIndex !== -1) {
          remainingSteps = steps.length - targetIndex + 1;
        }
      }
    }

    const historyWeight = stepHistory.length;

    const totalEstimated = historyWeight + remainingSteps - 1;

    return Math.min(Math.round((historyWeight / totalEstimated) * 100), 95);
  }, [
    stepHistory.length,
    steps,
    currentStep,
    isLastStep,
    watchedValues,
    currentFields,
  ]);

  const needsCaptcha = useMemo(
    () => !form.is_internal && !isPreview,
    [form.is_internal, isPreview],
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-5 md:px-0 pb-32">
      {/* Progress Bar */}

      <div className="fixed top-0 left-0 w-full h-2 bg-gray-100/50 backdrop-blur-sm z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--puembo-green)] to-[var(--puembo-green)] opacity-90 shadow-[0_0_15px_rgba(var(--puembo-green-rgb),0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
      </div>

      <div className="flex justify-center py-10">
        <Image
          src="/brand/logo-puembo.png"
          width={180}
          height={60}
          alt="Logo"
          className="h-12 w-auto object-contain transition-all hover:scale-105"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12"
        >
          {currentStep === 0 && (
            <div className="space-y-8 mb-16">
              {form.image_url && (
                <div className="relative w-full aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl mb-12 group">
                  <Image
                    src={form.image_url}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt="Cover"
                    priority
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-10 md:p-14 text-left w-full">
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-5xl font-black font-serif text-white drop-shadow-xl leading-tight"
                    >
                      {form.title}
                    </motion.h1>
                  </div>
                </div>
              )}

              {!form.image_url && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-black font-serif text-gray-900 leading-tight"
                >
                  {form.title}
                </motion.h1>
              )}

              {form.description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="border-b-1 border-(--puembo-green) p-8 prose prose-lg mx-auto text-gray-800 font-medium leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: form.description }}
                />
              )}
            </div>
          )}

          <div className="space-y-14">
            {currentSection && (
              <div className="mb-10 relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-[var(--puembo-green)] rounded-full hidden md:block" />

                <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900 leading-tight">
                  {currentSection.label || "Información"}
                </h2>

                {currentSection.help_text && (
                  <p className="text-gray-500 mt-4 text-lg font-medium leading-relaxed italic opacity-80">
                    {currentSection.help_text}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-10 pb-12">
              {currentFields.map((field, idx) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  className="space-y-4 group"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor={`field-${field.id}`}
                      className="text-lg font-black text-gray-800 flex items-center gap-2 group-focus-within:text-[var(--puembo-green)] transition-colors"
                    >
                      {field.label}

                      {field.required && (
                        <span className="text-[var(--puembo-green)] text-lg">
                          *
                        </span>
                      )}
                    </Label>

                    {field.help_text && (
                      <p className="text-sm text-gray-500 font-medium opacity-70 leading-relaxed">
                        {field.help_text}
                      </p>
                    )}
                  </div>

                  {field.attachment_url && (
                    <div className="rounded-[1.5rem] overflow-hidden border border-gray-100 max-w-md shadow-sm group-hover:shadow-md transition-shadow">
                      {field.attachment_type === "image" ? (
                        <img
                          src={field.attachment_url}
                          className="w-full h-auto"
                          alt="Ref"
                        />
                      ) : (
                        <a
                          href={field.attachment_url}
                          target="_blank"
                          className="block p-5 bg-white hover:bg-gray-50 text-[var(--puembo-green)] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[var(--puembo-green)]/10 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          Ver Documento de Referencia
                        </a>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <FieldInput
                      field={field}
                      register={register}
                      control={control}
                      errors={errors}
                      isRequired={field.required}
                      watch={watch}
                      setValue={setValue}
                    />
                  </div>

                  <AnimatePresence>
                    {errors[field.label] && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 pt-1 px-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Este campo es
                        obligatorio
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {isLastStep && (
            <div className="pt-8 space-y-6">
              {needsCaptcha && (
                <div className="flex justify-center scale-110 md:scale-125 py-2">
                  <TurnstileCaptcha
                    key={captchaKey}
                    onVerify={setCaptchaToken}
                  />
                </div>
              )}

              {isPreview && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[1.5rem] text-center">
                  <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">
                    Modo Vista Previa
                  </p>
                  <p className="text-[10px] text-blue-400 mt-1">
                    El CAPTCHA está desactivado en este modo.
                  </p>
                </div>
              )}

              {form.is_internal && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[1.5rem] text-center">
                  <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest">
                    Proceso Staff Autorizado
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-1">
                    Este envío será registrado bajo tu perfil administrativo.
                  </p>
                </div>
              )}

              {!form.is_internal && (
                <div className="bg-white/50 backdrop-blur-sm p-5 rounded-[1.5rem] border border-gray-100 shadow-sm">
                  <p className="text-[10px] text-gray-500 leading-relaxed text-center font-medium">
                    Al enviar este formulario, usted autoriza a la Iglesia
                    Alianza Puembo el tratamiento de sus datos personales para
                    fines de contacto y gestión eclesial, conforme a la Ley
                    Orgánica de Protección de Datos Personales de Ecuador.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pantalla de Bloqueo durante el Envío */}
      <Dialog open={sending && submissionStatus === null}>
        <DialogContent className="sm:max-w-md rounded-[3rem] border-none p-0 overflow-hidden shadow-2xl [&>button]:hidden bg-white/80 backdrop-blur-xl">
          <div className="p-16 text-center flex flex-col items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-gray-100 rounded-full animate-pulse" />
              <div className="absolute inset-0 border-t-4 border-[var(--puembo-green)] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Send className="w-8 h-8 text-[var(--puembo-green)] animate-bounce" />
              </div>
            </div>
            <div className="space-y-3">
              <DialogTitle className="text-2xl font-serif font-black text-gray-900">
                Enviando Respuesta
              </DialogTitle>
              <DialogDescription className="text-gray-500 font-medium text-sm uppercase tracking-widest animate-pulse">
                Procesando información...
              </DialogDescription>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl bg-white/90 backdrop-blur-xl border border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-2 md:p-4 z-40">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={sending || stepHistory.length <= 1}
            className={cn(
              "rounded-full h-12 md:h-14 px-4 md:px-8 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all",
              stepHistory.length <= 1 && "opacity-0 pointer-events-none",
            )}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-3" />
            <span className="xs:hidden">Volver</span>
          </Button>

          <Button
            onClick={handleNext}
            type="button"
            disabled={
              sending ||
              (isLastStep && needsCaptcha && !captchaToken) ||
              !isBranchingSelected
            }
            className={cn(
              "rounded-full h-12 md:h-14 px-6 md:px-10 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] min-w-[120px] md:min-w-[180px]",

              isLastStep
                ? "bg-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/90 text-white shadow-[var(--puembo-green)]/20"
                : "bg-black text-white hover:bg-gray-800 shadow-black/10",

              (!isBranchingSelected ||
                (isLastStep && needsCaptcha && !captchaToken)) &&
                "opacity-50 grayscale cursor-not-allowed scale-100",
            )}
          >
            {isLastStep ? (
              sending ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 md:mr-3" />
                  <span className="hidden xs:inline">Enviar Ahora</span>
                  <span className="xs:hidden">Enviar</span>
                </>
              )
            ) : (
              <>
                <span className="xs:hidden">
                  {isBranchingSelected ? "Siguiente" : "Elige"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-2 md:ml-3" />
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog
        open={submissionStatus !== null}
        onOpenChange={(v) =>
          !v && submissionStatus === "error" && setSubmissionStatus(null)
        }
      >
        <DialogContent className="sm:max-w-md rounded-[3rem] border-none p-0 overflow-hidden shadow-2xl [&>button]:hidden">
          <div
            className={cn(
              "p-12 text-center space-y-8",
              submissionStatus === "success"
                ? "bg-green-50/50"
                : "bg-red-50/50",
            )}
          >
            <div
              className={cn(
                "w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl rotate-6 transition-transform hover:rotate-0 duration-500",
                submissionStatus === "success"
                  ? "bg-white text-[var(--puembo-green)]"
                  : "bg-white text-red-500",
              )}
            >
              {submissionStatus === "success" ? (
                <CheckCircle2 className="w-12 h-12 -rotate-6" />
              ) : (
                <XCircle className="w-12 h-12 -rotate-6" />
              )}
            </div>

            <div className="space-y-4">
              <DialogTitle
                className={cn(
                  "text-3xl font-serif font-black",
                  submissionStatus === "success"
                    ? "text-[var(--puembo-green)]"
                    : "text-red-600",
                )}
              >
                {submissionStatus === "success"
                  ? "¡Recibido con éxito!"
                  : "Algo salió mal"}
              </DialogTitle>

              <DialogDescription className="text-gray-600 font-semibold text-lg leading-relaxed">
                {submissionStatus === "success"
                  ? "Tu respuesta ha sido registrada correctamente. Gracias por ser parte de la familia Alianza Puembo."
                  : "No pudimos procesar tu envío. Por favor revisa tu conexión e inténtalo una vez más."}
              </DialogDescription>
            </div>
          </div>

          <div className="p-8 bg-white flex flex-col gap-4">
            {submissionStatus === "success" ? (
              <>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest border-2 hover:bg-gray-50"
                >
                  Nueva Respuesta
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  className="w-full rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest text-gray-400"
                >
                  Volver al Inicio
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setSubmissionStatus(null)}
                className="w-full rounded-2xl h-14 bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-200"
              >
                Intentar de Nuevo
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
