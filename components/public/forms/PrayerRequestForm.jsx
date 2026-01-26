"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { sectionTitle } from "@/lib/styles";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import TurnstileCaptcha from "@/components/shared/TurnstileCaptcha";

const prayerRequestSchema = z.object({
  name: z.string().optional(),
  request_text: z
    .string()
    .min(10, "La petición debe tener al menos 10 caracteres.")
    .max(500, "La petición no puede exceder los 500 caracteres."),
  is_public: z.boolean().default(true),
  is_anonymous: z.boolean().default(true),
});

export default function PrayerRequestForm({ action }) {
  const [captchaToken, setCaptchaToken] = useState(null);

  const form = useForm({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      name: "",
      request_text: "",
      is_public: true,
      is_anonymous: true,
    },
  });

  const isAnonymous = form.watch("is_anonymous");
  const requestText = form.watch("request_text");

  const handleFormSubmit = async (data) => {
    if (!captchaToken) {
      toast.error("Por favor, completa la verificación de seguridad.");
      return;
    }

    const formData = new FormData();
    formData.append("name", isAnonymous || !data.name ? "" : data.name);
    formData.append("request_text", data.request_text);
    formData.append("is_public", data.is_public);
    formData.append("is_anonymous", data.is_anonymous);
    formData.append("turnstile_token", captchaToken);

    const result = await action(formData);

    if (result?.error) {
      toast.error(`Error: ${result.error}`);
    } else {
      toast.success(
        "Tu petición de oración ha sido enviada. ¡Dios te bendiga!",
      );
      form.reset();
      setCaptchaToken(null);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-white hover:border-green-100">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-bold text-gray-900 cursor-pointer">
                    ¿Petición Pública?
                  </FormLabel>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tight">
                    Visible en cartelera
                  </p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_anonymous"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-white hover:border-green-100">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-bold text-gray-900 cursor-pointer">
                    ¿Petición Anónima?
                  </FormLabel>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tight">
                    Tu nombre no será visible
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
          {!isAnonymous && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">
                      Tu Nombre
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Escribe tu nombre..."
                        className="h-12 rounded-xl bg-gray-50/30 border-gray-200 focus:bg-white transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}

          <FormField
            control={form.control}
            name="request_text"
            render={({ field }) => (
              <FormItem className="w-full">
                <div className="flex justify-between items-end mb-1 ml-1">
                  <FormLabel className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                    Tu Petición
                  </FormLabel>
                  <span
                    className={cn(
                      "text-[10px] font-bold tracking-tighter",
                      requestText?.length > 450
                        ? "text-red-500"
                        : "text-gray-400",
                    )}
                  >
                    {requestText?.length || 0} / 500
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Escribe aquí tu petición. Confiamos en que Dios escucha y obra."
                    className="min-h-[160px] rounded-2xl bg-gray-50/30 border-gray-200 focus:bg-white transition-all resize-none p-4 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <TurnstileCaptcha
          onVerify={setCaptchaToken}
          className="flex justify-center"
        />

        <div className="space-y-6 pt-2">
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-500 leading-relaxed text-center">
              Al enviar esta petición, usted autoriza a la Iglesia Alianza
              Puembo el tratamiento de sus datos personales para fines de
              gestión eclesial, conforme a la Ley Orgánica de Protección de
              Datos Personales de Ecuador.
            </p>
          </div>

          <div className="w-full">
            <Button
              variant="green"
              type="submit"
              disabled={form.formState.isSubmitting || !captchaToken}
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-[0.98]"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Enviar Petición de Oración"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
