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
import { Loader2, Settings, User, Key, Save, Eye, EyeOff, ShieldAlert, History, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils.ts";
import { formatInEcuador } from "@/lib/date-utils";

const profileSchema = z.object({
  email: z.string().email('Correo electrónico inválido.').optional().or(z.literal('')),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  full_name: z.string().optional().or(z.literal('')),
});

export default function PreferenciasPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const watchPassword = form.watch("password");
  const watchConfirmPassword = form.watch("confirmPassword");
  const passwordsMatch = watchPassword === watchConfirmPassword || !watchConfirmPassword;

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

  const handleGlobalLogout = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      toast.error("Error al cerrar sesiones globales.");
    } else {
      toast.success("Sesiones cerradas en todos los dispositivos.");
      window.location.href = '/login';
    }
  };

  const onSubmit = async (data) => {
    if (data.password && data.password !== data.confirmPassword) {
      form.setError('confirmPassword', { message: 'Las contraseñas no coinciden.' });
      return;
    }

    setSubmitting(true);
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
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      toast.error('Error al actualizar el perfil.', {
        description: error.message,
      });
    } else {
      toast.success('Perfil actualizado con éxito.');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--puembo-green)] opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 text-center">Cargando Preferencias</p>
      </div>
    );
  }

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">Cuenta</span>
        </div>
        <h1 className={adminPageTitle}>
          Ajustes de <span className="text-[var(--puembo-green)] italic">Perfil</span>
        </h1>
        <p className={adminPageDescription}>
          Personaliza tu identidad en la plataforma y mantén la seguridad de tu acceso administrativo.
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
          <div className="bg-black p-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[var(--puembo-green)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Configuración</span>
            </div>
            {user?.last_sign_in_at && (
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                <History className="w-3 h-3" />
                Último acceso: {formatInEcuador(user.last_sign_in_at, "d MMM, HH:mm")}
              </div>
            )}
          </div>
          
          <CardContent className="p-8 md:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-6">
                      <User className="w-4 h-4 text-gray-400" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Información General</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                      <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre Completo</FormLabel>
                              <FormControl>
                              <Input placeholder="Tu nombre" className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all" {...field} value={field.value || ""} />
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
                              <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wide">Correo Electrónico</FormLabel>
                              <FormControl>
                              <Input type="email" placeholder="tu@ejemplo.com" className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-6">
                      <Key className="w-4 h-4 text-gray-400" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Seguridad</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                      <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                          <FormItem className="relative pb-2">
                              <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nueva Contraseña</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="********" 
                                    className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all pr-10" 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                          <FormItem className="relative pb-2">
                              <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirmar Contraseña</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="********" 
                                    className={cn(
                                      "h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all pr-10",
                                      !passwordsMatch && watchConfirmPassword && "border-red-300 bg-red-50/30"
                                    )} 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              {!passwordsMatch && watchConfirmPassword && (
                                <p className="text-[10px] text-red-500 font-bold uppercase mt-1 flex items-center gap-1 absolute top-full left-0">
                                  <ShieldAlert className="w-3 h-3" /> Las contraseñas no coinciden
                                </p>
                              )}
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  </div>
                  <p className="text-[10px] text-gray-400 italic">Deja estos campos en blanco si no deseas cambiar tu contraseña actual.</p>
                </div>

                <div className="pt-6">
                  <Button 
                      type="submit" 
                      disabled={submitting || (!passwordsMatch && !!watchConfirmPassword)} 
                      variant="green"
                      className="w-full rounded-full py-7 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
                  >
                      {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Actualizar Perfil
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Peligro / Seguridad Avanzada */}
        <Card className="border border-red-100 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-red-50/30">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-sm border border-red-100">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-900 uppercase tracking-tight">Seguridad de la Sesión</h4>
                <p className="text-[11px] text-red-600/70 max-w-xs font-medium">Cierra la sesión en todos los navegadores y dispositivos donde hayas ingresado.</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleGlobalLogout}
              className="rounded-full border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-sm"
            >
              Cerrar sesiones globales
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}