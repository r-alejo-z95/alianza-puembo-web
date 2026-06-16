import { createAdminClient, createStaticClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export interface FormField {
  id: string;
  form_id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // JSON array in DB, usually string[]
  order_index?: number;
  attachment_url?: string;
  description?: string;
}

export interface Form {
  id: string;
  title: string;
  slug: string;
  short_code?: string | null;
  description?: string;
  image_url?: string;
  is_internal: boolean;
  is_archived: boolean;
  enabled: boolean;
  google_sheet_id?: string;
  google_sheet_url?: string;
  last_synced_at?: string;
  max_responses?: number | null;
  is_financial?: boolean;
  payment_type?: "single" | "installments" | null;
  max_installments?: number | null;
  total_amount?: number | string | null;
  pricing_mode?: "fixed" | "packages";
  pricing_packages?: Array<{
    id: string;
    label: string;
    amount: number;
    participant_count?: number | null;
    enabled?: boolean;
  }> | null;
  pricing_field_id?: string | null;
  collect_participant_details?: boolean;
  participant_template?: Array<{
    id: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string | null;
  }> | null;
  allow_shared_receipts?: boolean;
  shared_receipt_max_submissions?: number;
  destination_account_id?: string | null;
  payment_reminder_interval_days?: number | null;
  financial_field_label?: string | null;
  financial_field_id?: string | null;
  created_at: string;
  user_id: string;
  form_fields?: FormField[];
  form_response_admins?: Array<{
    profile_id: string;
    created_at?: string;
    created_by?: string | null;
    profiles?: {
      id?: string;
      full_name?: string | null;
      email?: string | null;
    } | null;
  }>;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  account_type: string;
  ruc?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * @description Cached fetch of all active forms.
 */
export const getCachedForms = unstable_cache(
  async (isInternal: boolean | null = null) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("forms")
      .select("*, profiles:profiles!forms_user_id_fkey(full_name, email), form_fields!form_id(*)")
      .eq("is_archived", false);

    if (isInternal !== null) {
      query = query.eq("is_internal", isInternal);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cached forms:", error);
      return [];
    }

    // Sort fields for each form
    const sortedData = (data as Form[]).map(form => {
      if (form.form_fields) {
        form.form_fields.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      }
      return form;
    });

    return sortedData;
  },
  ['forms-list'],
  {
    tags: ['forms'],
    revalidate: 3600
  }
);

/**
 * @description Cached fetch of a single form by slug, including its fields.
 * Revalidate using revalidateTag('forms') (or specific tag if implemented).
 */
export async function getFormBySlug(slug: string): Promise<Form | null> {
  const fetchForm = unstable_cache(
    async (s: string) => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("forms")
        .select("*, profiles:profiles!forms_user_id_fkey(full_name, email), form_fields!form_id(*)")
        .eq("slug", s)
        .eq("is_archived", false)
        .single();

      if (error) {
        // It's common to not find it, so we just return null
        return null;
      }
      
      // Sort fields here to ensure consistency in cache
      if (data.form_fields) {
        data.form_fields.sort((a: FormField, b: FormField) => (a.order_index ?? 0) - (b.order_index ?? 0));
      }

      return data as Form;
    },
    [`form-by-slug-${slug}`],
    {
      tags: ['forms', `form-${slug}`],
      revalidate: 3600 // 1 hour
    }
  );

  return fetchForm(slug);
}

export async function getFormByShortCode(
  shortCode: string,
): Promise<Pick<Form, "id" | "slug" | "short_code" | "is_internal" | "is_archived"> | null> {
  const normalizedShortCode = String(shortCode || "").trim().toLowerCase();
  if (!normalizedShortCode) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("forms")
    .select("id, slug, short_code, is_internal, is_archived")
    .eq("short_code", normalizedShortCode)
    .eq("is_archived", false)
    .maybeSingle();

  if (error || !data?.slug) return null;

  return data as Pick<Form, "id" | "slug" | "short_code" | "is_internal" | "is_archived">;
}

function sortFormFields<T extends { form_fields?: FormField[] | null }>(form: T): T {
  if (form?.form_fields) {
    form.form_fields.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }
  return form;
}

