"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ImageIcon } from "lucide-react";
import { 
  ecuadorToUTC, 
  formatEcuadorDateForInput, 
  formatEcuadorTimeForInput 
} from "@/lib/date-utils";

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
    color: z.string().optional(),
    location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_multi_day) {
      // Validation for multi-day events
      if (!data.start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La fecha de inicio es requerida para eventos de varios días.",
          path: ["start_date"],
        });
      }
      if (!data.end_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de fin es requerida para eventos de varios días.",
          path: ["end_date"],
        });
      }
      if (data.start_date && data.end_date) {
        const startDate = ecuadorToUTC(data.start_date);
        const endDate = ecuadorToUTC(data.end_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Fechas inválidas para evento de varios días.",
            path: ["start_date"],
          });
        } else if (startDate > endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "La fecha de fin debe ser posterior o igual a la fecha de inicio.",
            path: ["end_date"],
          });
        }
      }
    } else if (data.all_day) {
      // Validation for single-day all-day events
      if (!data.start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La fecha del evento es requerida para eventos de todo el día.",
          path: ["start_date"],
        });
      }
    } else {
      // Validation for single-day time-specific events
      if (!data.start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha es requerida.",
          path: ["start_date"],
        });
      }
      if (!data.start_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La hora de inicio es requerida.",
          path: ["start_time"],
        });
      }
      if (!data.end_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La hora de fin es requerida.",
          path: ["end_time"],
        });
      }
      if (data.start_time && data.end_time) {
        const [startHours, startMinutes] = data.start_time
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = data.end_time.split(":").map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (startTotalMinutes >= endTotalMinutes) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La hora de fin debe ser posterior a la hora de inicio.",
            path: ["end_time"],
          });
        }
      }
    }
  });

// Helper function to format dates and times from event data
const formatEventData = (event) => {
  if (!event) return {};

  if (event.is_multi_day) {
    // Multi-day events: extract dates only
    return {
      start_date: formatEcuadorDateForInput(event.start_time),
      end_date: formatEcuadorDateForInput(event.end_time),
      start_time: "",
      end_time: "",
    };
  } else if (event.all_day) {
    // All-day events: extract date only
    return {
      start_date: formatEcuadorDateForInput(event.start_time),
      end_date: "",
      start_time: "",
      end_time: "",
    };
  } else {
    // Time-specific events: extract date and time separately
    return {
      start_date: formatEcuadorDateForInput(event.start_time),
      end_date: "",
      start_time: formatEcuadorTimeForInput(event.start_time),
      end_time: formatEcuadorTimeForInput(event.end_time),
    };
  }
};

const colorOptions = getEventColorOptions();

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
        color: event.color || "sky",
        location: event.location || "",
      });
    }
  }, [event, form]);

  const onSubmit = (data) => {
    let start_time_utc, end_time_utc;

    if (data.is_multi_day) {
      // Multi-day events: Usar inicio y fin del día en Ecuador
      start_time_utc = ecuadorToUTC(data.start_date, "00:00").toISOString();
      end_time_utc = ecuadorToUTC(data.end_date, "23:59").toISOString();
    } else if (data.all_day) {
      // All-day events: Usar inicio y fin del día en Ecuador
      start_time_utc = ecuadorToUTC(data.start_date, "00:00").toISOString();
      end_time_utc = ecuadorToUTC(data.start_date, "23:59").toISOString();
    } else {
      // Time-specific events
      start_time_utc = ecuadorToUTC(data.start_date, data.start_time).toISOString();
      end_time_utc = ecuadorToUTC(data.start_date, data.end_time).toISOString();
    }

    // Asegurar que los campos booleanos se envíen correctamente
    const finalData = {
      title: data.title,
      description: data.description || "",
      start_time: start_time_utc,
      end_time: end_time_utc,
      create_form: Boolean(data.create_form),
      regenerate_form: Boolean(data.regenerate_form),
      all_day: Boolean(data.all_day),
      is_multi_day: Boolean(data.is_multi_day), // Asegurar que se envía como boolean
      color: data.color || "sky",
      location: data.location || "",
      // Agregar registration_link si existe
      ...(data.registration_link && {
        registration_link: data.registration_link,
      }),
    };

    onSave(finalData, posterFile);
  };

  const hasExistingForm = event?.registration_link;

  const allDay = useWatch({
    control: form.control,
    name: "all_day",
  });

  const isMultiDay = useWatch({
    control: form.control,
    name: "is_multi_day",
  });

  // Watch for changes in is_multi_day to reset all_day
  useEffect(() => {
    if (isMultiDay) {
      form.setValue("all_day", false);
    }
  }, [isMultiDay, form]);

  // Watch for changes in all_day to reset is_multi_day
  useEffect(() => {
    if (allDay) {
      form.setValue("is_multi_day", false);
    }
  }, [allDay, form]);

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
          name="is_multi_day"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Evento de varios días</FormLabel>
                <p className="text-sm text-gray-600">
                  Marcar si el evento dura más de un día
                </p>
              </div>
            </FormItem>
          )}
        />

        {!isMultiDay && (
          <FormField
            control={form.control}
            name="all_day"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Evento de todo el día</FormLabel>
                  <p className="text-sm text-gray-600">
                    Marcar si el evento dura todo el día sin horarios
                    específicos
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Date and time inputs based on event type */}
        {isMultiDay ? (
          // Multi-day events: start and end dates
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Inicio</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Fin</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : allDay ? (
          // All-day events: just date
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha del Evento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          // Time-specific events: date, start time, end time
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Evento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Inicio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                    <FormLabel>Hora de Fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Encargado del Evento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full ${color.color}`}
                          />
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
                        setPosterFile({
                          file,
                          width: img.width,
                          height: img.height,
                        });
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
                                    {posterFile && (
                                      <span className="text-sm text-gray-500 truncate max-w-[200px]">
                                        {posterFile.file.name}
                                      </span>
                                    )}
              
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
                    Se creará automáticamente un formulario, una hoja de cálculo
                    y una carpeta en Google Drive para almacenar las imágenes
                    que suban los usuarios que llenen el formulario
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        ) : !hasExistingForm ? (
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
                    Este evento no tiene formulario. Marca esta opción para
                    crear uno
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        ) : (
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
                    ⚠️ Esto eliminará el formulario actual y creará uno nuevo
                    con la misma URL. Se creará un nuevo Google Sheet. La
                    anterior hoja de cálculo y la carpeta de Google Drive,
                    seguirán guardadas.
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Guardando..."
              : event?.id
                ? "Actualizar Evento"
                : "Crear Evento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
