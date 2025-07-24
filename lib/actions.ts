// lib/actions.ts

'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { loginSchema } from '@/lib/schemas';

const resend = new Resend(process.env.RESEND_API_KEY);

// Contact Form Action
const contactSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: 'El mensaje debe tener al menos 10 caracteres.' }),
});

type ContactFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    message?: string[];
  };
    success?: boolean;
  message?: string;
};

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, message } = validatedFields.data;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'r.alejo.z95@gmail.com',
      subject: `Mensaje de Contacto de ${name}`,
      html: `
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone || 'N/A'}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    return {
      success: true,
      message: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.',
    };
  }
}

// Login Action
type LoginInput = {
  email: string;
  password: string;
}

export async function login(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Correo o contraseña inválidos.' };
  }

  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return { error: 'Correo o contraseña inválidos.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data as LoginInput);

  if (error) {
    return { error: 'Credenciales incorrectas o error del servidor.' };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin', 'layout');
  redirect('/admin');
}

// Prayer Request Action
export async function addPrayerRequest(formData: FormData) {
  const name = formData.get('name') as string;
  const request_text = formData.get('request_text') as string;
  const is_public = formData.get('is_public') === 'true';
  const is_anonymous = formData.get('is_anonymous') === 'true';

  if (!request_text || typeof request_text !== 'string') {
    return { error: 'El texto de la petición no puede estar vacío.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('prayer_requests')
    .insert([{ name, request_text, is_public, is_anonymous, status: 'pending' }])
    .select();

  if (error) {
    console.error('Error inserting prayer request:', error);
    return { error: 'No se pudo enviar tu petición. Por favor, inténtalo de nuevo.' };
  }

  revalidatePath('/oracion');

  return { data };
}