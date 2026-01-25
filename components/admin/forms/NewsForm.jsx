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
  Trash2,
  Camera,
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewLoading, setPreviewLoading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
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

  // Limpiar URL de objeto para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Generar URL optimizada de Supabase para previsualización de imágenes existentes
  const getOptimizedUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("blob:")) return url;
    // Usar transformación de Supabase (resize a 200px para el aspecto 16:9)
    return `${url}?width=200&resize=contain`;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewLoading(true);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      setPreviewUrl(objectUrl);
      setImageFile({
        file,
        width: img.width,
        height: img.height,
      });
      setRemoveImage(false);
      // Pequeño delay para que el loader sea visible y la transición suave
      setTimeout(() => setPreviewLoading(false), 400);
    };
    img.src = objectUrl;
  };

  const onSubmit = async (data) => {
    await onSave(
      {
        ...data,
        news_date: data.date || null,
        news_time: data.time || null,
        remove_image: removeImage,
      },
      imageFile,
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="space-y-8">
          {/* Título y Descripción */}
          <div className="space-y-6">
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
          </div>

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
                      className="h-12 rounded-xl bg-white border-gray-100 shadow-sm"
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
                      className="h-12 rounded-xl bg-white border-gray-100 shadow-sm"
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
            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Imagen Destacada
            </FormLabel>
            <div className="p-6 md:p-8 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50 flex flex-col items-center justify-center gap-4 hover:border-[var(--puembo-green)]/20 group transition-all relative overflow-hidden">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />

              {/* Área de Visualización */}
              <div
                className="relative w-full aspect-video rounded-[1.5rem] overflow-hidden bg-white shadow-inner border border-gray-100 group/preview cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                {isPreviewLoading && (
                  <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--puembo-green)]" />
                  </div>
                )}

                {previewUrl || (newsItem?.image_url && !removeImage) ? (
                  <>
                    <img
                      src={getOptimizedUrl(previewUrl || newsItem.image_url)}
                      alt="Preview"
                      className={cn(
                        "w-full h-full object-cover transition-all duration-500 group-hover/preview:scale-105",
                        isPreviewLoading && "blur-sm grayscale",
                      )}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-6 h-6 text-white" />
                      <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        Cambiar Imagen
                      </span>
                    </div>
                    {/* Mobile indicator icon */}
                    <div className="absolute bottom-4 right-4 md:hidden w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                      <Camera className="w-5 h-5" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-300 group-hover:text-[var(--puembo-green)] transition-colors">
                    <Plus className="w-10 h-10" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Subir Fotografía
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center space-y-3">
                {imageFile ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm animate-in zoom-in-95">
                    <ImageIcon className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">
                      {imageFile.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setPreviewUrl(null);
                      }}
                      className="ml-1 p-1 hover:bg-emerald-100 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : newsItem?.image_url && !removeImage ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--puembo-green)]/20 shadow-sm">
                    <ImageIcon className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">
                      {decodeURIComponent(
                        newsItem.image_url
                          .split("/")
                          .pop()
                          .replace(/^\d+_/, ""),
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemoveImage(true);
                      }}
                      className="ml-1 p-1 hover:bg-[var(--puembo-green)]/20 rounded-full"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Formatos recomendados: JPG, WEBP, PNG (Relación 16:9)
                  </p>
                )}
              </div>
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
            Cerrar
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
