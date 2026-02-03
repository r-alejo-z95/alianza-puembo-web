"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  adminPageTitle,
  adminPageDescription,
  adminPageSection,
  adminPageHeaderContainer,
} from "@/lib/styles.ts";
import {
  Loader2,
  Settings,
  User,
  Key,
  Save,
  Eye,
  EyeOff,
  ShieldAlert,
  History,
  LogOut,
  Users,
  Globe,
  ShieldCheck,
  Mail,
  Zap,
  Lock,
  ChevronRight,
  Shield,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { formatInEcuador } from "@/lib/date-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAdminProfiles } from "@/lib/hooks/useAdminProfiles";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";

const profileSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").optional().or(z.literal("")),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
  full_name: z.string().optional().or(z.literal("")),
});

export default function PreferenciasPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { profiles, siteSettings, loading: loadingTeam, updateProfileField, updateSiteSettings } = useAdminProfiles();

  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      full_name: "",
    },
  });

  const watchPassword = form.watch("password");
  const watchConfirmPassword = form.watch("confirmPassword");
  const passwordsMatch = watchPassword === watchConfirmPassword || !watchConfirmPassword;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUser({ ...user, ...profile });
        form.reset({
          email: user.email || "",
          full_name: profile?.full_name || "",
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, [form, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/login";
  };

  const onProfileSubmit = async (data) => {
    if (data.password && data.password !== data.confirmPassword) {
      form.setError("confirmPassword", { message: "Las contraseñas no coinciden." });
      return;
    }

    setSubmitting(true);
    try {
      const updates = {};
      if (data.email && data.email !== user?.email) updates.email = data.email;
      if (data.password) updates.password = data.password;
      
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
      }

      if (data.full_name && data.full_name !== user?.full_name) {
        const { error } = await supabase.from('profiles').update({ full_name: data.full_name }).eq('id', user.id);
        if (error) throw error;
      }

      toast.success("Perfil actualizado con éxito.");
    } catch (error) {
      toast.error("Error al actualizar perfil.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleInfo = (profile) => {
    if (profile.is_super_admin) return { label: "Super Admin", variant: "blue" };
    const perms = [
      profile.perm_events,
      profile.perm_news,
      profile.perm_lom,
      profile.perm_comunidad,
      profile.perm_forms,
      profile.perm_internal_forms
    ];
    const hasAll = perms.every(p => p === true);
    return hasAll 
      ? { label: "Administrador", variant: "approved" }
      : { label: "Editor", variant: "secondary" };
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
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">Preferencias</span>
        </div>
        <h1 className={adminPageTitle}>Configuración del <span className="text-[var(--puembo-green)] italic">Sistema</span></h1>
        <p className={adminPageDescription}>Administra tu cuenta, permisos de equipo y ajustes globales de la plataforma.</p>
      </header>

      <div className="max-w-4xl mx-auto pb-20">
        <Tabs defaultValue="perfil" className="space-y-8">
          {user?.is_super_admin && (
            <div className="w-full px-4 max-w-md mx-auto">
              <TabsList className="bg-gray-100 p-1 rounded-full h-12 md:h-14 w-full flex">
                <TabsTrigger value="perfil" className="flex-1 rounded-full px-2 md:px-8 data-[state=active]:bg-black data-[state=active]:text-white transition-all font-bold text-[9px] md:text-xs uppercase tracking-tighter sm:tracking-widest gap-1.5 md:gap-2">
                  <User className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                  <span className="hidden xs:inline">Perfil</span>
                  <span className="xs:hidden">Mío</span>
                </TabsTrigger>
                <TabsTrigger value="sitio" className="flex-1 rounded-full px-2 md:px-8 data-[state=active]:bg-black data-[state=active]:text-white transition-all font-bold text-[9px] md:text-xs uppercase tracking-tighter sm:tracking-widest gap-1.5 md:gap-2">
                  <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                  <span className="hidden xs:inline">Global</span>
                  <span className="xs:hidden">Sitio</span>
                </TabsTrigger>
                <TabsTrigger value="equipo" className="flex-1 rounded-full px-2 md:px-8 data-[state=active]:bg-black data-[state=active]:text-white transition-all font-bold text-[9px] md:text-xs uppercase tracking-tighter sm:tracking-widest gap-1.5 md:gap-2">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                  <span className="hidden xs:inline">Equipo</span>
                  <span className="xs:hidden">Team</span>
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          <TabsContent value="perfil" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
              <div className="bg-black p-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--puembo-green)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Datos Personales</span>
                </div>
                {user?.last_sign_in_at && (
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                    <History className="w-3 h-3" /> Último acceso: {formatInEcuador(user.last_sign_in_at, "d MMM, HH:mm")}
                  </div>
                )}
              </div>
              <CardContent className="p-8 md:p-12">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField control={form.control} name="full_name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre Completo</FormLabel>
                          <FormControl><Input placeholder="Tu nombre" className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all" {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wide">Correo Electrónico</FormLabel>
                          <FormControl><Input type="email" placeholder="tu@ejemplo.com" className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all" {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-50">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2"><Key className="w-4 h-4 text-gray-400" /> Cambio de Contraseña</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="password" render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nueva Contraseña</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type={showPassword ? "text" : "password"} placeholder="********" className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all pr-10" {...field} value={field.value || ""} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirmar Contraseña</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type={showConfirmPassword ? "text" : "password"} placeholder="********" className={cn("h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all pr-10", !passwordsMatch && watchConfirmPassword && "border-red-300 bg-red-50/30")} {...field} value={field.value || ""} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                              </div>
                            </FormControl>
                            {!passwordsMatch && watchConfirmPassword && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> No coinciden</p>}
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <Button type="submit" disabled={submitting || (!passwordsMatch && !!watchConfirmPassword)} variant="green" className="w-full rounded-full py-7 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5">
                      {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Actualizar Mi Información
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-red-100 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500"><LogOut className="w-6 h-6" /></div>
                    <h4 className="text-sm font-bold text-red-900 uppercase tracking-tight">Seguridad</h4>
                  </div>
                  <p className="text-[11px] text-red-600/70 font-medium leading-relaxed">Cierra sesión en todos tus dispositivos activos por seguridad.</p>
                  <Button variant="outline" onClick={handleLogout} className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all h-12 text-[10px] font-black uppercase tracking-widest">Cerrar todas las sesiones</Button>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-100 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 space-y-6 flex flex-col items-center text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"><ShieldCheck className="w-6 h-6" /></div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Tu Rol</h4>
                  </div>
                  <div className="flex justify-center">
                    <Badge variant={getRoleInfo(user).variant} className="rounded-full px-6 py-1.5 uppercase text-[9px] font-black tracking-widest">{getRoleInfo(user).label}</Badge>
                  </div>
                  <p className="text-[11px] text-gray-400 italic max-w-[220px]">Tienes acceso completo a las herramientas asignadas por el sistema.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {user?.is_super_admin && (
            <>
              <TabsContent value="sitio" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="bg-black p-8">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-[var(--puembo-green)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Preferencias del Sitio</span>
                    </div>
                  </div>
                  <CardContent className="p-8 md:p-12 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-[var(--puembo-green)]" />
                          <h4 className="text-xs font-black uppercase tracking-widest">Email de Respaldo (Fallback)</h4>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                          Este correo recibirá todas las notificaciones si ningún administrador está suscrito individualmente. Es una medida de seguridad para no perder contactos.
                        </p>
                        <div className="flex gap-2">
                          <Input 
                            defaultValue={siteSettings?.notification_email} 
                            placeholder="info@alianzapuembo.org"
                            className="h-12 rounded-xl bg-gray-50 border-gray-100"
                            onBlur={(e) => updateSiteSettings({ notification_email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-orange-500" />
                              <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Modo Mantenimiento</h4>
                            </div>
                            <p className="text-[10px] text-gray-500">Oculta la web pública temporalmente.</p>
                          </div>
                          <Switch 
                            checked={siteSettings?.maintenance_mode || false} 
                            onCheckedChange={(val) => updateSiteSettings({ maintenance_mode: val })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="equipo" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="bg-black p-8">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[var(--puembo-green)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Gestión de Equipo</span>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {profiles.map((profile) => (
                        <AccordionItem key={profile.id} value={profile.id} className="border-b border-gray-50 last:border-0 overflow-hidden">
                          <AccordionTrigger className="p-8 lg:p-10 hover:bg-gray-50/50 hover:no-underline transition-all group">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pr-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-xs uppercase tracking-widest shrink-0">
                                  {profile.full_name?.substring(0, 2) || profile.email?.substring(0, 2)}
                                </div>
                                <div className="space-y-0.5 text-left">
                                  <p className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors">{profile.full_name || "Sin nombre"}</p>
                                  <p className="text-[10px] text-gray-400 font-medium italic">{profile.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getRoleInfo(profile).variant} className="rounded-full px-4 py-1 uppercase text-[8px] font-black tracking-widest shrink-0">
                                  {getRoleInfo(profile).label}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="bg-gray-50/30">
                            <div className="p-8 lg:p-12 space-y-10 border-t border-gray-100">
                              {/* Nombre Editable (Solo para otros, no para uno mismo aquí) */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <Edit2 className="w-4 h-4 text-gray-400" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Información del Perfil</h4>
                                </div>
                                <div className="max-w-md">
                                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Nombre Completo</Label>
                                  <div className="flex gap-2 mt-1">
                                    <Input 
                                      key={profile.id + profile.full_name}
                                      defaultValue={profile.full_name} 
                                      placeholder="Nombre del admin"
                                      className="h-11 rounded-xl bg-white border-gray-200"
                                      onBlur={(e) => {
                                        if (e.target.value !== profile.full_name) {
                                          updateProfileField(profile.id, 'full_name', e.target.value);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {!profile.is_super_admin && (
                                <>
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <ShieldCheck className="w-4 h-4 text-gray-400" />
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Permisos de Módulos</h4>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                      {[
                                        { key: 'perm_events', label: 'Eventos' },
                                        { key: 'perm_news', label: 'Noticias' },
                                        { key: 'perm_lom', label: 'LOM' },
                                        { key: 'perm_comunidad', label: 'Comunidad' },
                                        { key: 'perm_forms', label: 'Forms' },
                                        { key: 'perm_internal_forms', label: 'Internos' },
                                      ].map((perm) => (
                                        <div key={perm.key} className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 transition-all hover:shadow-md group">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">{perm.label}</span>
                                          <Switch 
                                            checked={profile[perm.key]} 
                                            onCheckedChange={(val) => updateProfileField(profile.id, perm.key, val)}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <Zap className="w-4 h-4 text-[var(--puembo-green)]" />
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Suscripciones a Notificaciones</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                      {/* Oración */}
                                      <div className="p-6 bg-blue-50/30 rounded-[2rem] border border-blue-100/50 space-y-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block text-center border-b border-blue-100 pb-2">Muro de Oración</span>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-gray-600">Email</span>
                                          <Switch checked={profile.notify_email_prayer} onCheckedChange={(val) => updateProfileField(profile.id, 'notify_email_prayer', val)} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-gray-600">Dashboard</span>
                                          <Switch checked={profile.notify_dash_prayer} onCheckedChange={(val) => updateProfileField(profile.id, 'notify_dash_prayer', val)} />
                                        </div>
                                      </div>

                                      {/* Contacto */}
                                      <div className="p-6 bg-orange-50/30 rounded-[2rem] border border-orange-100/50 space-y-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block text-center border-b border-orange-100 pb-2">Form de Contacto</span>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-gray-600">Email</span>
                                          <Switch checked={profile.notify_email_contact} onCheckedChange={(val) => updateProfileField(profile.id, 'notify_email_contact', val)} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-gray-600">Dashboard</span>
                                          <Switch checked={profile.notify_dash_contact} onCheckedChange={(val) => updateProfileField(profile.id, 'notify_dash_contact', val)} />
                                        </div>
                                      </div>

                                      {/* Internos */}
                                      <div className="p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50 space-y-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block text-center border-b border-emerald-100 pb-2">Forms Internos</span>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-gray-600">Email</span>
                                          <Switch checked={profile.notify_email_internal} onCheckedChange={(val) => updateProfileField(profile.id, 'notify_email_internal', val)} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-gray-600">Dashboard</span>
                                          <Switch checked={profile.notify_dash_internal} onCheckedChange={(val) => updateProfileField(profile.id, 'notify_dash_internal', val)} />
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic pl-2">* Las notificaciones de formularios llegan siempre al autor del mismo.</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </section>
  );
}