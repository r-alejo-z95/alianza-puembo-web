import type { ExtractedReceiptData } from "@/lib/services/ai-reconciliation";

export const INVALID_RECEIPT_MESSAGE =
  "Parece que estás subiendo una imagen no válida. Sube un comprobante de transferencia o depósito. Recuerda que no puedes reservar tu inscripción sin el pago. Si deseas pagar con efectivo o tarjeta, acércate al equipo ministerial.";

const NEGATIVE_KEYWORDS = {
  identity_document: ["cedula", "identidad", "dni", "pasaporte", "numero de identificacion"],
  invoice: [
    "factura",
    "invoice",
    "ruc",
    "iva",
    "subtotal",
    "cliente",
    "clave de acceso",
    "autorizacion sri",
    "autorización sri",
    "punto de emision",
    "punto de emisión",
  ],
};

const RECEIPT_KEYWORDS = [
  "transferencia",
  "transferencia exitosa",
  "banco",
  "comprobante",
  "referencia",
  "movimiento",
  "cuenta",
  "deposito",
  "depósito",
  "transaccion",
  "transacción",
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

function normalizeAccountPattern(input: string) {
  return input
    .replace(/\s+/g, "")
    .replace(/[•●·]/g, "*")
    .replace(/[xX]/g, "*")
    .replace(/\./g, "*");
}

function getAccountNumberMatchScore(candidateAccountRaw: string, expectedNumber: string) {
  const normalizedRaw = normalizeAccountPattern(candidateAccountRaw || "");
  const candidateDigits = normalizeDigits(candidateAccountRaw || "");
  if (!normalizedRaw || !expectedNumber) return 0;

  const wildcardLike = /[*]/.test(normalizedRaw);

  if (candidateDigits === expectedNumber) return 60;

  if (wildcardLike) {
    const regexSource = normalizedRaw
      .split("")
      .map((char) => (char === "*" ? "\\d*" : char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
      .join("");
    const pattern = new RegExp(`^${regexSource}$`);
    if (pattern.test(expectedNumber)) return 55;
  }

  if (candidateDigits && expectedNumber.endsWith(candidateDigits) && candidateDigits.length >= 3) {
    return candidateDigits.length >= 4 ? 45 : 40;
  }

  if (candidateDigits && expectedNumber.includes(candidateDigits) && candidateDigits.length >= 6) {
    return 40;
  }

  return 0;
}

function detectNegativeSignals(extractedData: ExtractedReceiptData) {
  const haystack = normalizeText(
    [
      extractedData.description,
      extractedData.reference,
      extractedData.bank_name,
      extractedData.beneficiary_name,
      extractedData.sender_name,
      extractedData.ocr_summary,
      ...(extractedData.rejection_signals || []),
    ]
      .filter(Boolean)
      .join(" "),
  );

  const matches = [];
  for (const [kind, keywords] of Object.entries(NEGATIVE_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
      matches.push(kind);
    }
  }
  return matches;
}

function countBankSignals(extractedData: ExtractedReceiptData) {
  const haystack = normalizeText(
    [
      extractedData.description,
      extractedData.reference,
      extractedData.bank_name,
      extractedData.beneficiary_name,
      extractedData.beneficiary_account,
      extractedData.ocr_summary,
      ...(extractedData.bank_signals || []),
    ]
      .filter(Boolean)
      .join(" "),
  );

  let count = RECEIPT_KEYWORDS.filter((keyword) => haystack.includes(normalizeText(keyword))).length;
  if (extractedData.bank_name) count += 1;
  if (extractedData.reference) count += 1;
  if (extractedData.beneficiary_account) count += 1;
  if (["transfer", "deposit", "payment"].includes(extractedData.operation_type || "unknown")) count += 1;
  if (extractedData.document_kind === "bank_receipt") count += 2;
  return count;
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
    score += getAccountNumberMatchScore(extractedData.beneficiary_account || "", expectedNumber);

    if (score === 0) {
      if (candidateDigits === expectedNumber) {
        score += 60;
      } else if (candidateDigits.endsWith(expectedNumber.slice(-6)) || candidateDigits.includes(expectedNumber.slice(-4))) {
        score += 40;
      }
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
  const hasCashLanguage = CASH_KEYWORDS.some((kw) =>
    haystack.includes(normalizeText(kw)),
  );

  const documentKind = extractedData.document_kind || "unknown";
  const negativeSignals = detectNegativeSignals(extractedData);
  const bankSignalCount = countBankSignals(extractedData);
  const amount = Number(extractedData.amount ?? 0);
  const hasCoreFields =
    amount > 0 &&
    !!extractedData.date &&
    (!!extractedData.bank_name || !!extractedData.reference || !!extractedData.beneficiary_account);

  const beneficiaryMatch = getBeneficiaryMatchScore(extractedData, destinationAccount);

  if (hasCashLanguage) {
    return {
      status: "invalid",
      reason: "El comprobante parece corresponder a efectivo.",
      beneficiaryMatch,
    };
  }

  if (["identity_document", "invoice", "non_bank_document"].includes(documentKind)) {
    return {
      status: "invalid",
      reason: `El documento parece ser ${documentKind} y no un comprobante bancario.`,
      beneficiaryMatch,
    };
  }

  if (negativeSignals.length > 0 && bankSignalCount < 3) {
    return {
      status: "invalid",
      reason: "Se detectaron señales fuertes de documento no bancario.",
      beneficiaryMatch,
    };
  }

  if (bankSignalCount < 2 && !extractedData.is_valid_receipt) {
    return {
      status: "invalid",
      reason: "No hay señales suficientes de transferencia o depósito bancario.",
      beneficiaryMatch,
    };
  }

  if (!hasCoreFields) {
    return {
      status: bankSignalCount >= 2 ? "manual_review" : "invalid",
      reason: "Faltan datos transaccionales mínimos para tratarlo como comprobante bancario.",
      beneficiaryMatch,
    };
  }

  if (
    beneficiaryMatch.matched &&
    extractedData.is_valid_receipt &&
    bankSignalCount >= 4 &&
    ["high", "medium"].includes(extractedData.receipt_confidence || "low")
  ) {
    return {
      status: "valid",
      beneficiaryMatch,
    };
  }

  return {
    status: "manual_review",
    reason: "Parece un documento bancario, pero no alcanza confianza suficiente para aprobarse automático.",
    beneficiaryMatch,
  };
}

export function resolveFinancialReceiptValidation({
  extractedData,
  transientFailure,
  destinationAccount,
}: {
  extractedData: ExtractedReceiptData | null;
  transientFailure?: boolean;
  destinationAccount?: DestinationBankAccountLike | null;
}): { status: ReceiptReviewStatus; reason?: string; beneficiaryMatch?: { score: number; confidence: "high" | "medium" | "low" | "none"; matched: boolean } } {
  if (transientFailure) {
    return {
      status: "invalid",
      reason: "La validación automática falló temporalmente. Intenta subir el comprobante nuevamente en unos minutos.",
    };
  }

  return classifyFinancialReceipt(extractedData, destinationAccount);
}

export function validateFinancialReceipt(
  extractedData: ExtractedReceiptData | null,
  destinationAccount?: DestinationBankAccountLike | null,
): { isValid: boolean; reason?: string } {
  const result = classifyFinancialReceipt(extractedData, destinationAccount);
  return { isValid: result.status !== "invalid", reason: result.reason };
}
