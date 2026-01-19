'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { adminPageTitle, adminPageDescription, adminPageSection, adminPageHeaderContainer } from "@/lib/styles.ts";
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  email: z.string().email('Correo electrónico inválido.').optional().or(z.literal('')),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  full_name: z.string().optional().or(z.literal('')),
});

export default function PreferenciasPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        form.reset({
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, [form, supabase.auth]);

  const onSubmit = async (data) => {
    if (data.password && data.password !== data.confirmPassword) {
      form.setError('confirmPassword', { message: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    const updates = {};
    if (data.email && data.email !== user?.email) {
      updates.email = data.email;
    }
    if (data.password) {
      updates.password = data.password;
    }
    if (data.full_name && data.full_name !== user?.user_metadata?.full_name) {
      updates.data = { full_name: data.full_name };
    }

    if (Object.keys(updates).length === 0) {
      toast('No hay cambios para guardar.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      toast.error('Error al actualizar el perfil.', {
        description: error.message,
      });
    } else {
      toast('Perfil actualizado con éxito.');
      window.location.href = '/admin';
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)]" />
      </div>
    );
  }

  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={adminPageTitle}>
          Preferencias de Usuario
        </h1>
        <p className={adminPageDescription}>
          Actualiza tu información de perfil y contraseña.
        </p>
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Actualizar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña (dejar en blanco para no cambiar)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full h-10">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Cambios'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
