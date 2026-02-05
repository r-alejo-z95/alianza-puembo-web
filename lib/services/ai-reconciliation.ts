import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Interface for the structured data extracted from a receipt.
 */
export interface ExtractedReceiptData {
  amount: number | null;
  date: string | null; 
  reference: string | null;
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
        "sender_name": (nombre de la persona que envía el dinero o null),
        "bank_name": (nombre del banco de origen o null),
        "beneficiary_name": (nombre de quien recibe el dinero),
        "beneficiary_account": (número de cuenta de destino),
        "currency": (código de moneda, ej: "USD"),
        "is_valid_receipt": (booleano, true si parece un comprobante real),
        "is_correct_beneficiary": (booleano, true si el beneficiario es "Iglesia Alianza Puembo", "Alianza Puembo", "Iglesia Evangelica Ecuatoriana", "Iglesia Alianza Cristiana y Misionera" o similar)
      }

      Reglas de Auditoría:
      1. Verifica el beneficiario: Si el dinero NO va a la "Iglesia Alianza Puembo", pon is_correct_beneficiary: false. Esto es vital para evitar fraudes.
      2. En reference, busca números de "Comprobante", "Referencia", "Secuencial" o "Autorización".
      3. Devuelve SOLO el JSON, sin bloques de código markdown ni texto adicional.
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
    
    return JSON.parse(text) as ExtractedReceiptData;
  } catch (error) {
    console.error("Error in AI extraction service:", error);
    return {
      amount: null,
      date: null,
      reference: null,
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
 * Uses AI to parse bank statement rows into standardized JSON.
 */
export async function parseBankStatementWithAI(rows: any[][], headers: any[]): Promise<ExtractedReceiptData[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    const prompt = `
      Eres un auditor experto en Ecuador. Analiza estas filas de un extracto bancario y conviértelas en JSON.
      Contexto de encabezados: ${JSON.stringify(headers)}

      Tu objetivo es encontrar el IDENTIFICADOR ÚNICO (Referencia) y los datos de ingreso.

      Estructura de cada objeto:
      {
        "amount": (decimal exacto, ej: 2.00),
        "date": (ISO YYYY-MM-DD),
        "reference": (número de documento/secuencial/comprobante),
        "sender_name": (nombre del depositante si aparece),
        "bank_name": (banco de origen si se menciona),
        "is_valid_receipt": true,
        "is_correct_beneficiary": true
      }

      REGLAS:
      1. Solo extrae ingresos/depósitos/créditos.
      2. Moneda: La coma "," es decimal (2,00 -> 2.00).
      3. Devuelve un array JSON limpio.
      
      Filas:
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