"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEventColorOptions } from "@/components/public/calendar/event-calendar/utils";
import {
  ImageIcon,
  Save,
  X,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Database,
  Plus,
  Repeat,
  Loader2,
} from "lucide-react";
import {
  ecuadorToUTC,
  formatEcuadorDateForInput,
  formatEcuadorTimeForInput,
} from "@/lib/date-utils";
import { cn } from "@/lib/utils.ts";
import { AnimatePresence, motion } from "framer-motion";

const eventSchema = z
  .object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
    description: z.string().optional(),
    start_date: z.string().min(1, "La fecha de inicio es requerida."),
    end_date: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    registration_link: z.string().optional(),
    create_form: z.boolean().optional(),
    regenerate_form: z.boolean().optional(),
    all_day: z.boolean().optional(),
    is_multi_day: z.boolean().optional(),
    is_recurring: z.boolean().optional(),
    recurrence_pattern: z
      .enum(["weekly", "biweekly", "monthly", "yearly"])
      .optional()
      .nullable(),
    color: z.string().optional(),
    location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_multi_day) {
      if (!data.start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de inicio es requerida.",
          path: ["start_date"],
        });
      }
      if (!data.end_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de fin es requerida.",
          path: ["end_date"],
        });
      }
    } else if (!data.all_day) {
      if (!data.start_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hora requerida.",
          path: ["start_time"],
        });
      }
    }
    if (data.is_recurring && !data.recurrence_pattern) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona una frecuencia para el evento recurrente.",
        path: ["recurrence_pattern"],
      });
    }
  });

const formatEventData = (event) => {
  if (!event) return {};
  if (event.is_multi_day) {
    return {
      start_date: formatEcuadorDateForInput(event.start_time),
      end_date: formatEcuadorDateForInput(event.end_time),
      start_time: "",
      end_time: "",
    };
  } else if (event.all_day) {
    return {
      start_date: formatEcuadorDateForInput(event.start_time),
      end_date: "",
      start_time: "",
      end_time: "",
    };
  } else {
    return {
      start_date: formatEcuadorDateForInput(event.start_time),
      end_date: "",
      start_time: formatEcuadorTimeForInput(event.start_time),
      end_time: formatEcuadorTimeForInput(event.end_time),
    };
  }
};

const colorOptions = getEventColorOptions();

const recurrenceOptions = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
];

