"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  Send,
  Globe,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  ecuadorToUTC,
  formatEcuadorDateForInput,
  formatEcuadorTimeForInput,
  getNowInEcuador,
} from "@/lib/date-utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimatePresence, motion } from "framer-motion";

const newsSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  publish_mode: z.enum(["now", "scheduled"]),
  publish_date: z.string().optional(),
  publish_time: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.publish_mode === "scheduled") {
    if (!data.publish_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fecha requerida",
        path: ["publish_date"],
      });
    }
    if (!data.publish_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hora requerida",
        path: ["publish_time"],
      });
    }
  }
});

export default function NewsForm({ newsItem, onSave, onCancel }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef(null);

  const initialPublishAt = newsItem?.publish_at || new Date().toISOString();
  const isInitiallyScheduled = newsItem?.publish_at && new Date(newsItem.publish_at) > new Date();

  const form = useForm({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: newsItem?.title || "",
      description: newsItem?.description || "",
      publish_mode: isInitiallyScheduled ? "scheduled" : "now",
      publish_date: formatEcuadorDateForInput(initialPublishAt),
      publish_time: formatEcuadorTimeForInput(initialPublishAt),
    },
  });

  const publishMode = useWatch({ control: form.control, name: "publish_mode" });

  useEffect(() => {
    if (newsItem) {
      const pubAt = newsItem.publish_at || new Date().toISOString();
      const isScheduled = new Date(pubAt) > new Date();
      form.reset({
        title: newsItem.title || "",
        description: newsItem.description || "",
        publish_mode: isScheduled ? "scheduled" : "now",
        publish_date: formatEcuadorDateForInput(pubAt),
        publish_time: formatEcuadorTimeForInput(pubAt),
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
    // Usar transformación de Supabase (aspecto 16:9)
    return `${url}?width=400&height=225&resize=cover`;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    };
    img.src = objectUrl;
  };

  const onSubmit = async (data) => {
    let publish_at_utc;
    
    if (data.publish_mode === "now") {
      publish_at_utc = new Date().toISOString();
    } else {
      publish_at_utc = ecuadorToUTC(
        data.publish_date,
        data.publish_time,
      ).toISOString();
    }

    await onSave(
      {
        ...data,
        publish_at: publish_at_utc,
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

          {/* Programación de Visibilidad */}
          <div className="bg-[var(--puembo-green)]/5 p-8 rounded-[2.5rem] border border-[var(--puembo-green)]/10 space-y-8">
            <div className="space-y-1">
              <FormLabel className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-[var(--puembo-green)]" />
                Opciones de Publicación
              </FormLabel>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                ¿Cuándo quieres que se publique esta historia?
              </p>
            </div>

            <FormField
              control={form.control}
              name="publish_mode"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="now" className="sr-only" />
                        </FormControl>
                        <FormLabel className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          field.value === "now" 
                            ? "bg-white border-[var(--puembo-green)] shadow-md text-[var(--puembo-green)]" 
                            : "bg-white/50 border-transparent text-gray-400 hover:bg-white"
                        )}>
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            field.value === "now" ? "bg-[var(--puembo-green)] text-white" : "bg-gray-100"
                          )}>
                            <Globe className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-sm">Publicar Ahora</span>
                            <span className="text-[10px] uppercase tracking-wider font-black opacity-60">Inmediato</span>
                          </div>
                        </FormLabel>
                      </FormItem>

                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="scheduled" className="sr-only" />
                        </FormControl>
                        <FormLabel className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          field.value === "scheduled" 
                            ? "bg-white border-[var(--puembo-green)] shadow-md text-[var(--puembo-green)]" 
                            : "bg-white/50 border-transparent text-gray-400 hover:bg-white"
                        )}>
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            field.value === "scheduled" ? "bg-[var(--puembo-green)] text-white" : "bg-gray-100"
                          )}>
                            <Timer className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-sm">Programar</span>
                            <span className="text-[10px] uppercase tracking-wider font-black opacity-60">Fecha y Hora</span>
                          </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <AnimatePresence mode="wait">
              {publishMode === "scheduled" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--puembo-green)]/10 mt-2">
                    <FormField
                      control={form.control}
                      name="publish_date"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Fecha
                          </FormLabel>
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
                      name="publish_time"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Hora
                          </FormLabel>
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
                </motion.div>
              )}
            </AnimatePresence>
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
                {previewUrl || (newsItem?.image_url && !removeImage) ? (
                  <>
                    <img
                      src={getOptimizedUrl(previewUrl || newsItem.image_url)}
                      alt="Preview"
                      className={cn(
                        "w-full h-full object-cover transition-all duration-500 group-hover/preview:scale-105",
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
