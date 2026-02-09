'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateEvents() {
  revalidateTag('events');
}

export async function revalidateNews() {
  revalidateTag('news');
}

export async function revalidateLom() {
  revalidateTag('lom');
}

export async function revalidatePrayer() {
  revalidateTag('prayer');
}

export async function revalidateForms() {
  revalidateTag('forms');
}

export async function revalidateProfiles() {
  revalidateTag('profiles');
}

export async function revalidateSettings() {
  revalidateTag('settings');
}
