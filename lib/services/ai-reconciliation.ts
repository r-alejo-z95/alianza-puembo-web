import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.PROJECT_GEMINI_API_KEY || "");

const CREDIT_KEYWORDS = [
  "credito",
  "crédito",
  "abono",
  "deposito",
  "depósito",
  "ingreso",
  "acreditado",
  "transferencia recibida",
  "nota de credito",
  "nota de crédito",
];

const DEBIT_KEYWORDS = [
  "debito",
  "débito",
  "egreso",
  "salida",
  "cargo",
  "retiro",
  "valor debitado",
  "total debitado",
];

function normalizeText(input: unknown) {
  return String(input ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getCellText(cell: unknown) {
  if (cell === null || cell === undefined) return "";
  if (typeof cell === "string") return cell;
  if (typeof cell === "number") return String(cell);
  if (typeof cell === "object") {
    if (Array.isArray(cell)) return cell.map(getCellText).join(" ");
    if ("value" in (cell as any)) return getCellText((cell as any).value);
    if ("label" in (cell as any)) return getCellText((cell as any).label);
    if ("text" in (cell as any)) return getCellText((cell as any).text);
  }
  return String(cell);
}

function parseAmount(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = normalizeText(value);
  if (!text) return null;
  const cleaned = text
    .replace(/\s+/g, "")
    .replace(/[$€]/g, "")
    .replace(/[^0-9,.-]/g, "");
  if (!cleaned) return null;

  const commaCount = (cleaned.match(/,/g) || []).length;
  const dotCount = (cleaned.match(/\./g) || []).length;
  let normalized = cleaned;

  if (commaCount > 0 && dotCount > 0) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (commaCount > 0 && dotCount === 0) {
    normalized = cleaned.replace(",", ".");
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function findHeaderIndex(headers: any[], patterns: string[]) {
  return headers.findIndex((header) => {
    const headerText = normalizeText(header);
    return patterns.some((pattern) => headerText.includes(normalizeText(pattern)));
  });
}

function hasAnyKeyword(text: string, keywords: string[]) {
  const haystack = normalizeText(text);
  return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
}

function parseDateValue(value: unknown) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value).trim();
  if (!text) return null;

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, "0");
    const month = slashMatch[2].padStart(2, "0");
    const year = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL BANK STATEMENT PARSER (deterministic + AI fallback)
// Processes structured rows from Excel/CSV exports of bank accounts.
// NOT used for receipt image OCR — see extractReceiptData below.
// ─────────────────────────────────────────────────────────────────────────────

function parseBankStatementDeterministic(rows: any[][], headers: any[], context?: { bankAccountName?: string; bankAccountNumber?: string }) {
  if (!Array.isArray(rows) || rows.length === 0 || !Array.isArray(headers) || headers.length === 0) {
    return [];
  }

  const normalizedHeaders = headers.map((header) => normalizeText(header));
  const dateIdx = findHeaderIndex(normalizedHeaders, ["fecha", "date"]);
  const descriptionIdx = findHeaderIndex(normalizedHeaders, ["descripcion", "descripción", "concepto", "detalle", "movimiento", "transaccion", "transacción"]);
  const referenceIdx = findHeaderIndex(normalizedHeaders, ["referencia", "comprobante", "documento", "secuencial", "autorizacion", "autorización"]);
  const creditIdx = findHeaderIndex(normalizedHeaders, ["credito", "crédito", "abono", "ingreso", "acreditado", "valor acreditado"]);
  const debitIdx = findHeaderIndex(normalizedHeaders, ["debito", "débito", "cargo", "egreso", "valor debitado", "total debitado"]);
  const amountIdx = findHeaderIndex(normalizedHeaders, ["monto", "importe", "valor", "amount", "saldo"]);
  const typeIdx = findHeaderIndex(normalizedHeaders, ["tipo", "movimiento", "operacion", "operación"]);
  const bankIdx = findHeaderIndex(normalizedHeaders, ["banco", "entidad", "origen"]);
  const senderIdx = findHeaderIndex(normalizedHeaders, ["ordenante", "remitente", "depositante", "cliente", "titular"]);

  const parsed = [];

  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const rowText = row.map(getCellText).join(" ");
    if (!normalizeText(rowText)) continue;

    // Classify the row as debit or credit using only the type and description
    // columns — NOT the full concatenated row. Concatenating all cells can
    // incorrectly discard valid credit rows whose description echoes terms like
    // "valor debitado" (common in Banco de Guayaquil statements).
    const typeValue = typeIdx >= 0 ? normalizeText(getCellText(row[typeIdx])) : "";
    const descValue = descriptionIdx >= 0 ? normalizeText(getCellText(row[descriptionIdx])) : "";
    const classificationText = [typeValue, descValue].filter(Boolean).join(" ") || normalizeText(rowText);

    if (hasAnyKeyword(classificationText, DEBIT_KEYWORDS) && !hasAnyKeyword(classificationText, CREDIT_KEYWORDS)) continue;

    const date = parseDateValue(dateIdx >= 0 ? row[dateIdx] : null);
    const description = descriptionIdx >= 0 ? getCellText(row[descriptionIdx]).trim() : rowText.trim();
    const reference = referenceIdx >= 0 ? getCellText(row[referenceIdx]).trim() : "";
    const senderName = senderIdx >= 0 ? getCellText(row[senderIdx]).trim() : "";
    const bankName = bankIdx >= 0 ? getCellText(row[bankIdx]).trim() : context?.bankAccountName || "";

    const creditAmount = creditIdx >= 0 ? parseAmount(row[creditIdx]) : null;
    const debitAmount = debitIdx >= 0 ? parseAmount(row[debitIdx]) : null;
    const singleAmount = amountIdx >= 0 ? parseAmount(row[amountIdx]) : null;

    let amount = null;

    if (creditAmount !== null && creditAmount > 0) {
      // Explicit credit column — most reliable signal
      amount = creditAmount;
    } else if (
      singleAmount !== null &&
      singleAmount > 0 &&
      (!debitAmount || debitAmount <= 0) &&
      (hasAnyKeyword(typeValue, CREDIT_KEYWORDS) || hasAnyKeyword(classificationText, CREDIT_KEYWORDS) || !hasAnyKeyword(classificationText, DEBIT_KEYWORDS))
    ) {
      // Single amount column, confirmed as credit by type/description
      amount = singleAmount;
    } else if (debitAmount === null && singleAmount !== null && singleAmount > 0 && !hasAnyKeyword(classificationText, DEBIT_KEYWORDS)) {
      // No debit column at all and no debit signals — treat as credit
      amount = singleAmount;
    }

    if (!amount || !date) continue;

    parsed.push({
      amount,
      date,
      reference: reference || "",
      description: description || rowText.trim(),
      sender_name: senderName || null,
      bank_name: bankName || null,
      beneficiary_name: context?.bankAccountName || null,
      beneficiary_account: context?.bankAccountNumber || null,
      currency: "USD",
      is_valid_receipt: true,
      is_correct_beneficiary: true,
    });
  }

  return parsed;
}

/**
 * Interface for the structured data extracted from a receipt.
 */
export interface ExtractedReceiptData {
  amount: number | null;
  date: string | null; 
  reference: string | null;
  description: string | null;
  sender_name: string | null;
  bank_name: string | null;
  beneficiary_name: string | null;
  beneficiary_account: string | null;
  currency: string | null;
  is_valid_receipt: boolean;
  is_correct_beneficiary: boolean; // Flag for security
}

/**
 * Uses Gemini 2.0 Flash Lite to extract financial data from a receipt image.
 */
export async function extractReceiptData(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractedReceiptData> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite", 
    });

    const prompt = `
      Actúa como un auditor contable experto en Ecuador. Tu tarea es extraer información financiera de este comprobante de transferencia bancaria.
      
      Debes devolver un objeto JSON estrictamente con la siguiente estructura:
      {
        "amount": (número decimal o null),
        "date": (string en formato YYYY-MM-DD o null),
        "reference": (string con el código de comprobante/referencia o null),
        "description": (extrae el MOTIVO, CONCEPTO o DESCRIPCIÓN que el usuario escribió al hacer la transferencia),
        "sender_name": (nombre de la persona que envía el dinero o null),
        "bank_name": (nombre del banco de origen o null),
        "beneficiary_name": (nombre de quien recibe el dinero),
        "beneficiary_account": (número de cuenta de destino),
        "currency": (código de moneda, ej: "USD"),
        "is_valid_receipt": (booleano, true si parece un comprobante real),
        "is_correct_beneficiary": (booleano)
      }

      Reglas de Auditoría para is_correct_beneficiary:
      1. SÉ FLEXIBLE: Los nombres suelen estar truncados por el banco o tener errores.
      2. MARCA COMO TRUE si el nombre contiene palabras clave como: "Alianza", "Puembo", "Iglesia", "Evangelica", "Ecuatoriana", o "I.A.C.Y.M".
      3. ACEPTA TRUNCAMIENTOS: "Iglesia Evan...", "Alianza Puem...", "Igl. Alianza" son VÁLIDOS.
      4. SOLO MARCA FALSE si el beneficiario es claramente OTRA persona o empresa ajena a la iglesia.

      Reglas para description:
      1. Busca textos precedidos por "Concepto", "Motivo", "Descripción", "Referencia" (cuando es texto) o "Comentario".
      2. Si no hay nada explícito, deja null.

      Otras Reglas:
      1. En reference, busca números de "Comprobante", "Referencia", "Secuencial" o "Autorización".
      2. Si el comprobante muestra comisiones, cargos, valores debitados o totales debitados, ignóralos por completo.
      3. El campo amount debe contener únicamente el monto real transferido o depositado, nunca el total debitado con cargos.
      4. Devuelve SOLO el JSON, sin bloques de código markdown ni texto adicional.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
      { text: prompt }
    ]);

    const response = result.response;
    let text = response.text().trim();
    
    if (text.startsWith("```json")) {
      text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith("```")) {
      text = text.substring(3, text.length - 3).trim();
    }
    
    const parsed = JSON.parse(text);
    return {
      description: null,
      ...parsed
    } as ExtractedReceiptData;
  } catch (error) {
    console.error("Error in AI extraction service:", error);
    return {
      amount: null,
      date: null,
      reference: null,
      description: null,
      sender_name: null,
      bank_name: null,
      beneficiary_name: null,
      beneficiary_account: null,
      currency: null,
      is_valid_receipt: false,
      is_correct_beneficiary: false,
    };
  }
}

