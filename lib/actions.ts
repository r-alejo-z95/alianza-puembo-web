// lib/actions.ts

"use server";

import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { loginSchema } from "@/lib/schemas";
import {
  sendSystemNotification,
  sendConfirmationEmail,
  sendSubmissionTrackingLinksEmail,
} from "@/lib/services/notifications";
import { headers } from "next/headers";
import { revalidateForms, revalidateFormSubmissions } from "./actions/cache";
import { extractReceiptDataDetailed } from "@/lib/services/ai-reconciliation";
import {
  INVALID_RECEIPT_MESSAGE,
  UNRECOGNIZED_DESTINATION_ACCOUNT_MESSAGE,
  resolveFinancialReceiptValidation,
} from "@/lib/services/receipt-validation";
import crypto from "crypto";
import { ensureFinanceReceiptsBucket } from "@/lib/finance/storage";
import { getInstallmentEmailSummary } from "@/lib/finance/payment-summary.mjs";
import { getSubmissionBalanceSummary } from "@/lib/finance/submission-balance.mjs";
import { detectFinancialSubmissionConflict } from "@/lib/finance/submission-dedupe.mjs";
import { findNameInSubmission } from "@/lib/form-utils";
import {
  getReceiptFileExtension,
  isSupportedReceiptMimeType,
  MAX_RECEIPT_FILE_SIZE_BYTES,
} from "@/lib/finance/receipt-file";

/**
 * Verifica un token de Cloudflare Turnstile.
 */
async function verifyTurnstileToken(token: string | null) {
  if (!token) return false;

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("ERROR: TURNSTILE_SECRET_KEY no está configurada en las variables de entorno.");
    return false;
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body: formData,
        method: "POST",
      },
    );

    const outcome = await result.json();
    return outcome.success;
  } catch (error) {
    console.error("Error verificando Turnstile:", error);
    return false;
  }
}

/**
 * Helper para Rate Limiting básico basado en IP y Email/Nombre
 * Previene abusos manuales en formularios públicos.
 */
async function checkRateLimit(type: "contact" | "prayer", identifier: string) {
  const supabase = await createClient();
  const timeWindow = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutos

  const table = type === "contact" ? "contact_messages" : "prayer_requests";
  const column = type === "contact" ? "email" : "name"; // En prayer usamos name o aproximado

  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, identifier)
    .gt("created_at", timeWindow);

  if (error) return true; // Si hay error, permitimos por seguridad de UX
  return (count || 0) < 3; // Máximo 3 mensajes cada 10 minutos
}

// Contact Form Action
const contactSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z
    .string()
    .email({ message: "Por favor, introduce un correo electrónico válido." }),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
});

type ContactFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    message?: string[];
    captcha?: string[];
    rateLimit?: string[];
  };
  success?: boolean;
  message?: string;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const turnstileToken = formData.get("turnstile_token") as string;
  const isCaptchaValid = await verifyTurnstileToken(turnstileToken);

  if (!isCaptchaValid) {
    return {
      errors: {
        captcha: [
          "La verificación de seguridad falló. Por favor, inténtalo de nuevo.",
        ],
      },
    };
  }

  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, message } = validatedFields.data;

  // Rate Limit check
  const isAllowed = await checkRateLimit("contact", email);
  if (!isAllowed) {
    return {
      errors: {
        rateLimit: ["Has enviado demasiados mensajes. Por favor, espera unos minutos."],
      },
    };
  }

  try {
    const supabase = await createClient();
    
    // 1. Guardar en Base de Datos
    const { data: newMessage, error: dbError } = await supabase
      .from("contact_messages")
      .insert([{ name, email, phone, message, status: "unread" }])
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Notificar al equipo
    await sendSystemNotification({
      type: "contact",
      target: "permitted_admins",
      title: `Nuevo mensaje de contacto: ${name}`,
      message: `
        <p>Has recibido un nuevo mensaje a través de la web.</p>
        <p><strong>De:</strong> ${name} (${email})</p>
        <p><strong>Mensaje:</strong><br/>${message.substring(0, 100)}${message.length > 100 ? "..." : ""}</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; pt: 10px;">
          <em>Por favor, gestiona este mensaje y envía la respuesta oficial desde el Panel de Administración para mantener el historial.</em>
        </p>
      `,
      meta: {
        link: `/admin/comunidad?tab=mensajes&id=${newMessage.id}`,
      },
    });

    return {
      success: true,
      message:
        "¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.",
    };
  } catch (error) {
    console.error("Error processing contact form:", error);
    return {
      success: false,
      message:
        "Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
    };
  }
}

/**
 * Acción para responder a un mensaje de contacto vía Resend
 * Configura Reply-To al admin actual y CC a info@alianzapuembo.org.
 */
