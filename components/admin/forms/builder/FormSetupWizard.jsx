"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ChevronRight, Settings2, CreditCard, Landmark, Users } from "lucide-react";
import { toast } from "sonner";
import { saveFormSetup } from "@/lib/actions/forms";
import {
  buildPaymentDescription,
  mergeFormDescription,
} from "@/lib/forms/setup-description.mjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PricingPackagesEditor from "@/components/admin/forms/builder/PricingPackagesEditor";

const setupSchema = z
  .object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    is_internal: z.boolean(),
    max_responses: z.number().int().min(1, "El límite debe ser mayor a 0"),
    is_financial: z.boolean(),
    payment_type: z.enum(["single", "installments"]).nullable().optional(),
    max_installments: z.number().int().min(1).nullable().optional(),
    total_amount: z.number().positive("El monto total debe ser mayor a 0").nullable().optional(),
    pricing_mode: z.enum(["fixed", "packages"]).default("fixed"),
    pricing_packages: z.array(z.object({
      id: z.string(),
      label: z.string(),
      amount: z.number().positive().nullable().optional(),
      participant_count: z.number().int().min(1).nullable().optional(),
      enabled: z.boolean().optional(),
    })).default([]),
    collect_participant_details: z.boolean().default(false),
    participant_template: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.string(),
      required: z.boolean().optional(),
      placeholder: z.string().optional().nullable(),
    })).default([]),
    allow_shared_receipts: z.boolean().default(false),
    shared_receipt_max_submissions: z.number().int().min(1).nullable().optional(),
    destination_account_id: z.string().nullable().optional(),
    payment_reminder_interval_days: z.union([
      z.literal(3),
      z.literal(7),
      z.literal(14),
      z.literal(30),
    ]).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_financial) return;

    if (!data.payment_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_type"],
        message: "Define el tipo de pago",
      });
    }

    if ((data.pricing_mode || "fixed") === "fixed" && (!data.total_amount || data.total_amount <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["total_amount"],
        message: "Define el monto total",
      });
    }

    if (data.pricing_mode === "packages") {
      const activePackages = (data.pricing_packages || []).filter((pkg) => pkg.enabled !== false);
      if (activePackages.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pricing_packages"],
          message: "Agrega al menos un paquete activo",
        });
      }
      if (data.collect_participant_details && (data.participant_template || []).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["participant_template"],
          message: "Agrega al menos un campo para participantes",
        });
      }
    }

    if (!data.destination_account_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["destination_account_id"],
        message: "Selecciona una cuenta de destino",
      });
    }

    if (data.payment_type === "installments" && (!data.max_installments || data.max_installments < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_installments"],
        message: "Define el máximo de cuotas",
      });
    }

    if (data.allow_shared_receipts && (!data.shared_receipt_max_submissions || data.shared_receipt_max_submissions < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shared_receipt_max_submissions"],
        message: "Define al menos 2 inscripciones por comprobante",
      });
    }
  });

function mapInitialValues(initialValues = {}) {
  return {
    id: initialValues.id ?? null,
    title: initialValues.title ?? "",
    is_internal: !!initialValues.is_internal,
    max_responses: initialValues.max_responses ?? 100,
    is_financial: initialValues.is_financial ?? false,
    payment_type: initialValues.payment_type ?? "single",
    max_installments: initialValues.max_installments ?? null,
    total_amount:
      initialValues.total_amount === null || initialValues.total_amount === undefined
        ? null
        : Number(initialValues.total_amount),
    pricing_mode: initialValues.pricing_mode ?? "fixed",
    pricing_packages: initialValues.pricing_packages ?? [],
    collect_participant_details: !!initialValues.collect_participant_details,
    participant_template: initialValues.participant_template ?? [],
    allow_shared_receipts: !!initialValues.allow_shared_receipts,
    shared_receipt_max_submissions: initialValues.shared_receipt_max_submissions ?? 2,
    destination_account_id: initialValues.destination_account_id ?? null,
    payment_reminder_interval_days: initialValues.payment_reminder_interval_days ?? null,
  };
}

