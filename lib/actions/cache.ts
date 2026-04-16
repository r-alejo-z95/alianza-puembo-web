'use server';

import { createAdminClient } from "@/lib/supabase/server";
import { revalidateTag, revalidatePath } from 'next/cache';

export async function revalidateEvents() {
  revalidateTag('events');
  revalidatePath('/admin/eventos');
  revalidatePath('/eventos', 'layout');
  revalidatePath('/');
}

export async function revalidateNews() {
  revalidateTag('news');
  revalidatePath('/admin/noticias');
  revalidatePath('/noticias', 'layout');
  revalidatePath('/');
}

export async function revalidateLom() {
  revalidateTag('lom');
  revalidatePath('/admin/lom');
  revalidatePath('/recursos/lom', 'layout');
  revalidatePath('/');
}

export async function revalidatePrayer() {
  revalidateTag('prayer');
  revalidatePath('/admin/comunidad');
  revalidatePath('/oracion', 'layout');
}

export async function revalidateForms() {
  revalidateTag('forms');
  revalidatePath('/admin/formularios');
  revalidatePath('/admin/staff');
  revalidatePath('/formularios', 'layout');
}

export async function revalidateFormSubmissions(formId?: string) {
  revalidateTag('form-submissions');
  if (formId) {
    revalidateTag(`form-submissions-${formId}`);
    const supabase = createAdminClient();
    const { data: form } = await supabase
      .from("forms")
      .select("slug")
      .eq("id", formId)
      .single();

    if (form?.slug) {
      revalidatePath(`/admin/formularios/analiticas/${form.slug}`);
      revalidatePath(`/admin/staff/respuestas/${form.slug}`);
    }
  }
  revalidatePath('/admin/formularios');
}

export async function revalidateProfiles() {
  revalidateTag('profiles');
  revalidatePath('/admin/staff');
}

export async function revalidateSettings() {
  revalidateTag('settings');
  revalidatePath('/admin/preferencias');
  revalidatePath('/', 'layout');
}
