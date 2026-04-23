import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("forms admin page no longer imports or renders the landing notice dialog", () => {
  const pageSource = readFileSync(new URL("../app/admin/formularios/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(pageSource, /FormLandingNoticeDialog/);
});
