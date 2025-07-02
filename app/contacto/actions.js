
'use server';

import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
});

export async function submitContactForm(prevState, formData) {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Aquí iría la lógica para enviar el correo o guardar en una base de datos.
  // Por ahora, solo simularemos un éxito.
  console.log('Formulario de contacto recibido:', validatedFields.data);

  // Esto podría venir de una operación asíncrona real
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    message: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.',
  };
}
