import "server-only";

/**
 * Verifies a Cloudflare Turnstile challenge token on the server.
 */
export async function verifyTurnstileToken(token: string | null) {
  if (!token) return false;

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error(
      "ERROR: TURNSTILE_SECRET_KEY no está configurada en las variables de entorno.",
    );
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
    return Boolean(outcome.success);
  } catch (error) {
    console.error("Error verificando Turnstile:", error);
    return false;
  }
}