export async function replyToContactMessage(messageId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "No autorizado" };

  try {
    // 1. Obtener datos del mensaje y del admin
    const { data: message, error: msgError } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (msgError || !message) throw new Error("Mensaje no encontrado");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // 2. Enviar Correo vía Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) throw new Error("Configuración de correo incompleta en el servidor");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Iglesia Alianza Puembo <notificaciones@alianzapuembo.org>",
        to: [message.email],
        cc: ["info@alianzapuembo.org"],
        reply_to: profile?.email || user.email,
        subject: `Re: Su mensaje a Iglesia Alianza Puembo`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
              <img src="https://alianzapuembo.org/brand/logo-puembo-white.png" alt="Alianza Puembo" style="height: 40px;">
            </div>
            <div style="padding: 40px;">
              <p>Estimado(a) <strong>${message.name}</strong>,</p>
              <p>Le escribimos en respuesta a su mensaje enviado a través de nuestro sitio web:</p>
              <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #8fc641; font-style: italic; margin: 20px 0;">
                "${message.message}"
              </div>
              <p>${content.replace(/\n/g, "<br/>")}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 14px; color: #666;">
                Atentamente,<br/>
                <strong>${profile?.full_name || "Equipo Alianza Puembo"}</strong><br/>
                Iglesia Alianza Puembo
              </p>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
              Nota: Si responde a este correo, su mensaje será recibido directamente por la persona que le atendió con copia a la oficina principal.
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Error al enviar correo por Resend");
    }

    // 3. Actualizar DB
    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({
        status: "replied",
        reply_content: content,
        replied_at: new Date().toISOString(),
        replied_by: user.id,
      })
      .eq("id", messageId);

    if (updateError) throw updateError;

    revalidatePath("/admin/mensajes");
    return { success: true };
  } catch (e: any) {
    console.error("Error in replyToContactMessage:", e);
    return { success: false, error: e.message };
  }
}

// Login Action
export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Correo o contraseña inválidos." };
  }

  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return { error: "Correo o contraseña inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(
    parsed.data as any,
  );

  if (error) {
    return { error: "Credenciales incorrectas o error del servidor." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

// Prayer Request Action
export async function addPrayerRequest(formData: FormData) {
  const turnstileToken = formData.get("turnstile_token") as string;
  const isCaptchaValid = await verifyTurnstileToken(turnstileToken);

  if (!isCaptchaValid) {
    return {
      error:
        "La verificación de seguridad falló. Por favor, inténtalo de nuevo.",
    };
  }

  const name = formData.get("name") as string;
  const request_text = formData.get("request_text") as string;
  const is_public = formData.get("is_public") === "true";
  const is_anonymous = formData.get("is_anonymous") === "true";

  if (!request_text || typeof request_text !== "string") {
    return { error: "El texto de la petición no puede estar vacío." };
  }

  // Rate limit para peticiones (usamos el nombre o 'anon' como base)
  const isAllowed = await checkRateLimit("prayer", name || "anonymous");
  if (!isAllowed) {
    return { error: "Has enviado demasiadas peticiones. Por favor, espera unos minutos." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prayer_requests")
    .insert([
      { name, request_text, is_public, is_anonymous, status: "pending" },
    ])
    .select();

  if (error) {
    console.error("Error inserting prayer request:", error);
    return {
      error: "No se pudo enviar tu petición. Por favor, inténtalo de nuevo.",
    };
  }

  // Notificar usando el servicio centralizado
  await sendSystemNotification({
    type: "prayer",
    target: "permitted_admins",
    title: `Nueva petición de oración recibida`,
    message: `
      <p><strong>Solicitante:</strong> ${is_anonymous ? "Anónimo" : name || "Alguien"}</p>
      <p><strong>Petición:</strong><br/>${request_text.substring(0, 100)}...</p>
    `,
    meta: {
      link: `/admin/comunidad?tab=peticiones&id=${data[0]?.id}`,
    },
  });

  revalidatePath("/oracion");

  return { data };
}

/**
 * Acción simple para verificar CAPTCHA desde componentes de cliente
 */
export async function verifyCaptcha(token: string) {
  const isValid = await verifyTurnstileToken(token);
  return { isValid };
}

/**
 * Acción para notificar envío de formularios dinámicos
 */
export async function notifyFormSubmission(
  formTitle: string,
  formSlug: string,
  authorId: string,
  submitterId?: string,
) {
  if (!authorId) return { success: false };

  try {
    const supabase = await createClient();
    
    // Consultar si el formulario es interno para personalizar el mensaje
    const { data: form } = await supabase
      .from("forms")
      .select("is_internal")
      .eq("slug", formSlug)
      .single();

    const isInternal = form?.is_internal || false;
    let submitterName = "Un miembro del equipo";

    if (isInternal && submitterId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", submitterId)
        .single();
      
      if (profile?.full_name) {
        submitterName = profile.full_name;
      }
    }

    await sendSystemNotification({
      type: isInternal ? "internal" : "form",
      target: isInternal ? "permitted_admins" : { userId: authorId },
      title: isInternal 
        ? `Nuevo registro operativo: ${formTitle}`
        : `Nueva respuesta recibida: ${formTitle}`,
      message: isInternal
        ? `<strong>${submitterName}</strong> ha hecho una solicitud en <strong>"${formTitle}"</strong>.`
        : `El formulario <strong>"${formTitle}"</strong> ha recibido una nueva respuesta de un usuario.`,
      meta: { 
        link: isInternal 
          ? `/admin/staff/respuestas/${formSlug}`
          : `/admin/formularios/analiticas/${formSlug}` 
      },
    });
    return { success: true };
  } catch (e) {
    console.error("Error notifying form submission:", e);
    return { success: false };
  }
}

// Create Form and Sheet Action
export async function createFormAndSheet(formTitle: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated." };
  }

  const slug = slugify(formTitle);

  try {
    // 1. Create the form entry in Supabase
    const { data: newForm, error: formError } = await supabase
      .from("forms")
      .insert([{ title: formTitle, user_id: user.id, slug }])
      .select("id, slug")
      .single();

    if (formError || !newForm) {
      console.error("Error creating form in DB:", formError);
      return { error: "Error al crear el formulario en la base de datos." };
    }

    const formId = newForm.id;
    const formSlug = newForm.slug;

    // 2. Call the Edge Function to create the Google Sheet
    const edgeFunctionUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL +
      "/functions/v1/sheets-drive-integration/create-sheet";
    console.log("Calling Edge Function at:", edgeFunctionUrl);
    console.log("Sending body:", { formId, formTitle, formSlug });
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ formId, formTitle, formSlug }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error calling edge function:", result);
      console.error("Edge function response status:", response.status);
      console.error("Edge function response status text:", response.statusText);
      return {
        error: result.error || "Error al crear la hoja de cálculo de Google.",
      };
    }

    revalidatePath("/admin/formularios");
    await revalidateForms(); // Revalidate cached forms

    return {
      success: true,
      formId,
      formSlug,
      formUrl: `/formularios/${formSlug}`,
    };
  } catch (error) {
    console.error("Unexpected error in createFormAndSheet:", error);
    return { error: "Ocurrió un error inesperado." };
  }
}

// Regenerate Form and Sheet Action (Using slug instead of form_id)
export async function regenerateFormAndSheet(
  formSlug: string,
  newFormTitle: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated." };
  }

  console.log("Regenerating form with slug:", formSlug);

  try {
    // 1. Buscar el formulario por slug
    const { data: oldForm, error: fetchError } = await supabase
      .from("forms")
      .select("id, slug, title, google_sheet_id")
      .eq("slug", formSlug)
      .eq("is_archived", false)
      .single();

    if (fetchError || !oldForm) {
      console.error("Error fetching form by slug:", fetchError);
      return { error: "Error al obtener el formulario anterior." };
    }

    const formId = oldForm.id;

    // 2. Actualizar el formulario existente con el nuevo título
    const { data: updatedForm, error: updateError } = await supabase
      .from("forms")
      .update({
        title: newFormTitle,
      })
      .eq("id", formId)
      .select("id, slug")
      .single();

    if (updateError || !updatedForm) {
      console.error("Error updating form in DB:", updateError);
      return {
        error: "Error al actualizar el formulario en la base de datos.",
      };
    }

    // 3. Crear un nuevo Google Sheet (manteniendo el anterior)
    const edgeFunctionUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL +
      "/functions/v1/sheets-drive-integration/create-sheet";
    console.log("Creating new sheet for regenerated form");

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        formId,
        formTitle: `${newFormTitle} (Regenerado)`,
        formSlug,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error calling edge function:", result);
      return {
        error:
          result.error || "Error al crear la nueva hoja de cálculo de Google.",
      };
    }

    revalidatePath("/admin/formularios");
    await revalidateForms();

    return { success: true, formId, formUrl: `/formularios/${formSlug}` };
  } catch (error) {
    console.error("Unexpected error in regenerateFormAndSheet:", error);

    return { error: "Ocurrió un error inesperado." };
  }
}

