import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("lom data layer exposes a server-side view increment helper", () => {
  const source = readFileSync(new URL("../lib/data/lom.ts", import.meta.url), "utf8");

  assert.match(
    source,
    /export async function incrementLomPostView\(slug: string\): Promise<number \| null>/,
  );
  assert.match(source, /createAdminClient\(\)/);
  assert.match(source, /\.rpc\("increment_lom_post_view", \{ post_slug: slug \}\)/);
  assert.match(source, /Error incrementing LOM post view/);
  assert.match(source, /typeof data === "number" \? data : null/);
});

test("public lom page increments and displays view count", () => {
  const source = readFileSync(
    new URL("../app/recursos/lom/[slug]/page.js", import.meta.url),
    "utf8",
  );

  assert.match(source, /export const dynamic = "force-dynamic"/);
  assert.match(source, /incrementLomPostView/);
  assert.match(source, /const incrementedViewCount = await incrementLomPostView\(slug\)/);
  assert.match(
    source,
    /const viewCount = typeof incrementedViewCount === "number" \? incrementedViewCount : post\.view_count \?\? 0/,
  );
  assert.match(source, /new Intl\.NumberFormat\("es-EC"\)\.format\(viewCount\)/);
  assert.match(source, /viewCount === 1 \? "lectura" : "lecturas"/);
});

test("public lom page links Bible references after WhatsApp formatting", () => {
  const source = readFileSync(
    new URL("../app/recursos/lom/[slug]/page.js", import.meta.url),
    "utf8",
  );

  assert.match(source, /parseWhatsAppFormatting, linkBibleReferences/);
  assert.match(source, /linkBibleReferences\(parseWhatsAppFormatting\(post\.content\)\)/);
});
