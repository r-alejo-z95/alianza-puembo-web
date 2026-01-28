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
import { verifyCaptcha } from "@/lib/actions";
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
      .map(f => {
        let normalizedOptions = [];
        try {
          normalizedOptions = typeof f.options === 'string' ? JSON.parse(f.options) : (f.options || []);
        } catch (e) {
          normalizedOptions = [];
        }
        return { 
          ...f, 
          type: f.type || f.field_type,
          options: normalizedOptions 
        };
      })
      .sort((a, b) => (a.order_index ?? a.order ?? 0) - (b.order_index ?? b.order ?? 0));

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
    steps.forEach(step => {
      step.fields.forEach(f => {
        f.options?.forEach(o => {
          if (o.next_section_id && o.next_section_id !== 'default' && o.next_section_id !== 'submit') {
            targets.add(o.next_section_id);
          }
        });
        if (f.next_section_id && f.next_section_id !== 'default' && f.next_section_id !== 'submit') {
          targets.add(f.next_section_id);
        }
      });
    });
    return targets;
  }, [steps]);

  return { steps, currentStep, setCurrentStep, stepHistory, setStepHistory, jumpTargets };
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
    "w-full min-h-[50px] bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--puembo-green)]/20 focus:border-[var(--puembo-green)] transition-all px-4 text-base shadow-sm hover:border-gray-300";

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
          className={cn(baseClass, "min-h-[120px] py-4 leading-relaxed")}
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
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group",
                    ctrlField.value === opt.value
                      ? "bg-[var(--puembo-green)]/5 border-[var(--puembo-green)]"
                      : "bg-white border-transparent shadow-sm hover:border-gray-200",
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
                      "font-medium text-base",
                      ctrlField.value === opt.value
                        ? "text-[var(--puembo-green)]"
                        : "text-gray-600",
                    )}
                  >
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
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group",
                    ctrlField.value
                      ? "bg-[var(--puembo-green)]/5 border-[var(--puembo-green)]"
                      : "bg-white border-transparent shadow-sm hover:border-gray-200",
                  )}
                >
                  <Checkbox
                    id={`${fieldId}-${opt.id}`}
                    checked={ctrlField.value}
                    onCheckedChange={ctrlField.onChange}
                    className={cn(
                      "w-5 h-5 rounded-md",
                      ctrlField.value
                        ? "data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                        : "border-gray-300",
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium text-base",
                      ctrlField.value
                        ? "text-[var(--puembo-green)]"
                        : "text-gray-600",
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
              <SelectContent className="rounded-xl shadow-xl border-none p-1">
                {options.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.value}
                    className="rounded-lg cursor-pointer text-base py-3 px-4 focus:bg-[var(--puembo-green)]/10 focus:text-[var(--puembo-green)]"
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
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-gray-400 group-hover:border-[var(--puembo-green)] group-hover:bg-[var(--puembo-green)]/5 transition-all bg-white shadow-sm">
                <div className="p-4 bg-gray-50 rounded-full group-hover:bg-white transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-[var(--puembo-green)]" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-black text-[10px] uppercase tracking-[0.2em]">
                    Haz clic para subir{' '}
                    {field.type === "image" ? "una foto" : "un archivo"}
                  </p>
                  <p className="text-[9px] font-medium opacity-60">
                    Tamaño máximo recomendado: 5MB
                  </p>
                </div>
              </div>
            </Label>
          ) : (
            <div className="border-2 border-[var(--puembo-green)] bg-[var(--puembo-green)]/5 rounded-2xl p-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[var(--puembo-green)] shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800 line-clamp-1 max-w-[250px]">
                  {fileName}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--puembo-green)] mt-1">
                  Archivo cargado con éxito
                </p>
              </div>
              <div className="flex gap-2 w-full max-w-[280px]">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest border-2"
                  onClick={() => document.getElementById(fieldId).click()}
                >
                  Cambiar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600"
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