// Initialize Google Integration for an existing form
export async function initializeGoogleIntegration(
  formId: string,
  formTitle: string,
  formSlug: string,
  formFields?: any[],
) {
  const supabase = await createClient();
  
  // 1. Verificación de Seguridad: Solo usuarios autenticados
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado", details: "Debes estar autenticado para realizar esta acción." };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in the current environment.");
    return { 
      error: "Error de configuración: Llave de servicio no encontrada en el servidor.",
      details: "Verifica las variables de entorno en Vercel."
    };
  }

  try {
    // Check if the form already has a Google Sheet ID to avoid double initialization
    const { data: existingForm, error: fetchError } = await supabase
      .from("forms")
      .select("google_sheet_id")
      .eq("id", formId)
      .single();

    if (fetchError) {
      console.error("Error checking existing form:", fetchError);
      return { error: "Error al verificar el estado del formulario." };
    }

    if (existingForm?.google_sheet_id) {
      return { success: true, alreadyInitialized: true };
    }

    const edgeFunctionUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL +
      "/functions/v1/sheets-drive-integration/create-sheet";

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ formId, formTitle, formSlug, formFields }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Edge Function Error:", result);
      return {
        error: result.error || "La conexión con Google falló.",
        details: result.details || response.statusText,
        status: response.status
      };
    }

    revalidatePath("/admin/formularios");
    await revalidateForms();
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error in initializeGoogleIntegration:", error);
    return { error: "Error inesperado al conectar con Google.", details: error.message };
  }
}

function buildSubmissionOutcome({
  status,
  title,
  message,
  steps = [],
  primaryAction,
  secondaryAction,
}: {
  status: "success" | "error" | "duplicate" | "closed" | "security";
  title: string;
  message: string;
  steps?: string[];
  primaryAction?: {
    label: string;
    href?: string;
    reload?: boolean;
    confirmSharedPayment?: {
      accepted: boolean;
      matchedSubmissionId: string;
      matchedPaymentId: string;
    };
  };
  secondaryAction?: { label: string; href?: string; reload?: boolean };
}) {
  return { status, title, message, steps, primaryAction, secondaryAction };
}

async function cleanupUploadedFinanceReceipt(supabaseAdmin: any, receiptPath?: string | null) {
  const storagePath = String(receiptPath || "").startsWith("finance_receipts/")
    ? String(receiptPath).replace("finance_receipts/", "")
    : String(receiptPath || "");

  if (!storagePath || storagePath.includes("..")) return;

  const { error } = await supabaseAdmin.storage
    .from("finance_receipts")
    .remove([storagePath]);

  if (error) {
    console.error(`[Submit] Error limpiando comprobante (${storagePath}): ${error.message}`);
  }
}

