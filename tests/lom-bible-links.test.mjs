import test from "node:test";
import assert from "node:assert/strict";
import { getBibleLink, linkBibleReferences } from "../lib/lomBibleLinks.mjs";

test("builds Bible.com NTV links for accented and non-accented references", () => {
  assert.equal(
    getBibleLink("Josué 4 - 6"),
    "https://www.bible.com/bible/127/JOS.4.NTV",
  );
  assert.equal(
    getBibleLink("Josue 4-6"),
    "https://www.bible.com/bible/127/JOS.4.NTV",
  );
  assert.equal(
    getBibleLink("Josué: 4 al 6"),
    "https://www.bible.com/bible/127/JOS.4.NTV",
  );
  assert.equal(
    getBibleLink("Juan 3:16"),
    "https://www.bible.com/bible/127/JHN.3.16.NTV",
  );
  assert.equal(
    getBibleLink("1 Corintios 13:4-7"),
    "https://www.bible.com/bible/127/1CO.13.4.NTV",
  );
});

test("falls back to Bible.com search for unsupported references", () => {
  assert.equal(
    getBibleLink("Libro Inventado 1"),
    "https://www.bible.com/search/bible?q=Libro%20Inventado%201",
  );
});

test("links Bible references inside text nodes and preserves displayed text", () => {
  const html = "<p>Lee Josué 4 - 6 y medita en Juan 3:16.</p>";
  const linked = linkBibleReferences(html);

  assert.match(
    linked,
    /<a href="https:\/\/www\.bible\.com\/bible\/127\/JOS\.4\.NTV" target="_blank" rel="noopener noreferrer">Josué 4 - 6<\/a>/,
  );
  assert.match(
    linked,
    /<a href="https:\/\/www\.bible\.com\/bible\/127\/JHN\.3\.16\.NTV" target="_blank" rel="noopener noreferrer">Juan 3:16<\/a>/,
  );
});

test("supports al ranges and numbered books", () => {
  const html = "<p>Hoy leemos Josué: 4 al 6 y 1 Corintios 13:4-7.</p>";
  const linked = linkBibleReferences(html);

  assert.match(
    linked,
    /<a href="https:\/\/www\.bible\.com\/bible\/127\/JOS\.4\.NTV" target="_blank" rel="noopener noreferrer">Josué: 4 al 6<\/a>/,
  );
  assert.match(
    linked,
    /<a href="https:\/\/www\.bible\.com\/bible\/127\/1CO\.13\.4\.NTV" target="_blank" rel="noopener noreferrer">1 Corintios 13:4-7<\/a>/,
  );
});

test("does not rewrite existing anchors or HTML attributes", () => {
  const html =
    '<p data-ref="Josué 4">Lee <a href="https://example.com">Juan 3:16</a> y Romanos 8:28.</p>';
  const linked = linkBibleReferences(html);

  assert.match(linked, /data-ref="Josué 4"/);
  assert.match(linked, /<a href="https:\/\/example\.com">Juan 3:16<\/a>/);
  assert.match(
    linked,
    /<a href="https:\/\/www\.bible\.com\/bible\/127\/ROM\.8\.28\.NTV" target="_blank" rel="noopener noreferrer">Romanos 8:28<\/a>/,
  );
  assert.equal((linked.match(/<a /g) || []).length, 2);
});