export default function FluentRenderer({ form }) {
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
  
  const { steps, currentStep, setCurrentStep, stepHistory, setStepHistory, jumpTargets } =
    useFormLogic(form);
    
  const [sending, setSending] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaKey, setCaptchaKey] = useState(0);

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
    // 1. ¿Hay alguna pregunta de radio con saltos?
    const branchingField = currentFields.find(f => f.type === "radio" && f.options?.some(o => o.next_section_id && o.next_section_id !== 'default'));
    const val = branchingField ? watchedValues[branchingField.label] : null;

    // 2. Si hay bifurcación pero no se ha elegido nada, NO es el último paso aún (mostrar "Siguiente")
    if (branchingField && !val) return false;

    // 3. Si se eligió una opción, ver a dónde apunta
    if (val) {
      const opt = branchingField.options.find(o => o.value === val);
      if (opt?.next_section_id === "submit") return true;
      if (opt?.next_section_id && opt.next_section_id !== "default") return false;
    }

    // 4. Hard Stop Automático: si la siguiente sección lineal es un destino de salto ajeno
    const nextStep = steps[currentStep + 1];
    if (nextStep?.section) {
      const nextId = nextStep.section.id || nextStep.section._id;
      if (jumpTargets.has(nextId)) return true;
    }

    // 5. Final natural
    return currentStep === steps.length - 1;
  }, [currentStep, steps, currentFields, watchedValues, jumpTargets]);

  const handleNext = async () => {
    const fieldLabels = currentFields.map((f) => f.label);
    const isStepValid = await trigger(fieldLabels);
    
    if (!isStepValid) {
      toast.error("Completa los campos obligatorios para continuar.");
      return;
    }

    const values = getValues();
    let jumpTargetId = null;

    // 1. Salto por opción Radio
    for (const field of currentFields) {
      const val = values[field.label];
      if (field.type === "radio" && val) {
        const selectedOption = field.options?.find((opt) => opt.value === val);
        if (selectedOption?.next_section_id && selectedOption.next_section_id !== "default") {
          jumpTargetId = selectedOption.next_section_id;
          break;
        }
      }
    }

    // 2. Salto forzado al final de sección
    if (!jumpTargetId && currentFields.length > 0) {
      const lastField = currentFields[currentFields.length - 1];
      if (lastField.next_section_id && lastField.next_section_id !== "default") {
        jumpTargetId = lastField.next_section_id;
      }
    }

    if (jumpTargetId === "submit") {
      handleSubmit(onSubmit)();
      return;
    }

    if (jumpTargetId) {
      const targetIndex = steps.findIndex(s => 
        s.section?.id === jumpTargetId || s.section?._id === jumpTargetId
      );
      
      if (targetIndex !== -1) {
        setStepHistory(prev => [...prev, targetIndex]);
        setCurrentStep(targetIndex);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    // 3. Flujo lineal
    if (!isLastStep) {
      const nextIndex = currentStep + 1;
      setStepHistory(prev => [...prev, nextIndex]);
      setCurrentStep(nextIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
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
      toast.error("Formulario cerrado.");
      return;
    }
    if (!captchaToken) {
      toast.error("Verificación de seguridad requerida.");
      return;
    }

    setSending(true);
    try {
      const { isValid } = await verifyCaptcha(captchaToken);
      if (!isValid) {
        toast.error("Captcha inválido.");
        setCaptchaKey((p) => p + 1);
        setSending(false);
        return;
      }

      const supabase = createClient();
      const processedData = {};
      const rawDataForDb = {};

      for (const key in data) {
        const value = data[key];
        const fieldDef = form.form_fields.find((f) => f.label === key);

        if (!fieldDef || (fieldDef.type || fieldDef.field_type) === "section") continue;

        if (value instanceof FileList && value.length > 0) {
          const file = value[0];
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
          rawDataForDb[key] = { _type: "file", name: file.name, info: "Archivo en Drive" };
        } else if (typeof value === "object" && !Array.isArray(value)) {
          const fieldOptions = typeof fieldDef.options === 'string' ? JSON.parse(fieldDef.options) : (fieldDef.options || []);
          const selected = Object.keys(value)
            .filter((k) => value[k])
            .map((k) => fieldOptions.find((o) => o.value === k)?.label || k);
          processedData[key] = selected.join("\n");
          rawDataForDb[key] = selected;
        } else if (fieldDef.options) {
          const fieldOptions = typeof fieldDef.options === 'string' ? JSON.parse(fieldDef.options) : (fieldDef.options || []);
          const opt = fieldOptions.find((o) => o.value === value);
          const label = opt ? opt.label : value;
          processedData[key] = label;
          rawDataForDb[key] = label;
        } else {
          processedData[key] = value;
          rawDataForDb[key] = value;
        }
      }

      processedData.Timestamp = formatInEcuador(getNowInEcuador(), "d/M/yyyy HH:mm:ss");
      rawDataForDb.Timestamp = processedData.Timestamp;
      
      await supabase.functions.invoke("sheets-drive-integration", {
        body: { formId: form.id, formData: processedData },
      });
      const { error } = await supabase.from("form_submissions").insert([
        { form_id: form.id, data: rawDataForDb, user_agent: navigator.userAgent },
      ]);
      if (error) throw error;

      setSubmissionStatus("success");
      reset();
      setCaptchaToken(null);
      setCaptchaKey((p) => p + 1);
    } catch (e) {
      console.error(e);
      setSubmissionStatus("error");
    }
    setSending(false);
  };

  const progress = useMemo(() => {
    if (steps.length <= 1) return 0;
    if (isLastStep) return 100;

    // Calculamos los pasos restantes ESTIMADOS basados en la rama actual
    let remainingSteps = steps.length - currentStep;

    // Si hay una opción elegida con salto, calculamos la distancia real al final desde ese destino
    const branchingField = currentFields.find(f => f.type === "radio");
    const val = branchingField ? watchedValues[branchingField.label] : null;
    if (val) {
      const opt = branchingField.options.find(o => o.value === val);
      if (opt?.next_section_id && opt.next_section_id !== "default") {
        const targetIndex = steps.findIndex(s => s.section?.id === opt.next_section_id || s.section?._id === opt.next_section_id);
        if (targetIndex !== -1) {
          remainingSteps = steps.length - targetIndex + 1;
        }
      }
    }

    const historyWeight = stepHistory.length;
    const totalEstimated = historyWeight + remainingSteps - 1;
    return Math.min(Math.round((historyWeight / totalEstimated) * 100), 95);
  }, [stepHistory.length, steps, currentStep, isLastStep, watchedValues, currentFields]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 pb-24">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-[var(--puembo-green)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex justify-center py-8">
        <Image src="/brand/logo-puembo.png" width={180} height={60} alt="Logo" className="h-10 w-auto object-contain opacity-80" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-8"
        >
          {currentStep === 0 && (
            <div className="text-center space-y-6 mb-12">
              {form.image_url && (
                <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-[2.5rem] overflow-hidden shadow-2xl mb-8">
                  <Image src={form.image_url} fill className="object-cover" alt="Cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 md:p-12 text-left w-full">
                    <h1 className="text-2xl md:text-4xl font-bold font-serif text-white drop-shadow-md">{form.title}</h1>
                  </div>
                </div>
              )}
              {!form.image_url && <h1 className="text-3xl md:text-5xl font-bold font-serif text-gray-900">{form.title}</h1>}
              {form.description && <div className="prose prose-lg mx-auto text-gray-600 font-light" dangerouslySetInnerHTML={{ __html: form.description }} />}
            </div>
          )}

          <div className="space-y-12">
            {currentSection && (
              <div className="mb-8 border-b border-gray-100 pb-8">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">{currentSection.label || "Información"}</h2>
                {currentSection.help_text && <p className="text-gray-500 mt-4 text-lg font-light leading-relaxed italic">{currentSection.help_text}</p>}
              </div>
            )}

            {currentFields.map((field, idx) => (
              <motion.div key={field.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor={`field-${field.id}`} className="text-lg font-bold text-gray-800 block">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1 text-sm align-top">*</span>}
                  </Label>
                </div>
                {field.help_text && <p className="text-sm text-gray-500 font-light">{field.help_text}</p>}
                {field.attachment_url && (
                  <div className="rounded-xl overflow-hidden border border-gray-100 max-w-sm">
                    {field.attachment_type === "image" ? <img src={field.attachment_url} className="w-full h-auto" alt="Ref" /> : <a href={field.attachment_url} target="_blank" className="block p-4 bg-gray-50 hover:bg-gray-100 text-blue-600 font-bold text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Ver Documento</a>}
                  </div>
                )}
                <FieldInput field={field} register={register} control={control} errors={errors} isRequired={field.required} watch={watch} setValue={setValue} />
                {errors[field.label] && <p className="text-red-500 text-xs font-bold uppercase flex items-center gap-1 animate-pulse"><AlertCircle className="w-3 h-3" /> Campo Requerido</p>}
              </motion.div>
            ))}
          </div>

          {isLastStep && (
            <div className="pt-12 space-y-8">
              <div className="flex justify-center"><TurnstileCaptcha key={captchaKey} onVerify={setCaptchaToken} /></div>
              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-500 leading-relaxed text-center">Al enviar este formulario, usted autoriza a la Iglesia Alianza Puembo el tratamiento de sus datos personales para fines de contacto y gestión eclesial.</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t border-gray-100 p-4 md:p-6 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={handleBack} disabled={sending || stepHistory.length <= 1} className={cn("rounded-full h-12 px-6", stepHistory.length <= 1 && "opacity-0 pointer-events-none")}>
            <ChevronLeft className="w-5 h-5 mr-2" /> Atrás
          </Button>
          <Button onClick={handleNext} type="button" disabled={sending || (isLastStep && !captchaToken) || !isBranchingSelected} className={cn("rounded-full h-12 px-8 text-base shadow-lg transition-all hover:scale-105 active:scale-95 min-w-[140px]", isLastStep ? "bg-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/90 text-white" : "bg-black text-white hover:bg-gray-900", !isBranchingSelected && "opacity-50 grayscale cursor-not-allowed scale-100")}>
            {isLastStep ? (sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Enviar</>) : (<>{isBranchingSelected ? "Siguiente" : "Selecciona una opción"} <ChevronRight className="w-4 h-4 ml-2" /></>)}
          </Button>
        </div>
      </div>

      <Dialog open={submissionStatus !== null} onOpenChange={(v) => !v && submissionStatus === "error" && setSubmissionStatus(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-none p-0 overflow-hidden">
          <div className={cn("p-10 text-center space-y-6", submissionStatus === "success" ? "bg-green-50" : "bg-red-50")}>
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm", submissionStatus === "success" ? "bg-white text-[var(--puembo-green)]" : "bg-white text-red-500")}>
              {submissionStatus === "success" ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <div className="space-y-2">
              <DialogTitle className={cn("text-2xl font-serif font-bold", submissionStatus === "success" ? "text-[var(--puembo-green)]" : "text-red-600")}>{submissionStatus === "success" ? "¡Enviado!" : "Error"}</DialogTitle>
              <DialogDescription className="text-gray-600 font-medium">{submissionStatus === "success" ? "Tu respuesta ha sido registrada correctamente. Gracias por ser parte de Alianza Puembo." : "Hubo un problema al enviar tu formulario. Por favor, verifica tu conexión e inténtalo de nuevo."}</DialogDescription>
            </div>
          </div>
          <div className="p-6 bg-white flex flex-col gap-3">
            {submissionStatus === "success" ? (
              <>
                <Button onClick={() => window.location.reload()} variant="outline" className="w-full rounded-xl h-12 font-bold uppercase tracking-widest border-2">Nueva Respuesta</Button>
                <Button onClick={() => router.push("/")} variant="ghost" className="w-full rounded-xl h-12 text-gray-400">Volver al Inicio</Button>
              </>
            ) : (
              <Button onClick={() => setSubmissionStatus(null)} className="w-full rounded-xl h-12 bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest">Intentar de Nuevo</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}