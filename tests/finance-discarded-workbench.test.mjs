import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workbench = readFileSync(
  new URL("../components/admin/finance/ReconciliationWorkbench.jsx", import.meta.url),
  "utf8",
);

const financeActions = readFileSync(
  new URL("../lib/actions/finance.ts", import.meta.url),
  "utf8",
);

test("finance search is labeled as search and filters the active reconciliation tab", () => {
  assert.match(workbench, /placeholder="Buscar\.\.\."/);
  assert.match(workbench, /filteredPendingItems/);
  assert.match(workbench, /filteredVerifiedItems/);
  assert.match(workbench, /visibleDiscardedItems/);
  assert.match(workbench, /filteredVerifiedItems\.map\(item => renderPaymentItem\(item\)\)/);
});

test("discarded receipts can be viewed, edited, and restored from the discarded tab", () => {
  assert.match(workbench, /handleViewReceipt\(item, item\.submissionName\)/);
  assert.match(workbench, /openEdit\(item\)/);
  assert.match(workbench, /Restaurar y guardar/);
});

test("receipt photo buttons show loading feedback and prevent repeated clicks", () => {
  assert.match(workbench, /loadingReceiptId/);
  assert.match(workbench, /setLoadingReceiptId\(payment\.id\)/);
  assert.match(workbench, /isReceiptDisabled/);
  assert.match(workbench, /disabled=\{isReceiptDisabled\}/);
  assert.match(workbench, /Cargando\.\.\./);
  assert.match(workbench, /animate-spin/);
});

test("receipt viewer opens immediately with a loading state while the signed URL is prepared", () => {
  assert.match(workbench, /isLoading:\s*true/);
  assert.match(workbench, /Preparando comprobante/);
  assert.match(workbench, /Estamos firmando el archivo/);
  assert.match(workbench, /viewingReceipt\.isLoading/);
});

test("finance movements opens as a side sheet instead of an embedded ledger card", () => {
  assert.match(workbench, /Sheet open=\{isMovementsSheetOpen\}/);
  assert.match(workbench, /setIsMovementsSheetOpen\(true\)/);
  assert.match(workbench, /Movimientos bancarios/);
  assert.doesNotMatch(workbench, /<Card className="order-2/);
  assert.doesNotMatch(workbench, /<CardTitle className="text-xl md:text-2xl font-serif font-bold tracking-tight">Extracto Bancario<\/CardTitle>/);
});

test("finance movements sheet keeps ledger controls and read-only movement list", () => {
  assert.match(workbench, /SheetContent/);
  assert.match(workbench, /SheetHeader/);
  assert.match(workbench, /SheetTitle/);
  assert.match(workbench, /Filtrar movimientos/);
  assert.match(workbench, /bankStatusFilter === s/);
  assert.match(workbench, /filteredAndSortedBank\.slice\(0, parseInt\(pageSize\)\)\.map/);
  assert.match(workbench, /No se encontraron movimientos en el pool bancario/);
});

test("finance receipt viewer signs private receipt files with the admin client", () => {
  const start = financeActions.indexOf("export async function getReceiptSignedUrl");
  const end = financeActions.indexOf("/**\n * Agrega un nuevo abono", start);
  const getReceiptSignedUrl = financeActions.slice(start, end);

  assert.match(getReceiptSignedUrl, /await verifyPermission\("perm_finanzas"\)/);
  assert.match(getReceiptSignedUrl, /createAdminClient\(\)/);
});

test("saving review changes for a discarded payment clears manual disposition state", () => {
  assert.match(financeActions, /manual_disposition/);
  assert.match(financeActions, /manual_disposition:\s*null/);
  assert.match(financeActions, /manual_disposition_at:\s*null/);
  assert.match(financeActions, /covered_by_submission_id:\s*null/);
});
