import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("all submissions table uses concise one-line finance badges without forcing horizontal scroll", () => {
  const manager = readFileSync(
    new URL("../components/admin/managers/AllSubmissionsManager.jsx", import.meta.url),
    "utf8",
  );

  assert.match(manager, /hidden lg:block overflow-hidden/);
  assert.match(manager, /\[&_\[data-slot=table-container\]\]:overflow-x-hidden/);
  assert.match(manager, /<Table className="table-fixed">/);
  assert.match(manager, /const financeBadgeLayoutClasses =\s*"[^"]*whitespace-nowrap[^"]*"/);
  assert.doesNotMatch(manager, /const financeBadgeLayoutClasses =\s*"[^"]*whitespace-normal[^"]*"/);
  assert.doesNotMatch(manager, /const financeBadgeLayoutClasses =\s*"[^"]*break-words[^"]*"/);
  assert.match(manager, /function getFinanceBadgeLabel\(financeState\)/);
  assert.match(manager, /"Pago bancario válido": "Pago válido"/);
  assert.match(manager, /"Comprobante descartado - contactar usuario": "Descartado"/);
  assert.match(manager, /"Cubierta por pago ya usado": "Pago compartido"/);
  assert.match(manager, /group\/finance-badge/);
  assert.match(manager, /group-hover\/finance-badge:opacity-100/);
  assert.doesNotMatch(manager, /title=\{financeState\}/);
  assert.match(manager, /aria-label=\{financeState\}/);
});
