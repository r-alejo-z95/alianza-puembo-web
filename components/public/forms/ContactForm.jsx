
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContactForm } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const initialState = {
  errors: {},
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      variant="green" 
      type="submit" 
      disabled={pending} 
      aria-disabled={pending} 
      className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-[0.98]"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar Mensaje'}
    </Button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      {state.success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-green-50 text-[var(--puembo-green)] p-6 rounded-2xl border border-green-100 space-y-2"
        >
          <p className="text-lg font-bold">¡Mensaje enviado!</p>
          <p className="text-sm opacity-80">{state.message}</p>
        </motion.div>
      ) : (
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Nombre</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Tu nombre completo" 
                className="h-11 rounded-lg bg-gray-50/30 border-gray-200 focus:bg-white transition-all"
              />
              {state.errors?.name && (
                <p className="text-xs text-red-500 font-medium ml-1">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Correo Electrónico</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="tu@correo.com" 
                className="h-11 rounded-lg bg-gray-50/30 border-gray-200 focus:bg-white transition-all"
              />
              {state.errors?.email && (
                <p className="text-xs text-red-500 font-medium ml-1">{state.errors.email[0]}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Teléfono (Opcional)</Label>
            <Input 
              id="phone" 
              name="phone" 
              type="tel" 
              placeholder="Tu número de contacto" 
              className="h-11 rounded-lg bg-gray-50/30 border-gray-200 focus:bg-white transition-all"
            />
            {state.errors?.phone && (
              <p className="text-xs text-red-500 font-medium ml-1">{state.errors.phone[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Mensaje</Label>
            <Textarea 
              id="message" 
              name="message" 
              placeholder="¿Cómo podemos ayudarte?" 
              className="min-h-[120px] rounded-lg bg-gray-50/30 border-gray-200 focus:bg-white transition-all resize-none p-3 text-base md:text-sm"
            />
            {state.errors?.message && (
              <p className="text-xs text-red-500 font-medium ml-1">{state.errors.message[0]}</p>
            )}
          </div>
          <div className="space-y-6 pt-4">
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-500 leading-relaxed text-center">
                    Al enviar este formulario, usted autoriza a la Iglesia Alianza Puembo el tratamiento de sus datos personales para fines de contacto y gestión eclesial, conforme a la Ley Orgánica de Protección de Datos Personales de Ecuador.
                </p>
            </div>
            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  );
}