async function loadActiveFinancialSubmissionsForConflict(supabaseAdmin: any, formId: string) {
  const { data, error } = await supabaseAdmin
    .from("form_submissions")
    .select("id, access_token, notification_email, data, answers, created_at, is_archived, coverage_mode, covered_by_submission_id, form_submission_payments(id, receipt_path, amount_claimed, extracted_data, status, manual_disposition)")
    .eq("form_id", formId)
    .eq("is_archived", false);

  if (error) {
    console.error("[Submit] Error consultando inscripciones activas:", error);
    return [];
  }

  return data || [];
}

async function loadActiveBankAccountsForReceiptValidation(supabaseAdmin: any) {
  const { data, error } = await supabaseAdmin
    .from("bank_accounts")
    .select("bank_name, account_holder, account_number")
    .eq("is_active", true);

  if (error) {
    console.error("[Submit] Error consultando cuentas bancarias activas:", error);
    return [];
  }

  return data || [];
}

function buildTrackingEmailSubmission(form: any, submission: any, remainingBalance?: number | null) {
  return {
    formTitle: form?.title || "Inscripción",
    accessToken: submission?.access_token,
    createdAt: submission?.created_at || null,
    remainingBalance: remainingBalance ?? null,
  };
}

async function sendConflictTrackingEmail(form: any, conflict: any) {
  const email = conflict?.matchedSubmission?.notification_email;
  const accessToken = conflict?.matchedSubmission?.access_token;
  if (!email || !accessToken) return false;

  const result = await sendSubmissionTrackingLinksEmail(email, {
    submissions: [
      buildTrackingEmailSubmission(form, conflict.matchedSubmission, conflict.remainingBalance),
    ],
  });

  return !!result?.success;
}

function matchesSharedPaymentConfirmation(conflict: any, confirmation: any) {
  return (
    conflict?.action === "confirm_shared_payment" &&
    confirmation?.accepted === true &&
    confirmation?.matchedSubmissionId === conflict?.matchedSubmission?.id &&
    confirmation?.matchedPaymentId === conflict?.matchedPayment?.id
  );
}

/**
 * Acción centralizada para enviar respuestas de formularios.
 * Procesa archivos, extrae info con AI y guarda en DB de forma atómica en el servidor.
 */
