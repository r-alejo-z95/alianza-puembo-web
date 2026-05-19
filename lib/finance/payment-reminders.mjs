export const PAYMENT_REMINDER_INTERVAL_DAYS = [3, 7, 14, 30];

function normalizeIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function latestIsoDate(values) {
  const dates = values
    .map(normalizeIsoDate)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return dates[0] || null;
}

export function normalizeReminderInterval(value) {
  if (value === null || value === undefined || value === "") return null;
  const interval = Number(value);
  return PAYMENT_REMINDER_INTERVAL_DAYS.includes(interval) ? interval : null;
}

export function getPaymentReminderBaseDate({
  submission = {},
  lastPaymentCreatedAt = null,
} = {}) {
  return latestIsoDate([
    submission?.created_at,
    lastPaymentCreatedAt,
    submission?.payment_reminder_last_sent_at,
  ]);
}

export function isPaymentReminderDue({
  now = new Date(),
  intervalDays = null,
  submission = {},
  lastPaymentCreatedAt = null,
} = {}) {
  const interval = normalizeReminderInterval(intervalDays);
  if (!interval) return false;

  const base = getPaymentReminderBaseDate({ submission, lastPaymentCreatedAt });
  if (!base) return false;

  const nowDate = new Date(now);
  const dueDate = new Date(base);
  dueDate.setUTCDate(dueDate.getUTCDate() + interval);

  return nowDate.getTime() >= dueDate.getTime();
}
