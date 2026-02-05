// lib/actions.ts

"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas";
import { sendSystemNotification } from "@/lib/services/notifications";
import { headers } from "next/headers";

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
type LoginInput = {
  email: string;
  password: string;
};

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
    parsed.data as LoginInput,
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
      link: "/admin/oracion",
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
      type: "form",
      target: { userId: authorId },
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
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error in initializeGoogleIntegration:", error);
    return { error: "Error inesperado al conectar con Google.", details: error.message };
  }
}

/**
 * Uploads a receipt image to the secure finance bucket.
 * Intended for use with financial forms reconciliation.
 */
export async function uploadReceipt(formData: FormData) {
  const file = formData.get("file") as File;
  const formSlug = formData.get("formSlug") as string;
  
  if (!file || !formSlug) return { error: "Datos incompletos" };

  try {
    const supabase = await createClient();
    
    // Generate a secure unique path: form_slug/year/month/uuid.ext
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const path = `${formSlug}/${year}/${month}/${uniqueName}`;

    // Upload to 'finance_receipts' bucket
    // Note: This bucket must exist and allow upsert/insert for authenticated service role
    const { data, error } = await supabase.storage
      .from("finance_receipts")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Return the path. The reconciliation process will sign it when needed.
    return { success: true, path: data.path, fullPath: `finance_receipts/${data.path}` };

  } catch (error) {
    console.error("Error uploading receipt:", error);
    return { error: "Error al guardar el comprobante" };
  }
}
