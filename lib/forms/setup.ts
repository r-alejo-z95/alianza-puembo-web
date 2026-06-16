import type { Form } from "@/lib/data/forms";
import { validatePricingConfiguration } from "@/lib/finance/pricing-packages.mjs";

export function isFormSetupComplete(form?: Partial<Form> | null): boolean {
  if (!form) return false;
  if (!form.title || form.max_responses == null || form.is_financial == null) return false;
  if (!form.is_financial) return true;

  const pricingMode = form.pricing_mode === "packages" ? "packages" : "fixed";
  const pricing = validatePricingConfiguration({
    pricing_mode: pricingMode,
    total_amount: form.total_amount,
    pricing_packages: form.pricing_packages,
    collect_participant_details: form.collect_participant_details,
    participant_template: form.participant_template,
  });

  const hasBaseFinancialSetup =
    !!form.payment_type &&
    pricing.valid &&
    !!form.destination_account_id;

  if (!hasBaseFinancialSetup) return false;

  if (form.payment_type === "installments") {
    return form.max_installments != null;
  }

  return true;
}
