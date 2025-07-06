'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData) {
  const supabase = await createClient();

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: 'Correo o contraseña inválidos.' };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: 'Credenciales incorrectas o error del servidor.' };
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin', 'layout')
  redirect('/admin')
}

// export async function signup(formData: FormData) {
//   const supabase = await createClient()

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const data = {
//     email: formData.get('email') as string,
//     password: formData.get('password') as string,
//   }

//   const { error } = await supabase.auth.signUp(data)

//   if (error) {
//     redirect('/error')
//   }

//   revalidatePath('/', 'layout')
//   revalidatePath('/admin', 'layout')
//   redirect('/admin')
// }
