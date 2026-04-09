import type { ExtractedReceiptData } from "@/lib/services/ai-reconciliation";

export const INVALID_RECEIPT_MESSAGE =
  "Parece que estás subiendo una imagen no válida. Sube un comprobante de transferencia o depósito o acércate al equipo para más información.";

const RECEIPT_KEYWORDS = [
  "transferencia",
  "banco",
  "comprobante",
  "documento",
  "numero",
  "número",
  "cuenta",
  "deposito",
  "depósito",
  "exitoso",
  "exitosa",
];

const CASH_KEYWORDS = ["efectivo", "cash", "pago en efectivo"];

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function validateFinancialReceipt(
  extractedData: ExtractedReceiptData | null,
): { isValid: boolean; reason?: string } {
  if (!extractedData) {
    return { isValid: false, reason: "No se pudo extraer información del comprobante." };
  }

  const textParts = [
    extractedData.description,
    extractedData.reference,
    extractedData.bank_name,
    extractedData.beneficiary_name,
    extractedData.beneficiary_account,
    extractedData.sender_name,
  ]
    .filter(Boolean)
    .join(" ");

  const haystack = normalizeText(textParts);
  const keywordMatches = RECEIPT_KEYWORDS.filter((kw) =>
    haystack.includes(normalizeText(kw)),
  ).length;
  const hasCashLanguage = CASH_KEYWORDS.some((kw) =>
    haystack.includes(normalizeText(kw)),
  );

  const amount = Number(extractedData.amount ?? 0);
  const hasCoreFields =
    amount > 0 &&
    !!extractedData.date &&
    (!!extractedData.bank_name || !!extractedData.beneficiary_account);

  if (hasCashLanguage) {
    return { isValid: false, reason: "El comprobante parece corresponder a efectivo." };
  }

  if (!extractedData.is_valid_receipt) {
    return { isValid: false, reason: "La IA no lo identificó como comprobante válido." };
  }

  if (!hasCoreFields) {
    return {
      isValid: false,
      reason: "Faltan datos clave como monto, fecha o cuenta/banco en el comprobante.",
    };
  }

  if (keywordMatches < 2) {
    return {
      isValid: false,
      reason: "No contiene suficientes señales textuales de comprobante bancario.",
    };
  }

  return { isValid: true };
}
