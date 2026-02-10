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
  description?: string;
  image_url?: string;
  is_internal: boolean;
  is_archived: boolean;
  enabled: boolean;
  google_sheet_id?: string;
  created_at: string;
  user_id: string;
  form_fields?: FormField[];
}

/**
 * @description Cached fetch of all active forms.
 */
export const getCachedForms = unstable_cache(
  async (isInternal: boolean | null = null) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("forms")
      .select("*, profiles(full_name, email), form_fields(*)")
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
        .select("*, profiles(full_name, email), form_fields(*)")
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

export interface FormSubmission {
  id: string;
  form_id: string;
  data: any; // JSONb
  created_at: string;
  user_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
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
        .select("*, profiles(*)") // Fetch all profile data to match original query
        .eq("form_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`Error fetching cached submissions for form ${id}:`, error);
        return [];
      }

      return data as FormSubmission[];
    },
    [`form-submissions-${formId}`],
    {
      tags: ['form-submissions', `form-submissions-${formId}`],
      revalidate: 3600
    }
  );

  return fetchSubmissions(formId);
};
