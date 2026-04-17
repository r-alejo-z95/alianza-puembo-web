"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "scholarship", label: "Beca" },
];

export default function ManualFinancialRegistrationForm({ forms = [] }) {
  const [selectedFormId, setSelectedFormId] = useState("");
  const [coverageMode, setCoverageMode] = useState("cash");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [backupFile, setBackupFile] = useState(null);
  const [values, setValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div key={field.id} className="rounded-2xl border border-dashed border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-900">{field.label}</p>
          {field.help_text && <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>}
        </div>
      );
    }

    if (["file", "image"].includes(field.type)) {
      return (
        <div key={field.id} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          El campo "{field.label}" no se registra aquí. Usa la foto de respaldo opcional para documentación interna si hace falta.
        </div>
      );
    }

    return (
      <div key={field.id} className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-gray-500">{field.label}</Label>
        {field.type === "textarea" ? (
          <Textarea value={value || ""} onChange={(e) => setFieldValue(field.id, e.target.value)} className="rounded-2xl" />
        ) : field.type === "select" ? (
          <Select value={value || ""} onValueChange={(nextValue) => setFieldValue(field.id, nextValue)}>
            <SelectTrigger className="h-12 rounded-2xl">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value || option.label} value={option.value || option.label}>
                  {option.label || option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "radio" ? (
          <RadioGroup value={value || ""} onValueChange={(nextValue) => setFieldValue(field.id, nextValue)} className="space-y-2">
            {options.map((option) => (
              <div key={option.value || option.label} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value || option.label} id={`${field.id}-${option.value || option.label}`} />
                <Label htmlFor={`${field.id}-${option.value || option.label}`}>{option.label || option.value}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : field.type === "checkbox" ? (
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3">
            <div className="space-y-3">
              {options.map((option) => {
                const optionKey = option.value || option.label;
                const normalizedValue = normalizeManualFieldValue(field, value);
                return (
                  <label key={optionKey} className="flex items-center gap-2 text-sm text-gray-700">
                    <Checkbox
                      checked={Boolean(normalizedValue?.[optionKey])}
                      onCheckedChange={(checked) =>
                        setFieldValue(field.id, {
                          ...normalizedValue,
                          [optionKey]: Boolean(checked),
                        })
                      }
                    />
                    <span>{option.label || option.value}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <Input
            type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
            value={value || ""}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            className="h-12 rounded-2xl"
          />
        )}
        {field.help_text && !["checkbox", "section", "section_header", "separator"].includes(field.type) && (
          <p className="text-xs text-gray-500">{field.help_text}</p>
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

      const notificationEmailAnswer = fields.find((field) => field.type === "email");
      const notificationEmail = notificationEmailAnswer ? values[notificationEmailAnswer.id] || null : null;

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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admin</p>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Inscripción Manual</h1>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/formularios/inscripciones">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Registrar efectivo, tarjeta o beca</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Formulario financiero</Label>
                <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue placeholder="Selecciona un formulario" />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Cobertura</Label>
                <Select value={coverageMode} onValueChange={setCoverageMode}>
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COVERAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(coverageMode === "cash" || coverageMode === "card") && (
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Monto</Label>
                <Input type="number" step="0.01" value={coverageAmount} onChange={(e) => setCoverageAmount(e.target.value)} className="h-12 rounded-2xl max-w-xs" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Foto de respaldo opcional</Label>
              <Input type="file" accept="image/*,.pdf" onChange={(e) => setBackupFile(e.target.files?.[0] || null)} className="h-12 rounded-2xl" />
            </div>

            {selectedForm ? (
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => renderField(field))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
                Selecciona un formulario para cargar sus campos.
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !selectedForm} className="rounded-full">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Guardar inscripción manual
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
