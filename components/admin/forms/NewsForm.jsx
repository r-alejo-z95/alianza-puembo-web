"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ImageIcon,
  Save,
  X,
  Calendar,
  Clock,
  Type,
  AlignLeft,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";

const newsSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

export default function NewsForm({ newsItem, onSave, onCancel }) {
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: newsItem?.title || "",
      description: newsItem?.description || "",
      date: newsItem?.news_date || "",
      time: newsItem?.news_time || "",
    },
  });

  useEffect(() => {
    if (newsItem) {
      form.reset({
        title: newsItem.title || "",
        description: newsItem.description || "",
        date: newsItem.news_date || "",
        time: newsItem.news_time || "",
      });
    }
  }, [newsItem, form]);

  const onSubmit = (data) => {
    onSave(
      {
        ...data,
        news_date: data.date || null,
        news_time: data.time || null,
      },
      imageFile
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="space-y-8">
          {/* Título */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Type className="w-3.5 h-3.5" />
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">
                    Título de la Crónica
                  </FormLabel>
                </div>
                <FormControl>
                  <Input
                    placeholder="Escribe un título imponente..."
                    className="h-14 text-lg font-serif font-bold rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all shadow-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <AlignLeft className="w-3.5 h-3.5" />
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">
                    Contenido Narrativo
                  </FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Relata lo sucedido con detalle..."
                    className="min-h-[180px] rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-base font-light leading-relaxed p-6 shadow-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">
                      Fecha de Publicación
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="date"
                      className="h-12 rounded-xl bg-gray-50 border-gray-100 shadow-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">
                      Hora (Opcional)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="time"
                      className="h-12 rounded-xl bg-gray-50 border-gray-100 shadow-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Multimedia */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <ImageIcon className="w-3.5 h-3.5" />
              <FormLabel className="text-[10px] font-black uppercase tracking-widest">
                Imagen Destacada
              </FormLabel>
            </div>
            <div className="p-8 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 flex flex-col items-center justify-center gap-4 transition-all hover:bg-gray-50 hover:border-[var(--puembo-green)]/20 group">
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
                        setImageFile({
                          file,
                          width: img.width,
                          height: img.height,
                        });
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
              <div
                className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:text-[var(--puembo-green)] transition-colors cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-600">
                  {imageFile ? "Imagen seleccionada" : "Cargar fotografía"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {imageFile
                    ? imageFile.file.name
                    : "Formatos aceptados: JPG, PNG, WEBP"}
                </p>
              </div>
              {newsItem?.image_url && !imageFile && (
                <p className="text-[10px] text-[var(--puembo-green)] font-black uppercase tracking-widest mt-2">
                  Manteniendo imagen actual
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-50">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-8 font-bold text-gray-400"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            variant="green"
            className="rounded-full px-10 py-7 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {newsItem?.id ? "Actualizar Crónica" : "Publicar Historia"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
