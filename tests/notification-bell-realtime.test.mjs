import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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

test("notification bell authenticates realtime before subscribing to postgres changes", () => {
  const source = readFileSync(
    new URL("../components/admin/layout/NotificationBell.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /auth\.getSession\(\)/);
  assert.match(source, /realtime\.setAuth\(session\.access_token\)/);
});
