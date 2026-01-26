"use client";

import Turnstile from "react-turnstile";
import { cn } from "@/lib/utils";

/**
 * Componente reutilizable de Cloudflare Turnstile.
 * @param {Object} props
 * @param {function} props.onVerify - Función que recibe el token generado.
 * @param {string} props.className - Clases adicionales de Tailwind.
 * @param {string} props.theme - 'light', 'dark' o 'auto'.
 * @param {string} props.size - 'normal', 'compact' o 'flexible'.
 */
export default function TurnstileCaptcha({
  onVerify,
  className,
  theme = "light",
  size = "flexible",
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Turnstile SITE_KEY no encontrada en variables de entorno.");
    }
    return null;
  }

  return (
    <Turnstile
      sitekey={siteKey}
      onVerify={onVerify}
      theme={theme}
      size={size}
      language="es"
    />
  );
}
