import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFinanceReceiptAccessUrl,
  normalizeFinanceReceiptPath,
} from "../lib/finance/receipt-links.mjs";

test("buildFinanceReceiptAccessUrl creates stable admin receipt links for Excel exports", () => {
  const url = buildFinanceReceiptAccessUrl(
    "https://alianzapuembo.org",
    "finance_receipts/evento 1/comprobante final.pdf",
  );

  assert.equal(
    url,
    "https://alianzapuembo.org/api/admin/finance/receipt?path=finance_receipts%2Fevento%201%2Fcomprobante%20final.pdf",
  );
});

test("normalizeFinanceReceiptPath accepts only finance receipt storage paths", () => {
  assert.equal(
    normalizeFinanceReceiptPath("finance_receipts/form/subdir/receipt.png"),
    "form/subdir/receipt.png",
  );
  assert.equal(normalizeFinanceReceiptPath("form/subdir/receipt.png"), "form/subdir/receipt.png");
  assert.equal(normalizeFinanceReceiptPath("../receipt.png"), null);
  assert.equal(normalizeFinanceReceiptPath("event-posters/receipt.png"), null);
});