export async function submitFormAction(payload: {
  formId: string;
  rawData: any;
  answers?: any[];
  processedDataForGoogle: any;
  userAgent: string;
  isInternal: boolean;
  notificationEmail?: string;
  sharedPaymentConfirmation?: {
    accepted?: boolean;
    matchedSubmissionId?: string;
    matchedPaymentId?: string;
  } | null;
}) {
  const {
    formId,
    rawData,
    answers = [],
    processedDataForGoogle,
    userAgent,
    isInternal,
    notificationEmail,
    sharedPaymentConfirmation,
  } = payload;
  console.log(`[Submit] Iniciando procesamiento para formulario: ${formId}`);

  try {
    const supabaseAdmin = createAdminClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Obtener configuración del formulario (Usando Admin para asegurar acceso)
    const { data: form, error: formErr } = await supabaseAdmin
      .from("forms")
      .select("id, title, slug, is_financial, payment_type, total_amount, destination_account_id, financial_field_label, financial_field_id, user_id, google_sheet_id, max_responses, form_fields!form_id(id, label)")
      .eq("id", formId)
      .single();

    if (formErr || !form) throw new Error("Formulario no encontrado");
    console.log(`[Submit] Form: ${form.slug}, Is Financial: ${form.is_financial}, Target Label: "${form.financial_field_label}"`);

    let destinationAccount: {
      bank_name?: string | null;
      account_holder?: string | null;
      account_number?: string | null;
    } | null = null;
    let acceptedDestinationAccounts: Array<{
      bank_name?: string | null;
      account_holder?: string | null;
      account_number?: string | null;
    }> = [];

    if (form.destination_account_id) {
      const { data: account } = await supabaseAdmin
        .from("bank_accounts")
        .select("bank_name, account_holder, account_number")
        .eq("id", form.destination_account_id)
        .maybeSingle();

      destinationAccount = account || null;
    }

    if (form.is_financial) {
      acceptedDestinationAccounts = await loadActiveBankAccountsForReceiptValidation(supabaseAdmin);
    }

    // 1.1. Check max_responses limit before processing
    if (form.max_responses) {
      const { count: submissionCount } = await supabaseAdmin
        .from("form_submissions")
        .select("id", { count: "exact", head: true })
        .eq("form_id", formId)
        .eq("is_archived", false);

      if ((submissionCount ?? 0) >= form.max_responses) {
        // Auto-disable the form since limit is reached
        await supabaseAdmin.from("forms").update({ enabled: false }).eq("id", formId);
        revalidateTag("forms");
        console.log(`[Submit] Límite de respuestas alcanzado para ${form.slug}. Formulario deshabilitado.`);
        return {
          error: "Este formulario ya no acepta más respuestas. Ha alcanzado el límite de inscripciones.",
          closed: true,
          outcome: buildSubmissionOutcome({
            status: "closed",
            title: "Cupos completos",
            message: "Este formulario llegó al límite de inscripciones activas y ya no puede recibir nuevas respuestas.",
            steps: [
              "Si ya tienes una inscripción y necesitas revisar tu estado, entra al portal de seguimiento.",
              "Si crees que esto es un error, comunícate con el equipo organizador.",
            ],
            primaryAction: { label: "Ir a seguimiento", href: "/inscripcion" },
          }),
        };
      }
    }

    let aiExtractedData = null;
    let aiTransientFailure = false;
    let receiptPath = null;
    let sharedPaymentCoverage: {
      matchedSubmissionId: string;
      matchedPaymentId: string;
      matchedPaymentStatus?: string | null;
    } | null = null;

    // 2. Si el formulario es financiero, procesar con IA
    if (form.is_financial && (form.financial_field_id || form.financial_field_label)) {
      // Look up by field ID first (stable), fall back to label text for legacy forms
      const financialField = (form as any).form_fields?.find((f: any) => f.id === form.financial_field_id);
      const targetLabel = (financialField?.label ?? form.financial_field_label ?? "").trim();
      const actualKey = targetLabel
        ? Object.keys(rawData).find(k => k.trim().toLowerCase() === targetLabel.toLowerCase())
        : undefined;
      const receiptInfo = actualKey ? rawData[actualKey] : null;
      
      console.log(`[Submit] Buscando comprobante en key: "${actualKey}"`);

      if (receiptInfo?.financial_receipt_path) {
        receiptPath = receiptInfo.financial_receipt_path;
        const path = receiptPath.replace('finance_receipts/', '');
        console.log(`[AI-Process] Descargando de: ${path}`);
        
        // Descargar con Admin para asegurar acceso al bucket privado
        const { data: fileBlob, error: dlErr } = await supabaseAdmin.storage
          .from("finance_receipts")
          .download(path);

        if (!dlErr && fileBlob) {
          try {
            console.log(`[AI-Process] Archivo descargado. Enviando a Gemini...`);
            const buffer = await fileBlob.arrayBuffer();
            const extraction = await extractReceiptDataDetailed(
              Buffer.from(buffer).toString('base64'), 
              fileBlob.type
            );
            aiExtractedData = extraction.data;
            aiTransientFailure = extraction.transientFailure;
            console.log(`[AI-Process] Gemini respondió con éxito.`);
          } catch (aiErr) {
            console.error("[AI-Process] Error en Gemini:", aiErr);
          }
        } else if (dlErr) {
          console.error(`[AI-Process] Error descarga: ${dlErr.message}`);
        }
      } else {
        console.log("[Submit] No se encontró 'financial_receipt_path' en los datos recibidos.");
      }
    }

    if (form.is_financial && !receiptPath) {
      console.warn("[Submit] Formulario financiero sin comprobante procesable. Se rechaza el envío.");
      return {
        error: INVALID_RECEIPT_MESSAGE,
        outcome: buildSubmissionOutcome({
          status: "error",
          title: "No pudimos validar el comprobante",
          message: "El formulario financiero necesita un comprobante bancario legible para registrar la inscripción.",
          steps: [
            "Sube una imagen o PDF del comprobante de transferencia.",
            "Verifica que se vean el monto, fecha, referencia y cuenta de destino.",
            "Si ya estabas inscrito y solo quieres subir otro abono, entra al portal de seguimiento.",
          ],
          primaryAction: { label: "Intentar de nuevo" },
          secondaryAction: { label: "Ir a seguimiento", href: "/inscripcion" },
        }),
      };
    }

    // 2.1. Validación crítica: comprobante inválido NO debe persistir en DB
    let receiptReviewStatus: "valid" | "manual_review" | "invalid" = "valid";
    if (form.is_financial && receiptPath) {
      const validation = resolveFinancialReceiptValidation({
        extractedData: aiExtractedData,
        transientFailure: aiTransientFailure,
        destinationAccount,
        acceptedDestinationAccounts,
      });
      receiptReviewStatus = validation.status;
      if (validation.status === "invalid") {
        console.warn(`[Submit] Comprobante inválido detectado. Motivo: ${validation.reason || "N/A"}`);

        await cleanupUploadedFinanceReceipt(supabaseAdmin, receiptPath);

        const errorMessage =
          aiTransientFailure || validation.reason === UNRECOGNIZED_DESTINATION_ACCOUNT_MESSAGE
            ? validation.reason
            : INVALID_RECEIPT_MESSAGE;
        return {
          error: errorMessage || INVALID_RECEIPT_MESSAGE,
          outcome: buildSubmissionOutcome({
            status: "error",
            title: "Comprobante no aceptado",
            message: errorMessage || INVALID_RECEIPT_MESSAGE,
            steps: [
              "Sube un comprobante real de transferencia o depósito, no capturas de documentos personales ni facturas.",
              "Asegúrate de que se lean el monto, fecha, referencia y datos de la cuenta de destino.",
              "Si ya estabas inscrito, usa el portal de seguimiento para subir un nuevo abono.",
            ],
            primaryAction: { label: "Corregir comprobante" },
            secondaryAction: { label: "Ir a seguimiento", href: "/inscripcion" },
          }),
        };
      }
    }

    if (form.is_financial && receiptPath) {
      const activeSubmissions = await loadActiveFinancialSubmissionsForConflict(supabaseAdmin, formId);
      const conflict = detectFinancialSubmissionConflict({
        incoming: {
          notificationEmail,
          participantName: findNameInSubmission({ data: rawData, answers }),
          receiptData: aiExtractedData || {},
        },
        existingSubmissions: activeSubmissions,
        totalAmount: Number(form.total_amount || 0),
      });

      if (conflict) {
        const isDuplicateReceipt = conflict.type === "duplicate_receipt";
        const canConfirmSharedPayment = conflict.action === "confirm_shared_payment";
        const confirmedSharedPayment = matchesSharedPaymentConfirmation(conflict, sharedPaymentConfirmation);

        if (confirmedSharedPayment) {
          sharedPaymentCoverage = {
            matchedSubmissionId: conflict.matchedSubmission.id,
            matchedPaymentId: conflict.matchedPayment.id,
            matchedPaymentStatus: conflict.matchedPayment.status || null,
          };
        } else {
          await cleanupUploadedFinanceReceipt(supabaseAdmin, receiptPath);

          if (canConfirmSharedPayment) {
            return {
              error: "Este comprobante ya fue registrado, pero puede cubrir otra inscripción.",
              outcome: buildSubmissionOutcome({
                status: "duplicate",
                title: "¿Quieres usar este mismo pago para esta inscripción?",
                message: "Detectamos que este comprobante ya está asociado a otra inscripción. Como el monto alcanza para más personas, puedes vincular esta inscripción al mismo pago sin registrar un ingreso adicional.",
                steps: [
                  `Este comprobante alcanza para ${conflict.sharedPayment.capacity} inscripción${conflict.sharedPayment.capacity === 1 ? "" : "es"} en total.`,
                  `Ya cubre ${conflict.sharedPayment.usedSlots}; queda${conflict.sharedPayment.availableSlots === 1 ? "" : "n"} ${conflict.sharedPayment.availableSlots} cupo${conflict.sharedPayment.availableSlots === 1 ? "" : "s"} disponible${conflict.sharedPayment.availableSlots === 1 ? "" : "s"}.`,
                  "Finanzas revisará el pago una sola vez para evitar duplicarlo.",
                ],
                primaryAction: {
                  label: "Sí, usar este mismo pago",
                  confirmSharedPayment: {
                    accepted: true,
                    matchedSubmissionId: conflict.matchedSubmission.id,
                    matchedPaymentId: conflict.matchedPayment.id,
                  },
                },
                secondaryAction: { label: "Subir otro comprobante" },
              }),
            };
          }

          const emailSent = await sendConflictTrackingEmail(form, conflict);

          return {
            error: isDuplicateReceipt
              ? "Este comprobante ya fue registrado en una inscripción activa."
              : "Ya encontramos una inscripción activa con este correo.",
            outcome: buildSubmissionOutcome({
              status: "duplicate",
              title: isDuplicateReceipt
                ? "Este comprobante ya fue registrado"
                : "Ya tienes una inscripción activa",
              message: isDuplicateReceipt
                ? "No creamos otra respuesta porque ese comprobante ya está asociado a una inscripción activa."
                : "No creamos otra respuesta para evitar duplicar tu inscripción. Si necesitas hacer otro abono, usa tu enlace de seguimiento.",
              steps: [
                emailSent
                  ? "Te reenviamos el enlace de seguimiento al correo registrado en la inscripción."
                  : "Entra al portal de seguimiento con tu token o solicita recuperar el enlace por correo.",
                "Desde el seguimiento puedes revisar el estado de pago y subir comprobantes adicionales.",
                "Si esta inscripción no es tuya o necesitas ayuda, comunícate con el equipo organizador.",
              ],
              primaryAction: { label: "Ir a seguimiento", href: "/inscripcion" },
              secondaryAction: { label: "Corregir y volver" },
            }),
          };
        }
      }
    }

    // 3. Insertar en DB (Usamos Admin para bypass de RLS en formularios públicos)
    const submissionData: any = {
      form_id: formId,
      data: rawData,
      answers,
      user_agent: userAgent,
      notification_email: notificationEmail,
    };

    if (sharedPaymentCoverage) {
      Object.assign(submissionData, {
        coverage_mode: "covered_by_used_payment",
        covered_by_submission_id: sharedPaymentCoverage.matchedSubmissionId,
        coverage_created_at: new Date().toISOString(),
      });
    }

    if (isInternal && user?.id) {
      submissionData.user_id = user.id;
    }

    console.log(`[Submit] Guardando en DB...`);
    const { data: submission, error: dbError } = await supabaseAdmin
      .from("form_submissions")
      .insert([submissionData])
      .select()
      .single();

    if (dbError) {
      console.error(`[Submit] Error insertando en DB: ${dbError.message}`);
      throw dbError;
    }
    console.log(`[Submit] Éxito: Registro guardado ID ${submission.id}`);

    // 3.1. Si es financiero y hay recibo, guardar en la nueva tabla de pagos
    if (form.is_financial && receiptPath) {
      await supabaseAdmin.from("form_submission_payments").insert([{
        submission_id: submission.id,
        receipt_path: receiptPath,
        amount_claimed: Number(aiExtractedData?.amount || 0),
        extracted_data: sharedPaymentCoverage
          ? {
              ...(aiExtractedData || {}),
              shared_payment: {
                covered_by_submission_id: sharedPaymentCoverage.matchedSubmissionId,
                covered_by_payment_id: sharedPaymentCoverage.matchedPaymentId,
              },
            }
          : aiExtractedData,
        status: receiptReviewStatus === "valid" ? 'pending' : 'manual_review',
        manual_disposition: sharedPaymentCoverage ? "duplicado" : null,
        manual_disposition_at: sharedPaymentCoverage ? new Date().toISOString() : null,
        manual_disposition_notes: sharedPaymentCoverage
          ? "Comprobante compartido confirmado por el usuario durante la inscripción pública."
          : null,
      }]);
    }

    // 3.2. Auto-disable form if max_responses just reached
    if (form.max_responses) {
      const { count: newCount } = await supabaseAdmin
        .from("form_submissions")
        .select("id", { count: "exact", head: true })
        .eq("form_id", formId)
        .eq("is_archived", false);

      if ((newCount ?? 0) >= form.max_responses) {
        await supabaseAdmin.from("forms").update({ enabled: false, closed_by_limit: true }).eq("id", formId);
        revalidateTag("forms");
        console.log(`[Submit] Límite alcanzado con esta respuesta. Formulario ${form.slug} deshabilitado automáticamente.`);
      }
    }

    // 4. TAREAS EN BACKGROUND (No bloquean la respuesta al usuario)
    if (notificationEmail && form.is_financial) {
      const { data: payments } = await supabaseAdmin
        .from("form_submission_payments")
        .select("amount_claimed, extracted_data, status")
        .eq("submission_id", submission.id);

      const totalAmount = Number(form.total_amount || 0);
      const emailSummary = sharedPaymentCoverage
        ? {
            amountPaid: totalAmount,
            remainingBalance: 0,
            hasPendingVerification: sharedPaymentCoverage.matchedPaymentStatus !== "verified",
          }
        : getInstallmentEmailSummary({
            totalAmount,
            payments: payments || [],
          });

      if (sharedPaymentCoverage || emailSummary.remainingBalance > 0) {
        sendConfirmationEmail(notificationEmail, {
          formTitle: form.title,
          accessToken: submission.access_token,
          paymentType: form.payment_type,
          totalAmount,
          amountPaid: emailSummary.amountPaid,
          remainingBalance: emailSummary.remainingBalance,
          hasPendingVerification: emailSummary.hasPendingVerification,
        }).catch(err => console.error("[Confirmation Email Error]:", err));
      }
    }

    notifyFormSubmission(form.title, form.slug, form.user_id, user?.id)
      .catch(err => console.error("[Notification Error]:", err));

    // Revalidar fuera del camino crítico de respuesta
    after(async () => {
      try {
        await revalidateFormSubmissions(formId);
      } catch (err) {
        console.error("[Revalidate Error]:", err);
      }
    });

    const isFinancialSuccess = !!form.is_financial;
    const isSharedPaymentSuccess = !!sharedPaymentCoverage;
    const sharedPaymentIsVerified = sharedPaymentCoverage?.matchedPaymentStatus === "verified";
    return {
      success: true,
      submissionId: submission.id,
      accessToken: submission.access_token,
      outcome: buildSubmissionOutcome({
        status: "success",
        title: isFinancialSuccess ? "Inscripción recibida" : "Respuesta recibida",
        message: isSharedPaymentSuccess
          ? sharedPaymentIsVerified
            ? "Registramos tu inscripción como cubierta por un comprobante compartido ya validado."
            : "Registramos tu inscripción como cubierta por un comprobante compartido pendiente de validación."
          : isFinancialSuccess
          ? "Registramos tu inscripción y tu comprobante quedó pendiente de validación."
          : "Tu respuesta fue registrada correctamente.",
        steps: isSharedPaymentSuccess
          ? [
              "Guarda tu enlace de seguimiento para revisar el estado de esta inscripción.",
              sharedPaymentIsVerified
                ? "El comprobante principal ya fue validado; no se contará como doble ingreso."
                : "Finanzas validará el comprobante principal una sola vez; no se contará como doble ingreso.",
              "También enviamos el enlace al correo que indicaste, si el correo fue válido.",
            ]
          : isFinancialSuccess
          ? [
              "Guarda tu enlace de seguimiento para revisar el estado de tu inscripción.",
              "Si necesitas hacer otro abono, no llenes el formulario otra vez: súbelo desde seguimiento.",
              "También enviamos el enlace al correo que indicaste, si el correo fue válido.",
            ]
          : [
              "Puedes cerrar esta ventana o enviar una nueva respuesta si corresponde.",
            ],
        primaryAction: isFinancialSuccess && submission.access_token
          ? { label: "Ver seguimiento", href: `/inscripcion/${submission.access_token}` }
          : { label: "Nueva respuesta", reload: true },
        secondaryAction: { label: "Ir al inicio", href: "/" },
      }),
    };

  } catch (error: any) {
    console.error("Error crítico en submitFormAction:", error);
    return {
      error: error.message || "Error al procesar el envío",
      outcome: buildSubmissionOutcome({
        status: "error",
        title: "No pudimos procesar tu envío",
        message: error.message || "Ocurrió un error al procesar el formulario.",
        steps: [
          "Revisa tu conexión e intenta nuevamente.",
          "Si estabas subiendo un comprobante, confirma que sea imagen o PDF menor a 5MB.",
          "Si el problema continúa, comunícate con el equipo organizador.",
        ],
        primaryAction: { label: "Intentar de nuevo" },
      }),
    };
  }
}

