import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFinancialAnalyticsPaymentColumns,
  getFinancialAnalyticsPaymentFilePaths,
} from "../lib/finance/analytics-export.mjs";

test("buildFinancialAnalyticsPaymentColumns adds dynamic clickable receipt columns for every payment slot", () => {
  const submissions = [
    {
      id: "sub-1",
      form_submission_payments: [
        {
          status: "verified",
          receipt_path: "finance_receipts/ana-1.png",
          extracted_data: { amount: 40, date: "2026-03-01", sender_name: "Ana Payer" },
        },
        {
          status: "pending",
          receipt_path: "finance_receipts/ana-2.png",
          extracted_data: { amount: 20, date: "2026-03-02", sender_name: "Ana Payer 2" },
        },
      ],
    },
    {
      id: "sub-2",
      form_submission_payments: [
        {
          status: "manual_review",
          receipt_path: "finance_receipts/zoe-1.pdf",
          amount_claimed: 15,
          created_at: "2026-03-03T10:00:00.000Z",
        },
      ],
    },
  ];
  const fileUrlMap = new Map([
    ["finance_receipts/ana-1.png", "https://signed.test/ana-1"],
    ["finance_receipts/ana-2.png", "https://signed.test/ana-2"],
    ["finance_receipts/zoe-1.pdf", "https://signed.test/zoe-1"],
  ]);

  const { headers, valuesBySubmissionId } = buildFinancialAnalyticsPaymentColumns(submissions, fileUrlMap);

  assert.deepEqual(headers, [
    "Pagos / abonos",
    "Comprobante abono 1",
    "Comprobante abono 2",
  ]);
  assert.equal(
    valuesBySubmissionId.get("sub-1")[0],
    "1. 01/03/2026 - $40.00 - Conciliado - Ana Payer\n2. 02/03/2026 - $20.00 - Pendiente - Ana Payer 2",
  );
  assert.deepEqual(valuesBySubmissionId.get("sub-1").slice(1), [
    { text: "Ver comprobante 1", hyperlink: "https://signed.test/ana-1" },
    { text: "Ver comprobante 2", hyperlink: "https://signed.test/ana-2" },
  ]);
  assert.deepEqual(valuesBySubmissionId.get("sub-2").slice(1), [
    { text: "Ver comprobante 1", hyperlink: "https://signed.test/zoe-1" },
    "",
  ]);
});

test("getFinancialAnalyticsPaymentFilePaths includes every active payment receipt path", () => {
  const paths = getFinancialAnalyticsPaymentFilePaths([
    {
      form_submission_payments: [
        { receipt_path: "finance_receipts/valid.png", status: "verified" },
        { receipt_path: "finance_receipts/discarded.png", manual_disposition: "incorrecto" },
      ],
    },
  ]);

  assert.deepEqual(paths, ["finance_receipts/valid.png"]);
});