async function attachFormResponseAdmins(supabase: any, forms: Form[]): Promise<Form[]> {
  const formIds = forms.map((form) => form.id).filter(Boolean);
  if (formIds.length === 0) return forms;

  const { data, error } = await supabase
    .from("form_response_admins")
    .select("form_id, profile_id, created_at, created_by")
    .in("form_id", formIds);

  if (error) {
    console.error("[attachFormResponseAdmins]", error);
    return forms.map((form) => ({ ...form, form_response_admins: [] }));
  }

  const rowsByFormId = new Map<string, any[]>();
  (data ?? []).forEach((row: any) => {
    if (!rowsByFormId.has(row.form_id)) rowsByFormId.set(row.form_id, []);
    rowsByFormId.get(row.form_id)?.push(row);
  });

  return forms.map((form) => ({
    ...form,
    form_response_admins: rowsByFormId.get(form.id) ?? [],
  }));
}

export async function getAdminFormBySlugForAnalytics(slug: string): Promise<Form | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("forms")
    .select("*, profiles:profiles!forms_user_id_fkey(full_name, email), form_fields!form_id(*)")
    .eq("slug", slug)
    .eq("is_archived", false)
    .maybeSingle();

  if (error || !data) return null;
  const [form] = await attachFormResponseAdmins(supabase, [sortFormFields(data as Form)]);
  return form ?? null;
}

export async function getUserHasFormResponseDelegations(userId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_response_admins")
    .select("form_id")
    .eq("profile_id", userId)
    .limit(1);

  if (error) {
    console.error("[getUserHasFormResponseDelegations]", error);
    return false;
  }

  return (data ?? []).length > 0;
}

export async function getDelegatedPublicFormsForUser(userId: string): Promise<Form[]> {
  if (!userId) return [];
  const supabase = createAdminClient();
  const { data: accessRows, error: accessError } = await supabase
    .from("form_response_admins")
    .select("form_id")
    .eq("profile_id", userId);

  if (accessError) {
    console.error("[getDelegatedPublicFormsForUser] access lookup failed:", accessError);
    return [];
  }

  const formIds = [...new Set((accessRows ?? []).map((row: any) => row.form_id).filter(Boolean))];
  if (formIds.length === 0) return [];

  const { data: forms, error: formsError } = await supabase
    .from("forms")
    .select("*, profiles:profiles!forms_user_id_fkey(full_name, email), form_fields!form_id(*)")
    .in("id", formIds)
    .eq("is_archived", false)
    .eq("is_internal", false);

  if (formsError) {
    console.error("[getDelegatedPublicFormsForUser] forms lookup failed:", formsError);
    return [];
  }

  const formsWithAdmins = await attachFormResponseAdmins(
    supabase,
    (forms ?? [])
      .filter(Boolean)
      .map((form: Form) => sortFormFields(form)),
  );

  return formsWithAdmins
    .sort((a: Form, b: Form) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
}

export interface FormSubmission {
  id: string;
  form_id: string;
  data: any; // JSONb
  answers?: any[];
  created_at: string;
  user_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  access_token?: string;
  notification_email?: string;
  is_archived?: boolean;
  archived_at?: string | null;
  form_submission_admin_comments?: Array<{
    id: string;
    submission_id: string;
    body: string;
    created_by?: string | null;
    created_at: string;
    updated_at: string;
    profiles?: {
      full_name?: string | null;
      email?: string | null;
    } | null;
  }>;
  is_manual?: boolean;
  coverage_mode?: "bank_receipt" | "cash" | "card" | "scholarship" | "covered_by_used_payment" | null;
  coverage_amount?: number | null;
  coverage_created_at?: string | null;
  coverage_created_by?: string | null;
  coverage_backup_path?: string | null;
  covered_by_submission_id?: string | null;
  expected_amount?: number | null;
  pricing_snapshot?: Record<string, any> | null;
  participant_details?: Array<Record<string, any>> | null;
  payment_group_id?: string | null;
  payment_reminder_last_sent_at?: string | null;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  forms?: Form;
  form_submission_payments?: Array<{
    id: string;
    submission_id: string;
    bank_transaction_id?: string | null;
    receipt_path?: string | null;
    amount_claimed?: number | null;
    payment_group_id?: string | null;
    status?: string | null;
    reconciliation_notes?: string | null;
    extracted_data?: Record<string, any> | null;
    created_at?: string | null;
    manual_disposition?: "incorrecto" | "duplicado" | null;
    manual_disposition_at?: string | null;
    manual_disposition_by?: string | null;
    manual_disposition_notes?: string | null;
  }>;
  payment_groups?: {
    id: string;
    expected_amount?: number | null;
    calculated_expected_amount?: number | null;
    expected_amount_source?: "calculated" | "manual" | null;
    form_id?: string | null;
    created_by_submission_id?: string | null;
    notes?: string | null;
  } | null;
  payment_group?: {
    id: string;
    expected_amount?: number | null;
    calculated_expected_amount?: number | null;
    expected_amount_source?: "calculated" | "manual" | null;
    form_id?: string | null;
    created_by_submission_id?: string | null;
    notes?: string | null;
    form_submission_payments?: any[];
  } | null;
}

/**
 * @description Obtiene una sumisión por su access_token secreto.
 * No usamos caché agresiva aquí porque el usuario querrá ver sus cambios de estado inmediatamente.
 */
export async function getSubmissionByToken(token: string): Promise<FormSubmission | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*, forms(*), form_submission_payments(*), payment_groups!form_submissions_payment_group_id_fkey(*)")
    .eq("access_token", token)
    .eq("is_archived", false)
    .single();

  if (error || !data) {
    return null;
  }

  if (data.payment_group_id) {
    const { data: groupPayments, error: groupPaymentsError } = await supabase
      .from("form_submission_payments")
      .select("*")
      .eq("payment_group_id", data.payment_group_id)
      .order("created_at", { ascending: true });

    if (groupPaymentsError) {
      console.error("[getSubmissionByToken] payment group payments lookup failed:", groupPaymentsError);
    }

    data.payment_group = {
      ...(data.payment_groups || {}),
      id: data.payment_group_id,
      form_submission_payments: groupPayments || [],
    };
  }

  return data as FormSubmission;
}

