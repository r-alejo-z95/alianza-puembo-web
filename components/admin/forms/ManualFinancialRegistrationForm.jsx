"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Banknote,
  CreditCard,
  GraduationCap,
  FileUp,
  X,
  ClipboardList,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createManualFinancialRegistration } from "@/lib/actions/finance";
import { uploadReceipt } from "@/lib/actions";
import {
  buildManualAnswers,
  buildManualData,
  normalizeFieldOptions,
  normalizeManualFieldValue,
  validateManualRegistrationValues,
} from "@/lib/finance/manual-registration.mjs";

const COVERAGE_OPTIONS = [
  {
    value: "cash",
    label: "Efectivo",
    icon: Banknote,
    description: "Pago presencial en caja",
  },
  {
    value: "card",
    label: "Tarjeta",
    icon: CreditCard,
    description: "Débito o crédito",
  },
  {
    value: "scholarship",
    label: "Beca",
    icon: GraduationCap,
    description: "Sin costo asignado",
  },
];

export default function ManualFinancialRegistrationForm({ forms = [] }) {
  const [selectedFormId, setSelectedFormId] = useState("");
  const [coverageMode, setCoverageMode] = useState("cash");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [backupFile, setBackupFile] = useState(null);
  const [values, setValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const selectedForm = useMemo(
    () => forms.find((form) => form.id === selectedFormId) || null,
    [forms, selectedFormId],
  );

  const fields = useMemo(() => {
    const rawFields = selectedForm?.form_fields || [];
    return [...rawFields]
      .filter((field) => field.id !== selectedForm?.financial_field_id)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [selectedForm]);

  const setFieldValue = (fieldId, value) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field) => {
    const options = normalizeFieldOptions(field.options);
    const value = values[field.id];

    if (["section", "section_header", "separator"].includes(field.type)) {
      return (
        <div key={field.id} className="col-span-full">
          <div className="flex items-center gap-4 py-2">
            <div className="h-px w-6 bg-[var(--puembo-green)]/40" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)]">
              {field.label}
            </p>
            <div className="h-px flex-1 bg-[var(--puembo-green)]/10" />
          </div>
          {field.help_text && (
            <p className="text-xs text-gray-400 mt-1 pl-10">{field.help_text}</p>
          )}
        </div>
      );
    }

    if (["file", "image"].includes(field.type)) {
      return (
        <div key={field.id} className="col-span-full">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-amber-600 text-[10px] font-black">!</span>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              El campo <span className="font-bold">"{field.label}"</span> no se registra aquí. Usa la foto de respaldo si hace falta.
            </p>
          </div>
        </div>
      );
    }

    const inputType =
      field.type === "number" ? "number" :
      field.type === "email" ? "email" :
      field.type === "date" ? "date" :
      field.type === "time" ? "time" : "text";

    return (
      <div key={field.id} className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {field.label}
        </Label>
        {field.type === "textarea" ? (
          <Textarea
            value={value || ""}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            className="rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all shadow-sm min-h-[100px] text-sm"
          />
        ) : field.type === "select" ? (
          <Select value={value || ""} onValueChange={(v) => setFieldValue(field.id, v)}>
            <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 shadow-sm">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value || opt.label} value={opt.value || opt.label}>
                  {opt.label || opt.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "radio" ? (
          <RadioGroup
            value={value || ""}
            onValueChange={(v) => setFieldValue(field.id, v)}
            className="space-y-2"
          >
            {options.map((opt) => (
              <div
                key={opt.value || opt.label}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:border-[var(--puembo-green)]/30 transition-colors"
              >
                <RadioGroupItem
                  value={opt.value || opt.label}
                  id={`${field.id}-${opt.value || opt.label}`}
                />
                <Label
                  htmlFor={`${field.id}-${opt.value || opt.label}`}
                  className="cursor-pointer text-sm font-medium text-gray-700"
                >
                  {opt.label || opt.value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : field.type === "checkbox" ? (
          <div className="space-y-2">
            {options.map((opt) => {
              const optionKey = opt.value || opt.label;
              const normalizedValue = normalizeManualFieldValue(field, value);
              return (
                <label
                  key={optionKey}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:border-[var(--puembo-green)]/30 transition-colors"
                >
                  <Checkbox
                    checked={Boolean(normalizedValue?.[optionKey])}
                    onCheckedChange={(checked) =>
                      setFieldValue(field.id, {
                        ...normalizedValue,
                        [optionKey]: Boolean(checked),
                      })
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {opt.label || opt.value}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <Input
            type={inputType}
            value={value || ""}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all shadow-sm"
          />
        )}
        {field.help_text &&
          !["checkbox", "section", "section_header", "separator"].includes(field.type) && (
            <p className="text-xs text-gray-400 pl-1">{field.help_text}</p>
          )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedForm) {
      toast.error("Selecciona un formulario.");
      return;
    }
    if ((coverageMode === "cash" || coverageMode === "card") && !coverageAmount) {
      toast.error("Ingresa el monto para efectivo o tarjeta.");
      return;
    }

    const validation = validateManualRegistrationValues(fields, values);
    if (!validation.valid) {
      toast.error(`Completa los campos requeridos: ${validation.missingFieldLabels.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      let backupImagePath = null;
      if (backupFile) {
        const formData = new FormData();
        formData.append("file", backupFile);
        formData.append("formSlug", selectedForm.slug || "manual");
        const uploadRes = await uploadReceipt(formData);
        if (uploadRes?.error) {
          toast.error(uploadRes.error);
          return;
        }
        backupImagePath = uploadRes.fullPath || uploadRes.path;
      }

      const answers = buildManualAnswers(fields, values);
      const data = buildManualData(fields, values);

      const notificationEmailAnswer = fields.find((f) => f.type === "email");
      const notificationEmail = notificationEmailAnswer
        ? values[notificationEmailAnswer.id] || null
        : null;

      const result = await createManualFinancialRegistration({
        formId: selectedForm.id,
        data,
        answers,
        rawValues: values,
        coverageMode,
        coverageAmount: coverageMode === "scholarship" ? null : Number(coverageAmount || 0),
        backupImagePath,
        notificationEmail,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Inscripción manual creada");
      setValues({});
      setCoverageAmount("");
      setBackupFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="space-y-4">
        <Link
          href="/admin/formularios/inscripciones"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Buscador de Inscripciones
        </Link>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
              Inscripciones
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-gray-900">
            Inscripción{" "}
            <span className="text-[var(--puembo-green)] italic">Manual</span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">
            Registra inscripciones de efectivo, tarjeta o beca.
          </p>
        </div>
      </header>

      {/* Two-panel layout */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Config sidebar ── */}
          <div className="w-full lg:w-80 lg:sticky lg:top-6 space-y-4 shrink-0">

            {/* Event selector */}
            <div className="bg-white rounded-[2rem] shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--puembo-green)]/10 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-[var(--puembo-green)]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Formulario
                </span>
              </div>
              <Select
                value={selectedFormId}
                onValueChange={(v) => {
                  setSelectedFormId(v);
                  setValues({});
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 shadow-sm">
                  <SelectValue placeholder="Selecciona un evento…" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedForm && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--puembo-green)] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)]">
                    {fields.length} campos cargados
                  </span>
                </div>
              )}
            </div>

            {/* Coverage mode tiles */}
            <div className="bg-white rounded-[2rem] shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--puembo-green)]/10 flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-[var(--puembo-green)]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Método de pago
                </span>
              </div>

              <div className="space-y-2">
                {COVERAGE_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setCoverageMode(value);
                      setCoverageAmount("");
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                      coverageMode === value
                        ? "bg-[var(--puembo-green)] border-[var(--puembo-green)] shadow-md shadow-[var(--puembo-green)]/20"
                        : "bg-gray-50 border-transparent hover:bg-gray-100",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        coverageMode === value ? "bg-white/20" : "bg-white shadow-sm",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          coverageMode === value
                            ? "text-white"
                            : "text-[var(--puembo-green)]",
                        )}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-bold leading-tight",
                          coverageMode === value ? "text-white" : "text-gray-900",
                        )}
                      >
                        {label}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] leading-tight mt-0.5",
                          coverageMode === value ? "text-white/70" : "text-gray-400",
                        )}
                      >
                        {description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {(coverageMode === "cash" || coverageMode === "card") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Monto (USD)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-300 pointer-events-none">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={coverageAmount}
                          onChange={(e) => setCoverageAmount(e.target.value)}
                          className="h-14 pl-8 rounded-2xl bg-gray-50 border-gray-100 text-xl font-bold text-gray-900 shadow-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Backup file */}
            <div className="bg-white rounded-[2rem] shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--puembo-green)]/10 flex items-center justify-center">
                  <FileUp className="w-4 h-4 text-[var(--puembo-green)]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Respaldo
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
              />
              <AnimatePresence mode="wait">
                {backupFile ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[var(--puembo-green)]/5 border border-[var(--puembo-green)]/10"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[var(--puembo-green)] shrink-0" />
                      <span className="text-xs font-bold text-gray-700 truncate">
                        {backupFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBackupFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 hover:border-[var(--puembo-green)]/30 hover:bg-[var(--puembo-green)]/5 transition-all group flex flex-col items-center gap-2"
                  >
                    <FileUp className="w-5 h-5 text-gray-300 group-hover:text-[var(--puembo-green)] transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-[var(--puembo-green)] transition-colors">
                      Adjuntar foto o PDF
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="green"
              disabled={isSubmitting || !selectedForm}
              className="w-full rounded-2xl h-14 font-bold shadow-lg shadow-[var(--puembo-green)]/25 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar inscripción
            </Button>
          </div>

          {/* ── Right: Participant fields ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {!selectedForm ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/30 text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center">
                    <User className="w-7 h-7 text-gray-200" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-300">Sin formulario seleccionado</p>
                    <p className="text-xs text-gray-300 mt-1">
                      Elige un evento en el panel izquierdo
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedFormId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[2rem] shadow-xl overflow-hidden"
                >
                  <div className="bg-[var(--puembo-green)]/5 px-8 py-6 border-b border-[var(--puembo-green)]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <User className="w-4 h-4 text-[var(--puembo-green)]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)]">
                          Datos del participante
                        </p>
                        <p className="text-sm font-bold text-gray-700 mt-0.5">
                          {selectedForm.title}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="grid gap-5 md:grid-cols-2">
                      {fields.map((field) => renderField(field))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </div>
  );
}
