"use server";

import path from "node:path";

import { verifySuperAdmin } from "@/lib/auth/guards";
import { extractReceiptDataDetailed } from "@/lib/services/ai-reconciliation";
import { auditReceiptDirectory } from "@/lib/finance/receipt-audit.mjs";

const RECEIPT_SAMPLES_DIR = "comprobantes";
const DESTINATION_ACCOUNT = {
  bank_name: "Pichincha",
  account_holder: null,
  account_number: "2208033009",
};

export async function runReceiptAuditAction() {
  await verifySuperAdmin();

  const repoRoot = process.cwd();
  const dirPath = path.join(repoRoot, RECEIPT_SAMPLES_DIR);
  const results = await auditReceiptDirectory({
    dirPath,
    destinationAccount: DESTINATION_ACCOUNT,
    extractReceipt: extractReceiptDataDetailed,
  });

  const summary = results.reduce(
    (acc, result) => {
      acc[result.status] = (acc[result.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    auditedAt: new Date().toISOString(),
    directory: RECEIPT_SAMPLES_DIR,
    destinationAccount: DESTINATION_ACCOUNT,
    summary,
    results,
  };
}
