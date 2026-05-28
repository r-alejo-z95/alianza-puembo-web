import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  normalizeReminderInterval,
  getPaymentReminderBaseDate,
  isPaymentReminderDue,
} from "../lib/finance/payment-reminders.mjs";

test("normalizeReminderInterval allows only approved cadence values", () => {
  assert.equal(normalizeReminderInterval(null), null);
  assert.equal(normalizeReminderInterval(undefined), null);
  assert.equal(normalizeReminderInterval(3), 3);
  assert.equal(normalizeReminderInterval("7"), 7);
  assert.equal(normalizeReminderInterval(14), 14);
  assert.equal(normalizeReminderInterval(30), 30);
  assert.equal(normalizeReminderInterval(1), null);
  assert.equal(normalizeReminderInterval(60), null);
});

test("getPaymentReminderBaseDate uses the latest submission, payment, or reminder date", () => {
  const base = getPaymentReminderBaseDate({
    submission: {
      created_at: "2026-05-01T10:00:00.000Z",
      payment_reminder_last_sent_at: "2026-05-04T10:00:00.000Z",
    },
    lastPaymentCreatedAt: "2026-05-03T10:00:00.000Z",
  });

  assert.equal(base, "2026-05-04T10:00:00.000Z");
});

test("isPaymentReminderDue respects cadence and recent uploaded payments", () => {
  assert.equal(
    isPaymentReminderDue({
      now: "2026-05-10T10:00:00.000Z",
      intervalDays: 7,
      submission: { created_at: "2026-05-01T10:00:00.000Z" },
      lastPaymentCreatedAt: null,
    }),
    true,
  );

  assert.equal(
    isPaymentReminderDue({
      now: "2026-05-10T10:00:00.000Z",
      intervalDays: 7,
      submission: { created_at: "2026-05-01T10:00:00.000Z" },
      lastPaymentCreatedAt: "2026-05-08T10:00:00.000Z",
    }),
    false,
  );
});

test("payment reminder cron route exists and checks CRON_SECRET", () => {
  const routeUrl = new URL("../app/api/cron/payment-reminders/route.ts", import.meta.url);
  assert.equal(existsSync(routeUrl), true);

  const route = readFileSync(routeUrl, "utf8");
  assert.match(route, /CRON_SECRET/);
  assert.match(route, /getSubmissionBalanceSummary/);
  assert.match(route, /sendPaymentReminderEmail/);
});

test("vercel cron is configured for daily payment reminders", () => {
  const vercelConfigUrl = new URL("../vercel.json", import.meta.url);
  assert.equal(existsSync(vercelConfigUrl), true);

  const config = JSON.parse(readFileSync(vercelConfigUrl, "utf8"));
  assert.ok(
    config.crons.some(
      (cron) =>
        cron.path === "/api/cron/payment-reminders" &&
        cron.schedule === "0 13 * * *",
    ),
  );
});

test("notification service exposes payment reminder email sender", () => {
  const notifications = readFileSync(
    new URL("../lib/services/notifications.ts", import.meta.url),
    "utf8",
  );

  assert.match(notifications, /sendPaymentReminderEmail/);
  assert.match(notifications, /Recordatorio de pago/);
  assert.match(notifications, /remainingBalance/);
});
