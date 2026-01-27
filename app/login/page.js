"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  KeyRound,
  Mail,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils.ts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        toast.error(
          "El correo o la contraseña son incorrectos. Por favor, verifica tus datos.",
          {
            icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          }
        );
      } else {
        toast.error("Error de autenticación.", {
          description: error.message,
          descriptionClassName: "text-gray-600",
        });
      }
    } else {
      toast.success("Sesión iniciada con éxito.");
      // Forzar un refresh del router para asegurar que el middleware reconozca la cookie en prod
      router.refresh();
      // Pequeño delay para permitir que el estado se sincronice antes del push
      setTimeout(() => {
        router.push("/admin");
      }, 100);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] p-4 relative overflow-hidden font-sans">
      {/* Cinematic Background Element */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none select-none overflow-hidden">
        <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-[40vw] font-serif font-black whitespace-nowrap leading-none tracking-tighter">
          ALIANZA PUEMBO
        </span>
      </div>

      <div className="absolute top-8 left-8 z-10">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-gray-900 flex items-center gap-2 rounded-full font-bold uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Sitio Público
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-lg space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/brand/logo-puembo.png"
            alt="Alianza Puembo"
            width={180}
            height={116}
            priority
            className="h-auto w-36 md:w-44 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 opacity-80"
          />
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-gray-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
              Sistema de Gestión
            </span>
            <div className="h-px w-12 bg-gray-200" />
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <div className="bg-black p-10 md:p-12 text-white">
            <CardHeader className="p-0 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--puembo-green)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                  Seguridad
                </span>
              </div>
              <CardTitle className="text-4xl md:text-5xl font-bold font-serif leading-tight">
                Acceso <br />
                <span className="text-[var(--puembo-green)] italic font-medium">
                  Editorial
                </span>
              </CardTitle>
            </CardHeader>
          </div>

          <CardContent className="p-10 md:p-16">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
                  >
                    Correo Electrónico
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@alianzapuembo.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:bg-white focus:ring-[var(--puembo-green)]/10 transition-all text-base font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
                  >
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:bg-white focus:ring-[var(--puembo-green)]/10 transition-all text-base font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="green"
                  disabled={loading}
                  className="w-full rounded-full py-8 text-lg font-bold shadow-2xl shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-1 active:scale-95 flex gap-3"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "Autenticar"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <footer className="flex flex-col items-center gap-4 pt-8 border-t border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
            Alianza Puembo Web Team &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