export async function requestSubmissionTrackingLinks(email: string) {
  const parsed = z.string().email().safeParse(String(email || "").trim().toLowerCase());
  if (!parsed.success) {
    return {
      error: "Ingresa un correo electrónico válido.",
      outcome: buildSubmissionOutcome({
        status: "error",
        title: "Correo inválido",
        message: "Necesitamos un correo válido para buscar inscripciones activas.",
        steps: ["Revisa que el correo esté escrito completo, por ejemplo nombre@correo.com."],
        primaryAction: { label: "Corregir correo" },
      }),
    };
  }

  const normalizedEmail = parsed.data;
  const supabaseAdmin = createAdminClient();

  try {
    const { data, error } = await supabaseAdmin
      .from("form_submissions")
      .select("id, access_token, created_at, coverage_mode, coverage_amount, covered_by_submission_id, form_submission_payments(amount_claimed, extracted_data, status, manual_disposition, created_at), forms!inner(title, total_amount, is_financial, is_internal)")
      .eq("is_archived", false)
      .eq("forms.is_financial", true)
      .eq("forms.is_internal", false)
      .ilike("notification_email", normalizedEmail);

    if (error) {
      console.error("[requestSubmissionTrackingLinks] lookup failed:", error);
    }

    const submissions = (data || [])
      .filter((submission: any) => submission?.access_token)
      .map((submission: any) => {
        const form = Array.isArray(submission.forms) ? submission.forms[0] : submission.forms;
        const summary = getSubmissionBalanceSummary({
          totalAmount: Number(form?.total_amount || 0),
          submission,
        });

        return {
          formTitle: form?.title || "Inscripción",
          accessToken: submission.access_token,
          createdAt: submission.created_at,
          remainingBalance: summary.remainingBalance,
        };
      });

    if (submissions.length > 0) {
      await sendSubmissionTrackingLinksEmail(normalizedEmail, { submissions });
    }

    return {
      success: true,
      outcome: buildSubmissionOutcome({
        status: "success",
        title: "Revisa tu correo",
        message: "Si encontramos inscripciones activas con ese correo, te enviaremos los enlaces de seguimiento.",
        steps: [
          "Busca un correo de Iglesia Alianza Puembo en tu bandeja de entrada.",
          "Revisa spam o promociones si no lo ves en unos minutos.",
          "Desde el enlace puedes subir abonos adicionales sin llenar otra inscripción.",
        ],
        primaryAction: { label: "Entendido" },
      }),
    };
  } catch (error: any) {
    console.error("[requestSubmissionTrackingLinks]", error);
    return {
      success: true,
      outcome: buildSubmissionOutcome({
        status: "success",
        title: "Solicitud recibida",
        message: "Si encontramos inscripciones activas con ese correo, te enviaremos los enlaces de seguimiento.",
        steps: [
          "Si no llega el correo, revisa que hayas usado el mismo correo de tu inscripción.",
          "Si necesitas ayuda, comunícate con el equipo organizador.",
        ],
        primaryAction: { label: "Entendido" },
      }),
    };
  }
}

