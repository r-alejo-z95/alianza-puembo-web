import fs from "node:fs/promises";
import path from "node:path";

import { classifyFinancialReceipt } from "../services/receipt-validation.ts";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".pdf"]);

function detectMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".heic":
      return "image/heic";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

async function listSupportedFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSupportedFiles(fullPath)));
      continue;
    }

    if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

async function fileToBase64(filePath) {
  const file = await fs.readFile(filePath);
  return file.toString("base64");
}

export async function auditReceiptDirectory({
  dirPath,
  destinationAccount,
  extractReceipt,
}) {
  const files = await listSupportedFiles(dirPath);
  const results = [];

  for (const filePath of files) {
    const mimeType = detectMimeType(filePath);
    const fileName = path.relative(dirPath, filePath);

    try {
      const base64 = await fileToBase64(filePath);
      const extraction = await extractReceipt(base64, mimeType);

      const classification = extraction.transientFailure
        ? {
            status: "manual_review",
            reason: "La validación automática falló temporalmente.",
          }
        : classifyFinancialReceipt(extraction.data, destinationAccount);

      results.push({
        fileName,
        filePath,
        mimeType,
        status: classification.status,
        reason: classification.reason || null,
        extractedData: extraction.data,
        transientFailure: extraction.transientFailure,
        beneficiaryMatch: classification.beneficiaryMatch || null,
      });
    } catch (error) {
      results.push({
        fileName,
        filePath,
        mimeType,
        status: "error",
        reason: error instanceof Error ? error.message : String(error),
        extractedData: null,
        transientFailure: false,
        beneficiaryMatch: null,
      });
    }
  }

  return results;
}
