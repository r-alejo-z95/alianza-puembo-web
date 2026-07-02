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
  assert.match(source, /getFormShortDisplayUrl/);
  assert.match(source, /getFormShortUrl/);
  assert.match(source, /isReservedFormShortCode/);
  assert.match(source, /navigator\.clipboard\.writeText\(displayUrl\)/);
  assert.match(source, /QRCode\.toString\(shortUrl/);
  assert.match(source, /QRCode\.toDataURL\(shortUrl/);
  assert.match(source, /Share2/);
  assert.match(source, /Compartir link corto y QR/);
  assert.match(source, /TooltipContent/);
  assert.match(source, /Copiar link/);
  assert.match(source, /Descargar SVG/);
  assert.match(source, /Descargar PNG/);
  assert.doesNotMatch(source, /window\.location\.origin/);
  assert.doesNotMatch(source, /\/formularios\/\$\{form\.slug\}/);
});

test("admin QR share tools constrain long links and switch to a mobile drawer", () => {
  const source = readFileSync(
    new URL("../components/admin/forms/FormShareTools.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /useScreenSize/);
  assert.match(source, /DrawerContent/);
  assert.match(source, /w-\[520px\]/);
  assert.match(source, /max-h-\[min\(680px,calc\(100dvh-4rem\)\)\]/);
  assert.match(source, /overflow-y-auto/);
  assert.match(source, /max-h-\[92vh\] flex flex-col z-\[400\] bg-black/);
  assert.match(source, /bg-\[#F8F9FA\]/);
  assert.match(source, /min-w-0/);
  assert.match(source, /truncate/);
});

test("shared mobile drawer chrome matches the QR drawer pattern", () => {
  const drawer = readFileSync(new URL("../components/ui/drawer.jsx", import.meta.url), "utf8");
  const panel = readFileSync(
    new URL("../components/admin/layout/AdminEditorPanel.jsx", import.meta.url),
    "utf8",
  );

  assert.match(drawer, /overflow-hidden rounded-t-\[2\.5rem\] border-none bg-black/);
  assert.match(drawer, /h-1\.5 w-\[88px\] rounded-full bg-white\/20/);
  assert.match(panel, /max-h-\[92vh\] flex flex-col z-\[400\] bg-black overflow-hidden border-none p-0/);
  assert.match(panel, /bg-\[#F8F9FA\]/);
});

test("form rows expose share tools for each form", () => {
  const source = readFileSync(
    new URL("../components/admin/managers/table-cells/FormRow.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /FormShareTools/);
  assert.match(source, /<FormShareTools form=\{form\} showLabel=\{compact\}/);
  assert.match(source, /grid-cols-5/);
  assert.match(source, /col-span-5/);
  assert.match(source, /lg:flex/);
  assert.match(source, /Ver\s+\{responsesLabel\}/);
});

test("manual financial registration truncates long selected form titles", () => {
  const source = readFileSync(
    new URL("../components/admin/forms/ManualFinancialRegistrationForm.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /SelectTrigger className="[^"]*w-full[^"]*min-w-0[^"]*overflow-hidden/);
  assert.match(source, /SelectContent className="[^"]*max-w-\[calc\(100vw-3rem\)\]/);
  assert.match(source, /SelectItem[^>]*className="[^"]*truncate/);
});