/**
 * Uses deterministic parsing first, and falls back to AI only when needed.
 */
export async function parseBankStatementWithAI(
  rows: any[][],
  headers: any[],
  context?: { bankAccountName?: string; bankAccountNumber?: string },
): Promise<ExtractedReceiptData[]> {
  const deterministic = parseBankStatementDeterministic(rows, headers, context);
  if (deterministic.length > 0) {
    return deterministic;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    const prompt = `
      Eres un auditor experto en Ecuador. Analiza estas filas de un extracto bancario y conviértelas en JSON.
      Contexto de encabezados: ${JSON.stringify(headers)}
      Contexto de cuenta bancaria seleccionada: ${JSON.stringify(context || null)}

      Tu objetivo es identificar TODOS los movimientos que representen un INGRESO (Crédito) a la cuenta, sin importar su origen.

      Estructura de cada objeto:
      {
        "amount": (número decimal, ej: 25.50),
        "date": (ISO YYYY-MM-DD),
        "reference": (número de documento, secuencial, comprobante o referencia única),
        "description": (descripción completa del movimiento tal como aparece en el extracto),
        "sender_name": (nombre del depositante o remitente si es identificable),
        "bank_name": (banco de origen si se menciona),
        "is_valid_receipt": true,
        "is_correct_beneficiary": true
      }

      REGLAS CRÍTICAS:
      1. Extrae ABSOLUTAMENTE TODOS los ingresos/créditos/depósitos/abonos. 
      2. Incluye: Transferencias Recibidas (Directas o Interbancarias), Depósitos por Ventanilla, Depósitos en Cajero Automático (Multifunción), Notas de Crédito, y cualquier otro crédito que aumente el saldo.
      3. Ignora los Egresos/Débitos.
      4. Si no hay una 'Referencia' explícita, usa el número de documento o cualquier identificador único de la fila.
      5. Formato de Moneda: En Ecuador, algunos bancos usan coma para decimales (ej: 10,00 -> 10.00). Asegúrate de devolver un número válido.
      6. No omitas ningún ingreso por pequeño que sea.
      7. Si aparece una línea de comisión, cargo, débito, valor debitado o total debitado, IGNÓRALA por completo.
      8. Cuando una transacción tenga una comisión separada, extrae solo el monto real de la transferencia o depósito, nunca el monto debitado total con cargos.
      
      Filas a procesar:
      ${JSON.stringify(rows)}

      Responde SOLO el array JSON: [{...}, {...}]
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith("```json")) {
      text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith("```")) {
      text = text.substring(3, text.length - 3).trim();
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing bank statement:", error);
    return [];
  }
}
