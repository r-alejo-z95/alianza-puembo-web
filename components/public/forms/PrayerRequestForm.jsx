
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { sectionTitle } from '@/lib/styles';

const prayerRequestSchema = z.object({
  name: z.string().optional(),
  request_text: z.string().min(10, 'La petición debe tener al menos 10 caracteres.').max(500, 'La petición no puede exceder los 500 caracteres.'),
  is_public: z.boolean().default(true),
  is_anonymous: z.boolean().default(true),
});

export default function PrayerRequestForm({ action }) {
  const form = useForm({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      name: '',
      request_text: '',
      is_public: true,
      is_anonymous: true,
    },
  });

  const isAnonymous = form.watch('is_anonymous');

  const handleFormSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', isAnonymous || !data.name ? '' : data.name);
    formData.append('request_text', data.request_text);
    formData.append('is_public', data.is_public);
    formData.append('is_anonymous', data.is_anonymous);

    const result = await action(formData);

    if (result?.error) {
      toast.error(`Error: ${result.error}`);
    } else {
      toast.success('Tu petición de oración ha sido enviada. ¡Dios te bendiga!');
      form.reset();
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle><h2 className={`${sectionTitle} text-center mb-8 text-(--puembo-green)`}>
          Envía tu Petición
        </h2></CardTitle>
      </CardHeader>
      <CardContent className="text-left">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 flex flex-col items-center justify-center">
            <div className="flex flex-col md:flex-row items-start justify-center space-y-4 md:space-x-4">
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>¿Petición Pública?</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Tu petición se verá en la cartelera.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>¿Petición Anónima?</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Tu nombre no será visible.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            {!isAnonymous && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="request_text"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tu petición</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe aquí tu petición. Confiamos en que Dios escucha y obra."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='w-full flex justify-center'>
              <Button variant="secondary" type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Petición'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
