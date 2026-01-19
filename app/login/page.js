'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/schemas';
import { login } from '@/lib/actions';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-6">
            <Image
              src="/brand/logo-puembo.png"
              alt="Alianza Puembo Logo"
              width={150}
              height={97}
              sizes="(max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
              className="w-[150px] h-auto"
              priority
            />
          </Link>
          <h2 className="text-2xl font-bold text-center text-[var(--puembo-green)]">
            Iniciar Sesión
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@ejemplo.com" {...field} />
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-[var(--puembo-green)] hover:bg-[hsl(92,45.9%,37.8%)] h-10" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Iniciar Sesión'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
