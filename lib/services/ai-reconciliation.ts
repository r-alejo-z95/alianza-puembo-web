import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.PROJECT_GEMINI_API_KEY || "");

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
      2. Devuelve SOLO el JSON, sin bloques de código markdown ni texto adicional.
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
 * Uses AI to parse bank statement rows into standardized JSON.
 */
export async function parseBankStatementWithAI(rows: any[][], headers: any[]): Promise<ExtractedReceiptData[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    const prompt = `
      Eres un auditor experto en Ecuador. Analiza estas filas de un extracto bancario y conviértelas en JSON.
      Contexto de encabezados: ${JSON.stringify(headers)}

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