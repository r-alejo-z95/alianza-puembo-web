import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("admin profile updates sync public profiles and auth metadata through server actions", () => {
  const actions = fs.readFileSync("lib/actions/admin-profiles.ts", "utf8");
  const hook = fs.readFileSync("lib/hooks/useAdminProfiles.js", "utf8");
  const preferencesPage = fs.readFileSync("app/admin/preferencias/page.js", "utf8");

  assert.match(actions, /"use server"/);
  assert.match(actions, /updateOwnAdminProfile/);
  assert.match(actions, /updateTeamProfileField/);
  assert.match(actions, /\.from\("profiles"\)[\s\S]*\.update\(\{ full_name:/);
  assert.match(actions, /auth\.admin\.updateUserById\([\s\S]*user_metadata:/);
  assert.match(actions, /is_super_admin/);
  assert.match(actions, /typeof value !== "boolean"/);

  assert.match(hook, /updateTeamProfileField/);
  assert.doesNotMatch(hook, /\.from\("profiles"\)\s*[\s\S]{0,120}\.update\(\{ \[field\]: value \}\)/);
  assert.match(preferencesPage, /updateOwnAdminProfile/);
  assert.doesNotMatch(preferencesPage, /\.from\('profiles'\)\.update\(\{ full_name: data\.full_name \}\)/);
});
