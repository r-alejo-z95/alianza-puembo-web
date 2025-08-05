'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon } from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
  description: z.string().optional(),
  start_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida.',
  }),
  end_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida.',
  }),
  registration_link: z.string().optional(),
  create_form: z.boolean().optional(),
  regenerate_form: z.boolean().optional(),
  all_day: z.boolean().optional(),
  color: z.string().optional(),
  location: z.string().optional(),
});

const colorOptions = [
  { value: 'sky', label: 'Azul cielo', color: 'bg-sky-500' },
  { value: 'emerald', label: 'Verde esmeralda', color: 'bg-emerald-500' },
  { value: 'amber', label: 'Ámbar', color: 'bg-amber-500' },
  { value: 'orange', label: 'Naranja', color: 'bg-orange-500' },
  { value: 'rose', label: 'Rosa', color: 'bg-rose-500' },
  { value: 'violet', label: 'Violeta', color: 'bg-violet-500' },
  { value: 'indigo', label: 'Índigo', color: 'bg-indigo-500' },
  { value: 'teal', label: 'Verde azulado', color: 'bg-teal-500' },
];

export default function EventForm({ event, onSave, onCancel }) {
  const [posterFile, setPosterFile] = useState(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      start_time: event?.start_time ? new Date(event.start_time).toLocaleString('sv').substring(0, 16) : '',
      end_time: event?.end_time ? new Date(event.end_time).toLocaleString('sv').substring(0, 16) : '',
      registration_link: event?.registration_link || '',
      create_form: false,
      regenerate_form: false,
      all_day: event?.all_day || false,
      color: event?.color || 'sky',
      location: event?.location || '',
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title || '',
        description: event.description || '',
        start_time: event.start_time ? new Date(event.start_time).toLocaleString('sv').substring(0, 16) : '',
        end_time: event.end_time ? new Date(event.end_time).toLocaleString('sv').substring(0, 16) : '',
        registration_link: event.registration_link || '',
        create_form: false,
        regenerate_form: false,
        all_day: event.all_day || false,
        color: event.color || 'sky',
        location: event.location || '',
      });
    }
  }, [event, form]);

  const onSubmit = (data) => {
    // Clean data before sending
    const finalData = {
      title: data.title,
      description: data.description || '',
      start_time: data.start_time,
      end_time: data.end_time,
      create_form: Boolean(data.create_form),
      regenerate_form: Boolean(data.regenerate_form),
      all_day: Boolean(data.all_day),
      color: data.color || 'sky',
      location: data.location || '',
    };

    onSave(finalData, posterFile);
  };

  // Determine if the event already has a form
  const hasExistingForm = event?.registration_link;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Evento</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Noche de Adoración" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe el evento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha y Hora de Inicio</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha y Hora de Fin</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="all_day"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Evento de todo el día
                </FormLabel>
                <p className="text-sm text-gray-600">
                  Marcar si el evento dura todo el día sin horarios específicos
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color del Evento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.color}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Santuario principal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <FormLabel>Póster del Evento (Opcional)</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const img = new Image();
                      img.onload = () => {
                        setPosterFile({ file, width: img.width, height: img.height });
                      };
                      img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setPosterFile(null);
                  }
                }}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Seleccionar Imagen
              </Button>
              {posterFile && <span className="text-sm text-gray-500">{posterFile.file.name}</span>}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Show current registration link if exists */}
        {hasExistingForm && (
          <FormItem>
            <FormLabel>Enlace de Registro Actual</FormLabel>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className="text-blue-600 text-sm">
                {event.registration_link}
              </span>
            </div>
          </FormItem>
        )}

        {/* Form options based on event state */}
        {!event ? (
          // For new events
          <FormField
            control={form.control}
            name="create_form"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Crear formulario de registro para este evento
                  </FormLabel>
                  <p className="text-sm text-gray-600">
                    Se creará automáticamente un formulario, una hoja de cálculo y una carpeta en Google Drive para almacenar las imágenes que suban los usuarios que llenen el formulario
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        ) : !hasExistingForm ? (
          // For existing events without form
          <FormField
            control={form.control}
            name="create_form"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Crear formulario de registro para este evento
                  </FormLabel>
                  <p className="text-sm text-gray-600">
                    Este evento no tiene formulario. Marca esta opción para crear uno
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        ) : (
          // For existing events with form
          <FormField
            control={form.control}
            name="regenerate_form"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-orange-200 bg-orange-50">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-orange-800">
                    Regenerar formulario de registro
                  </FormLabel>
                  <p className="text-sm text-orange-700">
                    ⚠️ Esto eliminará el formulario actual y creará uno nuevo con la misma URL.
                    Se creará un nuevo Google Sheet. La anterior hoja de cálculo y la carpeta de Google Drive, seguirán guardadas.
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Guardando...' : event ? 'Actualizar Evento' : 'Crear Evento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}