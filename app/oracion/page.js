"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  nombre: z.string().optional(),
  mensaje: z.string().min(1, { message: "La petición no puede estar vacía" }),
  publicar: z.boolean().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
});

export default function Oracion() {
  const [peticiones, setPeticiones] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      mensaje: "",
      publicar: false,
      email: "",
    },
  });

  const onSubmit = (data) => {
    // Simulación de envío por correo
    if (data.email) {
      console.log("📬 Enviando correo al equipo de oración:", data);
    }

    // Si el usuario quiere publicarla
    if (data.publicar) {
      setPeticiones((prev) => [...prev, data]);
    }

    form.reset();
  };

  return (
    <div className="max-w-2xl h-screen mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Petición de Oración</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mensaje"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Petición de oración</FormLabel>
                <FormControl>
                  <Textarea placeholder="Escribe tu petición..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publicar"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mb-0">¿Publicar en la página?</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo (si quieres que te contacten)</FormLabel>
                <FormControl>
                  <Input placeholder="tu@correo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Enviar petición</Button>
        </form>
      </Form>

      {peticiones.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Peticiones públicas</h2>
          {peticiones.map((p, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {p.nombre || "Anónimo"} escribió:
                </p>
                <p className="text-base mt-2">{p.mensaje}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