/**
 * @description Cached fetch of all submissions for a specific form.
 * Revalidate using revalidateTag('form-submissions') or revalidateTag(`form-submissions-${formId}`).
 */
export const getCachedFormSubmissions = async (formId: string) => {
  const fetchSubmissions = unstable_cache(
    async (id: string) => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*, profiles:profiles!form_submissions_user_id_fkey(*), form_submission_payments(*), payment_groups!form_submissions_payment_group_id_fkey(*), form_submission_admin_comments(*, profiles:profiles!form_submission_admin_comments_created_by_fkey(full_name, email))")
        .eq("form_id", id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`Error fetching cached submissions for form ${id}:`, error);
        return [];
      }

      return (data ?? []).map((submission: any) => ({
        ...submission,
        form_submission_admin_comments: [
          ...(submission.form_submission_admin_comments ?? []),
        ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      })) as FormSubmission[];
    },
    [`form-submissions-${formId}`],
    {
      tags: ['form-submissions', `form-submissions-${formId}`],
      revalidate: 3600
    }
  );

  return fetchSubmissions(formId);
};

/**
 * @description Obtiene todas las sumisiones de formularios financieros activos.
 * Utilizado por administradores para búsqueda global de inscripciones que requieren pago.
 */
export async function getAllSubmissions() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*, forms!inner(*), profiles:profiles!form_submissions_user_id_fkey(*), form_submission_payments(*), payment_groups!form_submissions_payment_group_id_fkey(*), form_submission_admin_comments(*, profiles:profiles!form_submission_admin_comments_created_by_fkey(full_name, email))")
    .eq("is_archived", false)
    .eq("forms.is_internal", false)
    .eq("forms.is_financial", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all submissions:", error);
    return [];
  }

  return (data ?? []).map((submission: any) => ({
    ...submission,
    form_submission_admin_comments: [
      ...(submission.form_submission_admin_comments ?? []),
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  })) as FormSubmission[];
}

export async function getFormEmailCampaigns(formId: string) {
  if (!formId) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_email_campaigns")
    .select(`
      *,
      form_email_campaign_attachments(*),
      form_email_campaign_exclusions(*),
      form_email_delivery_events(*)
    `)
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getFormEmailCampaigns]", error);
    return [];
  }

  return data ?? [];
}
