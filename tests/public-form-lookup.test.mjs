import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as lookupEmail from "../lib/forms/submission-lookup-email.mjs";

const { buildSubmissionLookupEmail, escapeLookupEmailHtml } = lookupEmail;

test("non-financial lookup confirms every matching registration without tracking links", () => {
  const email = buildSubmissionLookupEmail({
    form: {
      title: "Bautizos",
      slug: "bautizos",
      enabled: true,
      is_financial: false,
    },
    submissions: [
      { created_at: "2026-07-01T12:00:00Z", access_token: "secret-one" },
      { created_at: "2026-07-02T12:00:00Z", access_token: "secret-two" },
    ],
    siteUrl: "https://alianzapuembo.org",
  });

  assert.equal(email.found, true);
  assert.equal(email.entries.length, 2);
  assert.equal(
    email.entries.every((entry) => entry.trackingUrl === null),
    true,
  );
  assert.equal(email.cta, null);
});

test("financial lookup includes one private tracking link per registration", () => {
  const email = buildSubmissionLookupEmail({
    form: {
      title: "Retiro",
      slug: "retiro",
      enabled: false,
      is_financial: true,
    },
    submissions: [
      {
        created_at: "2026-07-01T12:00:00Z",
        access_token: "secret-token",
      },
    ],
    siteUrl: "https://alianzapuembo.org/",
  });

  assert.equal(
    email.entries[0].trackingUrl,
    "https://alianzapuembo.org/inscripcion/secret-token",
  );
});

test("not-found lookup only offers registration while the form is open", () => {
  const open = buildSubmissionLookupEmail({
    form: {
      title: "Taller",
      slug: "taller",
      enabled: true,
      is_financial: false,
    },
    submissions: [],
    siteUrl: "https://alianzapuembo.org",
  });
  const closed = buildSubmissionLookupEmail({
    form: {
      title: "Taller",
      slug: "taller",
      enabled: false,
      is_financial: false,
    },
    submissions: [],
    siteUrl: "https://alianzapuembo.org",
  });

  assert.deepEqual(open.cta, {
    label: "Inscribirme",
    url: "https://alianzapuembo.org/formularios/taller",
  });
  assert.equal(closed.cta, null);
});

test("email HTML escaping covers text and attribute delimiters", () => {
  assert.equal(
    escapeLookupEmailHtml('Retiro <script>alert("x")</script> & más'),
    "Retiro &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; más",
  );
});

test("exact email lookup escapes PostgreSQL ILIKE wildcards", () => {
  assert.equal(typeof lookupEmail.escapeEmailLookupPattern, "function");
  assert.equal(
    lookupEmail.escapeEmailLookupPattern("ana_test%\\@mail.com"),
    "ana\\_test\\%\\\\@mail.com",
  );
});

test("lookup action requires an exact published form and never returns match data", () => {
  const source = readFileSync(
    new URL("../lib/actions/public-form-lookup.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /verifyTurnstileToken/);
  assert.match(source, /\.eq\("id", parsed\.data\.formId\)/);
  assert.match(source, /\.eq\("is_publicly_listed", true\)/);
  assert.match(source, /\.eq\("form_id", form\.id\)/);
  assert.match(
    source,
    /\.ilike\(\s*"notification_email",\s*escapeEmailLookupPattern\(parsed\.data\.email\)/,
  );
  assert.match(source, /\.eq\("is_archived", false\)/);
  assert.match(source, /\.neq\("submission_status", "cancelled"\)/);
  assert.doesNotMatch(source, /return \{[^}]*found/);
});

test("Turnstile verification is shared by existing and exact lookup actions", () => {
  const security = readFileSync(
    new URL("../lib/security/turnstile.ts", import.meta.url),
    "utf8",
  );
  const existingActions = readFileSync(
    new URL("../lib/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(security, /import "server-only"/);
  assert.match(security, /export async function verifyTurnstileToken/);
  assert.match(
    existingActions,
    /import \{ verifyTurnstileToken \} from "@\/lib\/security\/turnstile"/,
  );
  assert.doesNotMatch(
    existingActions,
    /async function verifyTurnstileToken/,
  );
});

test("lookup email service brands and escapes every delivered result", () => {
  const source = readFileSync(
    new URL("../lib/services/form-lookup-emails.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /buildSubmissionLookupEmail/);
  assert.match(source, /escapeLookupEmailHtml/);
  assert.match(source, /wrapFormEmailHtml/);
  assert.match(source, /Abrir seguimiento/);
  assert.match(
    source,
    /Iglesia Alianza Puembo <notificaciones@alianzapuembo\.org>/,
  );
});
