"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ChevronRight, Settings2, CreditCard, Landmark } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
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

const setupSchema = z
  .object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    is_internal: z.boolean(),
    max_responses: z.number().int().min(1, "El límite debe ser mayor a 0"),
    is_financial: z.boolean(),
    payment_type: z.enum(["single", "installments"]).nullable().optional(),
    max_installments: z.number().int().min(1).nullable().optional(),
    total_amount: z.number().positive("El monto total debe ser mayor a 0").nullable().optional(),
    destination_account_id: z.string().nullable().optional(),
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

    if (!data.total_amount || data.total_amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["total_amount"],
        message: "Define el monto total",
      });
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
    destination_account_id: initialValues.destination_account_id ?? null,
  };
}

export default function FormSetupWizard({
  bankAccounts = [],
  initialValues = {},
}) {
  const router = useRouter();
  const supabase = createClient();
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Tu sesión expiró. Vuelve a iniciar sesión.");
        router.push("/login");
        return;
      }

      const payload = {
        title: values.title.trim(),
        slug: slugify(values.title),
        is_internal: values.is_internal,
        max_responses: values.max_responses,
        is_financial: values.is_financial,
        payment_type: values.is_financial ? values.payment_type : null,
        max_installments:
          values.is_financial && values.payment_type === "installments"
            ? values.max_installments
            : null,
        total_amount: values.is_financial ? values.total_amount : null,
        destination_account_id: values.is_financial ? values.destination_account_id : null,
      };

      let targetId = defaultValues.id;

      if (isEditing) {
        const { error } = await supabase.from("forms").update(payload).eq("id", targetId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("forms")
          .insert([{ ...payload, user_id: user.id }])
          .select("id")
          .single();
        if (error) throw error;
        targetId = data.id;
      }

      toast.success("Configuración guardada");
      router.push(`/admin/formularios/builder?id=${targetId}`);
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
                    onCheckedChange={(checked) => form.setValue("is_financial", checked)}
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
                          Monto total
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="h-11 rounded-xl bg-white border-gray-200"
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
                    </div>

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

