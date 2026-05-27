import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("form response admin delegation migration creates join table with RLS", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/20260527000000_add_form_response_admins.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /create table if not exists public\.form_response_admins/);
  assert.match(migration, /form_id uuid not null references public\.forms\(id\) on delete cascade/);
  assert.match(migration, /profile_id uuid not null references public\.profiles\(id\) on delete cascade/);
  assert.match(migration, /primary key \(form_id, profile_id\)/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /"Delegated admins can read own form response access"/);
  assert.match(migration, /"Super admins can manage form response access"/);
});

test("database types include form_response_admins", () => {
  const types = readFileSync(new URL("../lib/database.types.ts", import.meta.url), "utf8");

  assert.match(types, /form_response_admins: \{/);
  assert.match(types, /form_id: string/);
  assert.match(types, /profile_id: string/);
  assert.match(types, /form_response_admins_form_id_fkey/);
  assert.match(types, /form_response_admins_profile_id_fkey/);
});

test("admin form data helpers fetch delegated forms without widening public form queries", () => {
  const formsData = readFileSync(new URL("../lib/data/forms.ts", import.meta.url), "utf8");

  assert.match(formsData, /getAdminFormBySlugForAnalytics/);
  assert.match(formsData, /getDelegatedPublicFormsForUser/);
  assert.match(formsData, /getUserHasFormResponseDelegations/);
  assert.match(formsData, /attachFormResponseAdmins/);
  assert.match(formsData, /\.from\("form_response_admins"\)/);
  assert.doesNotMatch(formsData, /form_response_admins\(/);
  const publicFunctionStart = formsData.indexOf("export async function getFormBySlug");
  const publicFunctionEnd = formsData.indexOf("function sortFormFields");
  const publicFormQuery = formsData.slice(
    publicFunctionStart,
    publicFunctionEnd === -1 ? formsData.length : publicFunctionEnd,
  );
  assert.doesNotMatch(publicFormQuery, /form_response_admins/);
});

test("form response access preferences use super-admin-only server actions", () => {
  const actions = readFileSync(new URL("../lib/actions/form-response-admins.ts", import.meta.url), "utf8");

  assert.match(actions, /"use server"/);
  assert.match(actions, /getFormResponseAdminPreferences/);
  assert.match(actions, /grantFormResponseAdmin/);
  assert.match(actions, /revokeFormResponseAdmin/);
  assert.match(actions, /verifySuperAdmin/);
  assert.match(actions, /\.from\("form_response_admins"\)/);
  assert.doesNotMatch(actions, /form_response_admins\(/);
  assert.match(actions, /revalidatePath\("\/admin\/preferencias"\)/);
});

test("form queries disambiguate creator profile after delegated profile relationship", () => {
  const files = [
    "../lib/data/forms.ts",
    "../lib/hooks/useForms.js",
    "../lib/actions/form-response-admins.ts",
  ];

  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /profiles\(full_name, email\)/, file);
    assert.match(source, /profiles:profiles!forms_user_id_fkey\(full_name, email\)/, file);
  }
});

test("navigation exposes forms entry to delegated-only admins", () => {
  const sessionUser = readFileSync(new URL("../lib/auth/getSessionUser.ts", import.meta.url), "utf8");
  const sidebar = readFileSync(new URL("../components/admin/layout/AdminSidebar.jsx", import.meta.url), "utf8");
  const bottomNav = readFileSync(new URL("../components/admin/layout/AdminBottomNav.jsx", import.meta.url), "utf8");
  const adminHome = readFileSync(new URL("../app/admin/page.js", import.meta.url), "utf8");

  assert.match(sessionUser, /has_form_response_delegations/);
  assert.match(sessionUser, /getUserHasFormResponseDelegations/);
  assert.match(sidebar, /hasFormsNavigationAccess/);
  assert.match(bottomNav, /hasFormsNavigationAccess/);
  assert.match(adminHome, /hasFormsNavigationAccess/);
});

test("forms page renders a limited analytics list for delegated-only admins", () => {
  const page = readFileSync(new URL("../app/admin/formularios/page.js", import.meta.url), "utf8");
  const list = readFileSync(new URL("../components/admin/managers/DelegatedFormAnalyticsList.jsx", import.meta.url), "utf8");

  assert.match(page, /getSessionUser/);
  assert.match(page, /getDelegatedPublicFormsForUser/);
  assert.match(page, /DelegatedFormAnalyticsList/);
  assert.doesNotMatch(page, /await verifyPermission\("perm_forms"\)/);
  assert.match(list, /\/admin\/formularios\/analiticas\/\$\{form\.slug\}/);
  assert.doesNotMatch(list, /Crear Formulario/);
  assert.doesNotMatch(list, /Papelera/);
  assert.doesNotMatch(list, /archiveForm/);
});

test("site preferences include form response access manager", () => {
  const manager = readFileSync(new URL("../components/admin/preferencias/FormResponseAccessManager.jsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/admin/preferencias/page.js", import.meta.url), "utf8");

  assert.match(manager, /getFormResponseAdminPreferences/);
  assert.match(manager, /grantFormResponseAdmin/);
  assert.match(manager, /revokeFormResponseAdmin/);
  assert.match(manager, /Acceso a analíticas por formulario/);
  assert.match(manager, /Creador/);
  assert.match(page, /FormResponseAccessManager/);
  assert.match(page, /<FormResponseAccessManager \/>/);
});
