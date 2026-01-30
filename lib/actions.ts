// lib/actions.ts

"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas";
import { sendSystemNotification } from "@/lib/services/notifications";

/**
 * Verifica un token de Cloudflare Turnstile.
 */
async function verifyTurnstileToken(token: string | null) {
  if (!token) return false;

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn(
      "TURNSTILE_SECRET_KEY no configurada. Saltando validación en desarrollo.",
    );
    return true;
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

  try {
    // Usar el servicio centralizado de notificaciones
    await sendSystemNotification({
      type: "contact",
      target: "permitted_admins",
      title: `${name} ha enviado un mensaje a través del formulario de contacto - Alianza Puembo Web`,
      message: `
        <strong>De:</strong> ${name} &lt;${email}&gt;<br/>
        <strong>Teléfono:</strong> ${phone || "N/A"}<br/>
        <br/>
        ${message}
      `,
      meta: {
        replyTo: email,
      },
    });

    return {
      success: true,
      message:
        "¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.",
    };
  } catch (error) {
    console.error("Error sending contact notification:", error);
    return {
      success: false,
      message:
        "Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
    };
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
    title: `Alguien ha enviado una nueva petición de oración - Alianza Puembo Web`,
    message: `
      <strong>Solicitante:</strong> ${is_anonymous ? "Anónimo" : name || "Alguien"}<br/>
      <strong>Petición:</strong><br/>
      <blockquote>${request_text}</blockquote>
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
) {
  if (!authorId) return { success: false };

  try {
    await sendSystemNotification({
      type: "form",
      target: { userId: authorId },
      title: `Alguien ha respondido al formulario: ${formTitle} - Alianza Puembo Web`,
      message: `El formulario <strong>"${formTitle}"</strong> ha recibido una nueva respuesta.`,
      meta: { link: `/admin/formularios/analiticas/${formSlug}` },
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated." };
  }

  try {
    // Check if the form already has a Google Sheet ID to avoid double initialization
    const { data: existingForm, error: fetchError } = await supabase
      .from("forms")
      .select("google_sheet_id")
      .eq("id", formId)
      .single();

    if (fetchError) {
      console.error(
        "Error checking existing form for Google integration:",
        fetchError,
      );
      return { error: "Error al verificar el estado del formulario." };
    }

    if (existingForm?.google_sheet_id) {
      console.log(
        "Form already has a Google Sheet ID. Skipping initialization.",
      );
      return { success: true, alreadyInitialized: true };
    }

    const edgeFunctionUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL +
      "/functions/v1/sheets-drive-integration/create-sheet";

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },

      body: JSON.stringify({ formId, formTitle, formSlug, formFields }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error calling edge function:", result);

      // If it's a timeout or a known error but the creation might have happened
      return {
        error:
          result.error || "La conexión con Google tardó más de lo esperado.",
        details: result.details,
      };
    }

    revalidatePath("/admin/formularios");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error in initializeGoogleIntegration:", error);

    return { error: "Ocurrió un error inesperado al conectar con Google." };
  }
}
