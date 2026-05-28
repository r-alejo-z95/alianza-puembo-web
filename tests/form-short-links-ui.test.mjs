import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("admin share tools render editable short links and QR downloads", () => {
  const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  assert.match(packageJson, /"qrcode"/);

  const componentPath = new URL("../components/admin/forms/FormShareTools.jsx", import.meta.url);
  assert.equal(existsSync(componentPath), true);

  const source = readFileSync(componentPath, "utf8");
  assert.match(source, /QRCode\.toString/);
  assert.match(source, /QRCode\.toDataURL/);
  assert.match(source, /updateFormShortCode/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /getFormShortUrl/);
  assert.match(source, /Descargar SVG/);
  assert.match(source, /Descargar PNG/);
});

test("form rows expose share tools for each form", () => {
  const source = readFileSync(
    new URL("../components/admin/managers/table-cells/FormRow.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /FormShareTools/);
  assert.match(source, /<FormShareTools form=\{form\}/);
});
