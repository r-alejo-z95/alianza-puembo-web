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

type NotificationType = "contact" | "prayer" | "form";

interface NotificationParams {
  type: NotificationType;
  title: string;
  message: string; // Puede ser HTML simple
  target: "all_admins" | "info_email" | { userId: string }; // Explícito: Todos, Info, o Usuario específico
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
    // PASO 1: Resolver Destinatarios (Emails y IDs)
    // ---------------------------------------------------------
    let recipients: { id?: string; email: string; name: string }[] = [];

    if (target === "info_email") {
      recipients.push({
        id: "system-info",
        email: "info@alianzapuembo.org",
        name: "Info Alianza Puembo",
      });
    } else if (target === "all_admins") {
      // TODO: Implementar preferencias dinámicas por usuario.
      // Actualmente se envía a todos los que están en la tabla profiles.
      // En el futuro, filtrar por toggles de preferencia (email_notifications_enabled, etc.)
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .not("email", "is", null);

      if (error) {
        throw new Error("Failed to fetch admin profiles");
      }

      if (data) {
        recipients = data.map((p) => ({
          id: p.id,
          email: p.email,
          name: p.full_name || "Admin",
        }));
      }

      if (recipients.length === 0) {
        recipients.push({
          id: "dev-admin",
          email: "info@alianzapuembo.org",
          name: "Admin Sistema",
        });
      }
    } else if (target.userId) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", target.userId)
        .single();

      if (!error && data && data.email) {
        recipients.push({
          id: data.id,
          email: data.email,
          name: data.full_name || "Usuario",
        });
      }
    }

    if (recipients.length === 0) {
      return { success: false, error: "No recipients found" };
    }

    // ---------------------------------------------------------
    // PASO 2: Guardar en Base de Datos
    // ---------------------------------------------------------
    const cleanMessage =
      message
        .replace(/<[^>]*>/g, " ")
        .substring(0, 150)
        .trim() + "...";

    const dbNotification = {
      title,
      message: cleanMessage,
      type,
      link: meta?.link || null,
      user_id:
        target === "all_admins" || target === "info_email"
          ? null
          : target.userId,
      read: false,
    };

    await supabaseAdmin.from("notifications").insert([dbNotification]);

    // ---------------------------------------------------------
    // PASO 3: Enviar Emails (Optimizado con BCC)
    // ---------------------------------------------------------
    const config = {
      prayer: { color: "#0284c7", label: "Nueva Petición de Oración" },
      contact: { color: "#ea580c", label: "Nuevo Mensaje de Contacto" },
      form: { color: "#7c3aed", label: "Respuesta en Formulario" },
    }[type] || { color: "#059669", label: "Notificación" };

    const fromEmail =
      type === "contact"
        ? "Formulario de Contacto - Alianza Puembo Web <contactform-noreply@alianzapuembo.org>"
        : "Notificación [no responder] - Alianza Puembo Web <notifications-noreply@alianzapuembo.org>";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e4e4e7;">
          <div style="background-color: ${config.color}; padding: 24px; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 20px;">${config.label}</h2>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #18181b; margin-top: 0;">Hola,</p>
            
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
          <div style="background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5;">
            Enviado automáticamente por Alianza Puembo Web
          </div>
        </div>
      </body>
      </html>
    `;

    if (recipients.length === 1) {
      await resend.emails.send({
        from: fromEmail,
        to: recipients[0].email,
        replyTo: meta?.replyTo || undefined,
        subject: title,
        html: htmlContent,
      });
    } else {
      const bccList = recipients.map((r) => r.email);
      const mainRecipient = "no-reply@alianzapuembo.org";

      await resend.emails.send({
        from: fromEmail,
        to: mainRecipient,
        bcc: bccList,
        replyTo: meta?.replyTo || undefined,
        subject: title,
        html: htmlContent,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Critical error in notification service");
    return { success: false, error: "Internal service error" };
  }
}
