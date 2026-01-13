'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageIcon } from 'lucide-react';

const newsSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
  description: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

export default function NewsForm({ newsItem, onSave, onCancel }) {
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Helper to format date for input from ISO string
  const getFormattedDate = (dateString, hasDate) => {
    if (!dateString || !hasDate) return '';
    const d = new Date(dateString);
    if (d.getFullYear() <= 1) return ''; // Extra check for placeholder
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedTime = (dateString, hasTime) => {
    if (!dateString || !hasTime) return '';
    const d = new Date(dateString);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const form = useForm({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: newsItem?.title || '',
      description: newsItem?.description || '',
      date: newsItem?.date ? getFormattedDate(newsItem.date, newsItem.has_date) : '',
      time: newsItem?.date ? getFormattedTime(newsItem.date, newsItem.has_time) : '',
    },
  });

  useEffect(() => {
    if (newsItem) {
      form.reset({
        title: newsItem.title || '',
        description: newsItem.description || '',
        date: newsItem?.date ? getFormattedDate(newsItem.date, newsItem.has_date) : '',
        time: newsItem?.date ? getFormattedTime(newsItem.date, newsItem.has_time) : '',
      });
    }
  }, [newsItem, form]);

  const onSubmit = (data) => {
    onSave(data, imageFile);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título de la noticia" {...field} />
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
                <Textarea placeholder="Descripción de la noticia..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha (Opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora (Opcional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <FormLabel>Póster (Opcional)</FormLabel>
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
                        setImageFile({ file, width: img.width, height: img.height });
                      };
                      img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImageFile(null);
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
              {imageFile ? (
                <span className="text-sm text-gray-500">{imageFile.file.name}</span>
              ) : newsItem?.image_url ? (
                 <span className="text-sm text-gray-500">Imagen actual guardada</span>
              ) : null}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Guardando...' : newsItem?.id ? 'Actualizar Noticia' : 'Crear Noticia'}
          </Button>
        </div>
      </form>
    </Form>
  );
}