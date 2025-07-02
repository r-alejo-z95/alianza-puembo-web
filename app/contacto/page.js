'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitContactForm } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { mainTitleSizes, sectionPx } from '@/lib/styles';

const initialState = {
  errors: {},
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Enviando...' : 'Enviar Mensaje'}
    </Button>
  );
}

export default function ContactPage() {
  const [state, formAction] = useFormState(submitContactForm, initialState);

  return (
    <div className={cn(sectionPx, "py-16 md:py-24 lg:py-32")}>
      <div className="max-w-2xl mx-auto">
        <h1 className={cn(mainTitleSizes, "text-center mb-8 font-merriweather font-bold")}>
          Contáctanos
        </h1>
        
        {state.success ? (
          <div className="text-center bg-green-100 text-green-800 p-4 rounded-md">
            {state.message}
          </div>
        ) : (
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Tu nombre" />
              {state.errors?.name && (
                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="tu@correo.com" />
              {state.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea id="message" name="message" placeholder="Escribe tu mensaje aquí..." rows={6} />
              {state.errors?.message && (
                <p className="text-sm text-red-500">{state.errors.message[0]}</p>
              )}
            </div>
            <SubmitButton />
          </form>
        )}
      </div>
    </div>
  );
}