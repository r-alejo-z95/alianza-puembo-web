const TRACKING_ACCESS_ERROR_PATTERN = /acceso no autorizado|inscripci[oó]n no encontrada/i;

export const TRACKING_ACCESS_ERROR_MESSAGE =
  "No pudimos validar tu enlace de seguimiento. Abre nuevamente el enlace de tu inscripción e intenta otra vez. Si el problema continúa, solicita recuperar tu enlace o contacta al equipo organizador.";

export function getPublicPaymentUploadErrorMessage(errorMessage) {
  const message = String(errorMessage || "").trim();

  if (TRACKING_ACCESS_ERROR_PATTERN.test(message)) {
    return TRACKING_ACCESS_ERROR_MESSAGE;
  }

  return message || "No pudimos subir el comprobante. Intenta nuevamente.";
}
