import type { Form } from "@/lib/data/forms";

export function isFormSetupComplete(form?: Partial<Form> | null): boolean {
  if (!form) return false;
  if (!form.title || form.max_responses == null || form.is_financial == null) return false;
  if (!form.is_financial) return true;

  const hasBaseFinancialSetup =
    !!form.payment_type &&
    form.total_amount != null &&
    !!form.destination_account_id;

  if (!hasBaseFinancialSetup) return false;

  if (form.payment_type === "installments") {
    return form.max_installments != null;
  }

  return true;
}
