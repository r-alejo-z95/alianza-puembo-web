'use server';

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
    revalidatePath(`/admin/formularios/analiticas/${formId}`);
    revalidatePath(`/admin/staff/respuestas/${formId}`);
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