export default function FormSetupWizard({
  bankAccounts = [],
  initialValues = {},
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues = useMemo(() => mapInitialValues(initialValues), [initialValues]);
  const isEditing = !!defaultValues.id;

  const form = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues,
    mode: "onChange",
  });

  const isFinancial = form.watch("is_financial");
  const paymentType = form.watch("payment_type");
  const pricingMode = form.watch("pricing_mode") || "fixed";
  const allowSharedReceipts = form.watch("allow_shared_receipts");
  const hasBankAccounts = bankAccounts.length > 0;

  const onSubmit = async (values) => {
    if (values.is_financial && !hasBankAccounts) {
      toast.error("No hay cuentas bancarias activas", {
        description: "Primero configura una cuenta en Preferencias para formularios financieros.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const paymentDescription = buildPaymentDescription(values, bankAccounts);
      const description = mergeFormDescription(initialValues.description, paymentDescription);
      const result = await saveFormSetup({ ...values, id: defaultValues.id ?? null, description });

      if (result.error) {
        toast.error("No se pudo guardar la configuración", { description: result.error });
        return;
      }

      toast.success("Configuración guardada");
      router.push(`/admin/formularios/builder?id=${result.formId}`);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la configuración inicial");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-120px)] bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-black p-8 md:p-10 text-white space-y-4">
            <div className="flex items-center gap-3 text-[var(--puembo-green)]">
              <Settings2 className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Configuración Inicial
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-white">
              {isEditing ? "Completa la configuración" : "Nuevo formulario"}
            </CardTitle>
            <p className="text-white/60 text-sm">
              Antes de crear preguntas, define los parámetros base del formulario.
            </p>
          </CardHeader>

          <CardContent className="p-8 md:p-10 space-y-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Título
                </Label>
                <Input
                  placeholder="Ej: Inscripción Congreso de Jóvenes"
                  {...form.register("title")}
                  className="h-12 rounded-xl bg-gray-50 border-gray-100"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-5 rounded-2xl border border-gray-100 bg-gray-50">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Visibilidad
                  </Label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                      {form.watch("is_internal") ? "Interno (staff)" : "Público"}
                    </p>
                    <Switch
                      checked={form.watch("is_internal")}
                      onCheckedChange={(checked) => form.setValue("is_internal", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Límite de respuestas
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    className="h-12 rounded-xl bg-gray-50 border-gray-100"
                    value={form.watch("max_responses") ?? ""}
                    onChange={(e) =>
                      form.setValue(
                        "max_responses",
                        e.target.value ? Number(e.target.value) : null,
                        { shouldValidate: true },
                      )
                    }
                  />
                  {form.formState.errors.max_responses && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.max_responses.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Tipo de formulario
                    </Label>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {isFinancial ? "Financiero" : "No financiero"}
                    </p>
                  </div>
                  <Switch
                    checked={isFinancial}
                    onCheckedChange={(checked) => {
                      form.setValue("is_financial", checked);
                      if (!checked) {
                        form.setValue("allow_shared_receipts", false);
                        form.setValue("shared_receipt_max_submissions", 1);
                        form.setValue("pricing_mode", "fixed");
                        form.setValue("pricing_packages", []);
                        form.setValue("collect_participant_details", false);
                        form.setValue("participant_template", []);
                      }
                    }}
                  />
                </div>

                {isFinancial && (
                  <div className="space-y-5 pt-3 border-t border-gray-200">
                    {!hasBankAccounts && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                        No hay cuentas bancarias activas. Configúralas en Preferencias antes de continuar.
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                          <CreditCard className="w-3 h-3" /> Tipo de pago
                        </Label>
                        <Select
                          value={form.watch("payment_type") || "single"}
                          onValueChange={(value) => form.setValue("payment_type", value, { shouldValidate: true })}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Pago único</SelectItem>
                            <SelectItem value="installments">Cuotas</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.payment_type && (
                          <p className="text-xs text-red-500">{form.formState.errors.payment_type.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Modo de monto
                        </Label>
                        <Select
                          value={pricingMode}
                          onValueChange={(value) =>
                            form.setValue("pricing_mode", value, { shouldValidate: true })
                          }
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Monto fijo</SelectItem>
                            <SelectItem value="packages">Paquetes de precio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {pricingMode === "fixed" ? (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Monto total
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="h-11 rounded-xl bg-white border-gray-200 md:max-w-xs"
                          value={form.watch("total_amount") ?? ""}
                          onChange={(e) =>
                            form.setValue(
                              "total_amount",
                              e.target.value ? Number(e.target.value) : null,
                              { shouldValidate: true },
                            )
                          }
                        />
                        {form.formState.errors.total_amount && (
                          <p className="text-xs text-red-500">{form.formState.errors.total_amount.message}</p>
                        )}
                      </div>
                    ) : (
                      <PricingPackagesEditor
                        packages={form.watch("pricing_packages") || []}
                        onPackagesChange={(value) =>
                          form.setValue("pricing_packages", value, { shouldValidate: true })
                        }
                        collectParticipantDetails={form.watch("collect_participant_details")}
                        onCollectParticipantDetailsChange={(value) =>
                          form.setValue("collect_participant_details", value, { shouldValidate: true })
                        }
                        participantTemplate={form.watch("participant_template") || []}
                        onParticipantTemplateChange={(value) =>
                          form.setValue("participant_template", value, { shouldValidate: true })
                        }
                      />
                    )}

                    {paymentType === "installments" && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Máximo de cuotas
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          className="h-11 rounded-xl bg-white border-gray-200 md:max-w-xs"
                          value={form.watch("max_installments") ?? ""}
                          onChange={(e) =>
                            form.setValue(
                              "max_installments",
                              e.target.value ? Number(e.target.value) : null,
                              { shouldValidate: true },
                            )
                          }
                        />
                        {form.formState.errors.max_installments && (
                          <p className="text-xs text-red-500">
                            {form.formState.errors.max_installments.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                              Comprobante compartido
                            </Label>
                            <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                              Permite que un mismo pago cubra varias inscripciones sin duplicar el ingreso.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={allowSharedReceipts}
                          onCheckedChange={(checked) => {
                            form.setValue("allow_shared_receipts", checked, { shouldValidate: true });
                            if (checked && Number(form.getValues("shared_receipt_max_submissions") || 0) < 2) {
                              form.setValue("shared_receipt_max_submissions", 2, { shouldValidate: true });
                            }
                          }}
                        />
                      </div>

                      {allowSharedReceipts && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Máximo por comprobante
                          </Label>
                          <Input
                            type="number"
                            min={2}
                            className="h-11 rounded-xl bg-gray-50 border-gray-200 md:max-w-xs"
                            value={form.watch("shared_receipt_max_submissions") ?? ""}
                            onChange={(e) =>
                              form.setValue(
                                "shared_receipt_max_submissions",
                                e.target.value ? Number(e.target.value) : null,
                                { shouldValidate: true },
                              )
                            }
                          />
                          {form.formState.errors.shared_receipt_max_submissions && (
                            <p className="text-xs text-red-500">
                              {form.formState.errors.shared_receipt_max_submissions.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Landmark className="w-3 h-3" /> Cuenta de destino
                      </Label>
                      <Select
                        value={form.watch("destination_account_id") || ""}
                        onValueChange={(value) =>
                          form.setValue("destination_account_id", value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                          <SelectValue placeholder="Selecciona una cuenta" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.bank_name} - {account.account_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.destination_account_id && (
                        <p className="text-xs text-red-500">
                          {form.formState.errors.destination_account_id.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Recordatorios de pago
                      </Label>
                      <Select
                        value={form.watch("payment_reminder_interval_days")?.toString() || "off"}
                        onValueChange={(value) =>
                          form.setValue(
                            "payment_reminder_interval_days",
                            value === "off" ? null : Number(value),
                            { shouldValidate: true },
                          )
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">Desactivado</SelectItem>
                          <SelectItem value="3">Cada 3 dias</SelectItem>
                          <SelectItem value="7">Cada 7 dias</SelectItem>
                          <SelectItem value="14">Cada 14 dias</SelectItem>
                          <SelectItem value="30">Cada 30 dias</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        El primer recordatorio se enviará después de la frecuencia elegida si aún queda saldo pendiente.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="green"
                disabled={isSaving || (isFinancial && !hasBankAccounts)}
                className="w-full rounded-full h-12 font-black uppercase tracking-widest text-[10px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Continuar al builder
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
