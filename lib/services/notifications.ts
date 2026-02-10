import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// 1. Configuración Estática y Segura
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const resend = new Resend(process.env.RESEND_API_KEY);

type NotificationType = "contact" | "prayer" | "form" | "internal";

interface NotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  target: "permitted_admins" | { userId: string }; // 'info_email' eliminado como target primario
  meta?: {
    link?: string;
    replyTo?: string;
  };
}

export async function sendSystemNotification({
  type,
  title,
  message,
  target,
  meta,
}: NotificationParams) {
  try {
    // ---------------------------------------------------------
    // PASO 0: Obtener ajustes del sitio (solo para Fallback)
    // ---------------------------------------------------------
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("notification_email")
      .eq("id", 1)
      .single();

    const fallbackEmail =
      settings?.notification_email || "info@alianzapuembo.org";
    const multiNotifyEmail = "notifications-noreply@alianzapuembo.org"; // Email genérico para múltiples destinatarios

    // ---------------------------------------------------------
    // PASO 1: Resolver Destinatarios (Granular)
    // ---------------------------------------------------------
    let emailRecipients: string[] = [];
    let dashRecipientIds: string[] = [];

    if (target === "permitted_admins") {
      // Caso dinámico (Contacto u Oración): Filtramos por las suscripciones de cada perfil
      const emailField = `notify_email_${type}`;
      const dashField = `notify_dash_${type}`;

      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select(`id, email, ${emailField}, ${dashField}`)
        .not("email", "is", null);

      if (profiles) {
        profiles.forEach((p: any) => {
          if (p[emailField]) emailRecipients.push(p.email);
          if (p[dashField]) dashRecipientIds.push(p.id);
        });
      }
      console.log(`Resolved ${emailRecipients.length} email recipients for type ${type}`);
    } else if (typeof target === "object" && "userId" in target) {
      // Caso directo (Formularios): El autor recibe ambos siempre
      const { data: p } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("id", target.userId)
        .single();

      if (p) {
        emailRecipients.push(p.email);
        dashRecipientIds.push(p.id);
      }
    }

    // --- LOGICA DE FALLBACK ---
    // Si después de filtrar no hay nadie que reciba el email, lo mandamos al de info
    // para que la notificación no se pierda en el vacío.
    if (emailRecipients.length === 0) {
      console.log("No subscribers found for email. Using fallback.");
      emailRecipients.push(fallbackEmail);
    }

    // ---------------------------------------------------------
    // PASO 2: Guardar en Dashboard (Individualizado)
    // ---------------------------------------------------------
    if (dashRecipientIds.length > 0) {
      const cleanMessage =
        message
          .replace(/<[^>]*>/g, " ")
          .substring(0, 150)
          .trim() + "...";

      const notificationEntries = dashRecipientIds.map((uid) => ({
        user_id: uid,
        title,
        message: cleanMessage,
        type,
        link: meta?.link || null,
        read: false,
      }));

      await supabaseAdmin.from("notifications").insert(notificationEntries);
    }

    // ---------------------------------------------------------
    // PASO 3: Enviar Emails
    // ---------------------------------------------------------
    if (emailRecipients.length > 0) {
      const config = {
        prayer: { color: "#0284c7", label: "Nueva Petición de Oración" },
        contact: { color: "#ea580c", label: "Nuevo Mensaje de Contacto" },
        form: { color: "#7c3aed", label: "Respuesta en Formulario" },
        internal: { color: "#059669", label: "Registro Operativo" },
      }[type] || { color: "#059669", label: "Notificación" };

      const fromEmail =
        type === "contact"
          ? `Formulario de Contacto <contactform-noreply@alianzapuembo.org>`
          : `Notificación Alianza Puembo <notifications-noreply@alianzapuembo.org>`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; background-color: #f4f4f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e4e4e7;">
            <div style="background-color: ${config.color}; padding: 24px; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 20px;">${config.label}</h2>
            </div>
            <div style="padding: 32px;">
              <div style="background: #f8fafc; border-left: 4px solid ${config.color}; padding: 16px; margin: 24px 0; color: #3f3f46; font-size: 15px; line-height: 1.6;">
                ${message}
              </div>
              ${
                meta?.link
                  ? `
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://alianzapuembo.org${meta.link}" style="background-color: #18181b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    Ver en el Panel
                  </a>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </body>
        </html>
      `;

      if (emailRecipients.length === 1) {
        await resend.emails.send({
          from: fromEmail,
          to: emailRecipients[0],
          replyTo: meta?.replyTo || undefined,
          subject: title,
          html: htmlContent,
        });
      } else {
        await resend.emails.send({
          from: fromEmail,
          to: multiNotifyEmail, // Envío a email genérico para no exponer correos en BCC
          bcc: emailRecipients,
          replyTo: meta?.replyTo || undefined,
          subject: title,
          html: htmlContent,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Critical error in notification service:", error);
    return { success: false, error: "Internal service error" };
  }
}