export default function EventForm({ event, onSave, onCancel }) {
  const [posterFile, setPosterFile] = useState(null);
  const fileInputRef = useRef(null);
  const eventData = formatEventData(event);

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      start_date: eventData.start_date || "",
      end_date: eventData.end_date || "",
      start_time: eventData.start_time || "",
      end_time: eventData.end_time || "",
      registration_link: event?.registration_link || "",
      create_form: false,
      regenerate_form: false,
      all_day: event?.all_day || false,
      is_multi_day: event?.is_multi_day || false,
      is_recurring: event?.is_recurring || false,
      recurrence_pattern: event?.recurrence_pattern || null,
      color: event?.color || "sky",
      location: event?.location || "",
    },
  });

  useEffect(() => {
    if (event) {
      const eventData = formatEventData(event);
      form.reset({
        title: event.title || "",
        description: event.description || "",
        start_date: eventData.start_date || "",
        end_date: eventData.end_date || "",
        start_time: eventData.start_time || "",
        end_time: eventData.end_time || "",
        registration_link: event.registration_link || "",
        create_form: false,
        regenerate_form: false,
        all_day: event.all_day || false,
        is_multi_day: event.is_multi_day || false,
        is_recurring: event.is_recurring || false,
        recurrence_pattern: event.recurrence_pattern || null,
        color: event.color || "sky",
        location: event.location || "",
      });
    }
  }, [event, form]);

  const onSubmit = async (data) => {
    let start_time_utc, end_time_utc;
    if (data.is_multi_day) {
      start_time_utc = ecuadorToUTC(data.start_date, "00:00").toISOString();
      end_time_utc = ecuadorToUTC(data.end_date, "23:59").toISOString();
    } else if (data.all_day) {
      start_time_utc = ecuadorToUTC(data.start_date, "00:00").toISOString();
      end_time_utc = ecuadorToUTC(data.start_date, "23:59").toISOString();
    } else {
      start_time_utc = ecuadorToUTC(
        data.start_date,
        data.start_time
      ).toISOString();
      end_time_utc = ecuadorToUTC(data.start_date, data.end_time).toISOString();
    }

    await onSave(
      {
        ...data,
        start_time: start_time_utc,
        end_time: end_time_utc,
        recurrence_pattern: data.is_recurring ? data.recurrence_pattern : null,
      },
      posterFile
    );
  };

  const isMultiDay = useWatch({ control: form.control, name: "is_multi_day" });
  const allDay = useWatch({ control: form.control, name: "all_day" });
  const isRecurring = useWatch({ control: form.control, name: "is_recurring" });

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
                    <Calendar className="w-3.5 h-3.5" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">
                      Nombre de la Actividad
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Ej: Concierto de Navidad"
                      className="h-14 text-lg font-serif font-bold rounded-2xl bg-gray-50 border-gray-100 shadow-sm"
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
                    <LinkIcon className="w-3.5 h-3.5" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">
                      Resumen del Evento
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descripción para el calendario..."
                      className="rounded-2xl bg-gray-50 border-gray-100 shadow-sm font-light min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tipo de Evento y Recurrencia */}
          <div className="space-y-4">
            <div className={cn(
                "grid gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 transition-all",
                isMultiDay || allDay ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            )}>
                {!allDay && (
                    <FormField
                    control={form.control}
                    name="is_multi_day"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={(checked) => { field.onChange(checked); if(checked) form.setValue('all_day', false); }} />
                        </FormControl>
                        <FormLabel className="text-xs font-bold text-gray-600">Evento de varios días</FormLabel>
                        </FormItem>
                    )}
                    />
                )}
                {!isMultiDay && (
                <FormField
                    control={form.control}
                    name="all_day"
                    render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => { field.onChange(checked); if(checked) form.setValue('is_multi_day', false); }} />
                        </FormControl>
                        <FormLabel className="text-xs font-bold text-gray-600">Evento de todo el día</FormLabel>
                    </FormItem>
                    )}
                />
                )}
            </div>

            <div className="bg-[var(--puembo-green)]/5 p-6 rounded-[2rem] border border-[var(--puembo-green)]/10 space-y-6">
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-[var(--puembo-green)]" />
                        Evento Recurrente
                      </FormLabel>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        ¿Se repite automáticamente?
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <AnimatePresence>
                {isRecurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-[var(--puembo-green)]/10"
                  >
                    <FormField
                      control={form.control}
                      name="recurrence_pattern"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Frecuencia de repetición
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-white">
                                <SelectValue placeholder="Selecciona frecuencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              {recurrenceOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tiempos */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {isMultiDay ? "Inicio" : "Fecha"}
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
              {isMultiDay && (
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Fin
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
              )}
            </div>

            {!allDay && !isMultiDay && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Hora Inicio
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
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Hora Fin
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
            )}
          </div>

          {/* Configuración Adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Encargado
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-gray-100 shadow-sm">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn("w-3 h-3 rounded-full", c.color)}
                            />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Ubicación
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Auditorio"
                      className="h-12 rounded-xl bg-white border-gray-100 shadow-sm"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

                    {/* Multimedia */}

                    <div className="space-y-4">

                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Póster Promocional</FormLabel>

                      <div className="p-8 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 flex flex-col items-center justify-center gap-4 hover:border-[var(--puembo-green)]/20 group transition-all relative">

                        <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => {

                          const file = e.target.files[0];

                          if (file) setPosterFile({ file }); else setPosterFile(null);

                        }} />

                        <div onClick={() => fileInputRef.current.click()} className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:text-[var(--puembo-green)] cursor-pointer transition-colors">

                          <Plus className="w-6 h-6" />

                        </div>

                        

                        <div className="text-center space-y-3">

                          <p className="text-xs font-bold text-gray-500">

                              {posterFile || event?.poster_url ? "Imagen lista" : "Seleccionar póster"}

                          </p>

                          

                          {posterFile ? (

                              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm animate-in zoom-in-95">

                                  <ImageIcon className="w-3 h-3" />

                                  <span className="truncate max-w-[150px]">{posterFile.file.name}</span>

                              </div>

                          ) : event?.poster_url ? (

                              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--puembo-green)]/20 shadow-sm">

                                  <ImageIcon className="w-3 h-3" />

                                  <span>Póster actual guardado</span>

                              </div>

                          ) : (

                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Formatos: JPG, PNG, WEBP</p>

                          )}

                        </div>

                      </div>

                    </div>

          {/* Form Automation */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="create_form"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-6 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                                    <div className="space-y-1">
                                      <FormLabel className="text-sm font-bold text-emerald-800 italic">¿Crear formulario de registro?</FormLabel>
                                      <p className="text-[10px] text-emerald-600 uppercase tracking-widest">Crea Google Sheet + Carpeta Drive</p>
                                    </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-50">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-8"
            onClick={onCancel}
          >
            Cerrar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            variant="green"
            className="rounded-full px-10 py-7 font-bold shadow-lg shadow-[var(--puembo-green)]/20 hover:-translate-y-0.5 transition-all"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {event?.id ? "Guardar Cambios" : "Programar Evento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
