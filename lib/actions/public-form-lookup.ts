"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { sendFormSubmissionLookupEmail } from "@/lib/services/form-lookup-emails";
import { escapeEmailLookupPattern } from "@/lib/forms/submission-lookup-email.mjs";

const publicFormLookupSchema = z.object({
  formId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email(),
  turnstileToken: z.string().min(1),
});

const GENERIC_OUTCOME = {
  status: "success" as const,
  title: "Revisa tu correo",
  message:
    "Te enviaremos el resultado de la consulta a la dirección indicada.",
};

export async function requestPublicFormSubmissionLookup(input: {
  formId: string;
  email: string;
  turnstileToken: string;
}) {
  const parsed = publicFormLookupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: "Selecciona un formulario e ingresa un correo electrónico válido.",
    };
  }

  const isCaptchaValid = await verifyTurnstileToken(
    parsed.data.turnstileToken,
  );
  if (!isCaptchaValid) {
    return {
      error: "No pudimos validar que eres una persona. Intenta nuevamente.",
    };
  }

  const supabase = createAdminClient();

  try {
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, title, slug, enabled, is_financial")
      .eq("id", parsed.data.formId)
      .eq("is_publicly_listed", true)
      .eq("is_internal", false)
      .eq("is_archived", false)
      .maybeSingle();

    if (formError) {
      console.error("[requestPublicFormSubmissionLookup] form lookup", formError);
      return { error: "No pudimos completar la consulta. Intenta nuevamente." };
    }

    if (!form?.slug) {
      return { error: "Este formulario ya no está disponible para consultas." };
    }

    const { data: submissions, error: submissionsError } = await supabase
      .from("form_submissions")
      .select("created_at, access_token")
      .eq("form_id", form.id)
      .ilike(
        "notification_email",
        escapeEmailLookupPattern(parsed.data.email),
      )
      .eq("is_archived", false)
      .neq("submission_status", "cancelled")
      .order("created_at", { ascending: false });

    if (submissionsError) {
      console.error(
        "[requestPublicFormSubmissionLookup] submission lookup",
        submissionsError,
      );
      return { error: "No pudimos completar la consulta. Intenta nuevamente." };
    }

    const delivery = await sendFormSubmissionLookupEmail({
      email: parsed.data.email,
      form,
      submissions: submissions ?? [],
    });

    if (!delivery.success) {
      return {
        error: "No pudimos enviar el resultado. Intenta nuevamente.",
      };
    }

    return { success: true as const, outcome: GENERIC_OUTCOME };
  } catch (error) {
    console.error("[requestPublicFormSubmissionLookup]", error);
    return { error: "No pudimos completar la consulta. Intenta nuevamente." };
  }
}
