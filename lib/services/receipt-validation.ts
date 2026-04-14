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

export type ReceiptReviewStatus = "valid" | "manual_review" | "invalid";

export type DestinationBankAccountLike = {
  bank_name?: string | null;
  account_holder?: string | null;
  account_number?: string | null;
};

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeDigits(input: string) {
  return input.replace(/\D/g, "");
}

function getBeneficiaryMatchScore(
  extractedData: ExtractedReceiptData,
  destinationAccount?: DestinationBankAccountLike | null,
) {
  if (!destinationAccount) {
    return { score: 0, confidence: "none" as const, matched: false };
  }

  const expectedName = normalizeText(destinationAccount.account_holder || "");
  const expectedNumber = normalizeDigits(destinationAccount.account_number || "");
  const expectedBank = normalizeText(destinationAccount.bank_name || "");

  const candidateText = normalizeText(
    [
      extractedData.bank_name,
      extractedData.beneficiary_name,
      extractedData.sender_name,
      extractedData.description,
      extractedData.reference,
      extractedData.beneficiary_account,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const candidateDigits = normalizeDigits(
    [
      extractedData.beneficiary_account,
      extractedData.reference,
      extractedData.description,
    ]
      .filter(Boolean)
      .join(" "),
  );

  let score = 0;

  if (expectedNumber) {
    if (candidateDigits === expectedNumber) {
      score += 60;
    } else if (candidateDigits.endsWith(expectedNumber.slice(-6)) || candidateDigits.includes(expectedNumber.slice(-4))) {
      score += 40;
    }
  }

  if (expectedName) {
    const nameTokens = expectedName
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4);

    const matchedTokens = nameTokens.filter((token) => {
      if (candidateText.includes(token)) return true;
      const shortened = token.slice(0, 4);
      return shortened.length >= 3 && candidateText.includes(shortened);
    }).length;

    if (nameTokens.length > 0) {
      score += Math.round((matchedTokens / nameTokens.length) * 30);
    }
  }

  if (expectedBank && candidateText.includes(expectedBank)) {
    score += 15;
  }

  if (candidateText.includes(expectedName) && expectedName) {
    score += 20;
  }

  const confidence: "high" | "medium" | "low" | "none" =
    score >= 70 ? "high" : score >= 40 ? "medium" : score >= 15 ? "low" : "none";
  return { score, confidence, matched: score >= 40 };
}

export function compareReceiptBeneficiary(
  extractedData: ExtractedReceiptData | null | undefined,
  destinationAccount?: DestinationBankAccountLike | null,
) {
  if (!extractedData) {
    return { score: 0, confidence: "none" as const, matched: false };
  }

  return getBeneficiaryMatchScore(extractedData, destinationAccount);
}

export function classifyFinancialReceipt(
  extractedData: ExtractedReceiptData | null,
  destinationAccount?: DestinationBankAccountLike | null,
): { status: ReceiptReviewStatus; reason?: string; beneficiaryMatch?: { score: number; confidence: "high" | "medium" | "low" | "none"; matched: boolean } } {
  if (!extractedData) {
    return { status: "invalid", reason: "No se pudo extraer información del comprobante." };
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

  const beneficiaryMatch = getBeneficiaryMatchScore(extractedData, destinationAccount);
  const hasReceiptSignals = keywordMatches > 0 || !!extractedData.bank_name || !!extractedData.beneficiary_account || !!extractedData.reference;
  const hasStrongReceiptSignals = keywordMatches >= 2 || beneficiaryMatch.matched;

  if (hasCashLanguage) {
    return {
      status: "invalid",
      reason: "El comprobante parece corresponder a efectivo.",
      beneficiaryMatch,
    };
  }

  if (!extractedData.is_valid_receipt && !hasReceiptSignals && !hasStrongReceiptSignals) {
    return {
      status: "invalid",
      reason: "La IA no lo identificó como comprobante y no hay señales bancarias suficientes.",
      beneficiaryMatch,
    };
  }

  if (!hasCoreFields) {
    return {
      status: "manual_review",
      reason: "Faltan datos clave como monto, fecha o cuenta/banco en el comprobante.",
      beneficiaryMatch,
    };
  }

  if (!extractedData.is_valid_receipt || keywordMatches < 2 || !hasStrongReceiptSignals) {
    return {
      status: "manual_review",
      reason: "El comprobante parece válido pero requiere revisión manual.",
      beneficiaryMatch,
    };
  }

  return {
    status: "valid",
    beneficiaryMatch,
  };
}

export function validateFinancialReceipt(
  extractedData: ExtractedReceiptData | null,
  destinationAccount?: DestinationBankAccountLike | null,
): { isValid: boolean; reason?: string } {
  const result = classifyFinancialReceipt(extractedData, destinationAccount);
  return { isValid: result.status !== "invalid", reason: result.reason };
}
