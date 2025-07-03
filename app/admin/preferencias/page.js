'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const profileSchema = z.object({
  email: z.string().email('Correo electrónico inválido.').optional().or(z.literal('')),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  full_name: z.string().optional().or(z.literal('')),
});

export default function PreferenciasPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [form]);

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
      // Re-fetch user to update local state
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      form.reset({
        email: updatedUser.email || '',
        full_name: updatedUser.user_metadata?.full_name || '',
        password: '',
        confirmPassword: '',
      });
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Cargando preferencias...</p>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Preferencias de Usuario</CardTitle>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
