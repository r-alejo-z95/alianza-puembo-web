import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("finance export uses a blocking progress dialog", () => {
  const workbench = readFileSync(
    new URL("../components/admin/finance/ReconciliationWorkbench.jsx", import.meta.url),
    "utf8",
  );

  assert.match(workbench, /exportProgress/);
  assert.match(workbench, /Descarga en progreso/);
  assert.match(workbench, /Exportando reporte financiero/);
  assert.match(workbench, /Progress value=\{exportProgress\}/);
});

test("finance manager surfaces loading state when switching forms", () => {
  const manager = readFileSync(
    new URL("../components/admin/finance/ReconciliationManager.jsx", import.meta.url),
    "utf8",
  );

  assert.match(manager, /disabled=\{isLoadingContext\}/);
  assert.match(manager, /Cargando formulario financiero/);
  assert.match(manager, /isLoadingContext=\{isLoadingContext\}/);
});