/**
 * Sincroniza el Google Sheet de un formulario desde la base de datos.
 * Solo agrega respuestas que faltan (no elimina ni modifica las existentes).
 * Las anotaciones del equipo en el sheet se preservan.
 */
export async function syncFormToSheets(formId: string): Promise<{
  added?: number;
  total?: number;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sheets-drive-integration/sync-sheet`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ formId }),
      },
    );

    const result = await response.json();
    if (!response.ok) {
      return { error: result.error || "La sincronización con Google Sheets falló." };
    }
    return { added: result.added, total: result.total };
  } catch (error: any) {
    console.error("[syncFormToSheets] Error:", error);
    return { error: error.message || "Error inesperado al sincronizar." };
  }
}

/**
 * Genera una URL firmada temporal (1 hora) para un recibo en el bucket finance_receipts.
 */
export async function getFileSignedUrl(
  path: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const supabaseAdmin = createAdminClient();
  // financial_receipt_path se guarda con el prefijo "finance_receipts/" — quitarlo antes de createSignedUrl
  const storagePath = path.replace("finance_receipts/", "");
  const { data, error } = await supabaseAdmin.storage
    .from("finance_receipts")
    .createSignedUrl(storagePath, 3600);

  if (error) return { error: error.message };
  return { url: data.signedUrl };
}

/**
 * Subida de archivos usando el cliente administrativo para asegurar permisos.
 */
export async function uploadReceipt(formData: FormData) {
  const file = formData.get("file") as File;
  const formSlug = formData.get("formSlug") as string;
  
  if (!file || !formSlug) return { error: "Datos incompletos" };
  if (!isSupportedReceiptMimeType(file.type)) {
    return { error: "Tipo de archivo no permitido. Sube una imagen o PDF." };
  }
  if (file.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
    return { error: "El archivo no puede superar 5MB." };
  }

  try {
    const bucketResult = await ensureFinanceReceiptsBucket();
    if (bucketResult?.error) {
      throw new Error(bucketResult.error);
    }

    const supabaseAdmin = createAdminClient();
    const date = new Date();
    const extension = getReceiptFileExtension(file.name, file.type);
    const path = `${formSlug}/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${extension}`;

    console.log(`[Bucket-Upload] Intentando subir a: finance_receipts/${path}`);

    const { data, error } = await supabaseAdmin.storage
      .from("finance_receipts")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error(`[Bucket-Upload] Error Supabase: ${error.message}`);
      throw error;
    }
    
    console.log(`[Bucket-Upload] Éxito: ${data.path}`);
    return { success: true, path: data.path, fullPath: `finance_receipts/${data.path}` };
  } catch (error: any) {
    console.error("[Bucket-Upload] Excepción:", error.message);
    return { error: `No se pudo guardar la imagen: ${error.message}` };
  }
}
