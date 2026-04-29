import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

test("notification bell subscribes to realtime, refreshes on incoming rows, and plays a sound", () => {
  const source = readFileSync(
    new URL("../components/admin/layout/NotificationBell.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /postgres_changes/);
  assert.match(source, /fetchNotifications\(\);/);
  assert.match(source, /AudioContext|webkitAudioContext|new Audio/);
  assert.match(source, /playNotificationSound/);
});

test("notifications table is included in the Supabase realtime publication", () => {
  const migrationsDir = new URL("../supabase/migrations", import.meta.url);
  const migrationSources = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => readFileSync(join(migrationsDir.pathname, file), "utf8"))
    .join("\n");

  assert.match(
    migrationSources,
    /alter\s+publication\s+supabase_realtime\s+add\s+table\s+public\.notifications/i,
  );
});
