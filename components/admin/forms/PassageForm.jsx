'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { Loader2, Calendar, BookOpen, Save, X } from 'lucide-react';
import { cn } from "@/lib/utils.ts";

const weekSchema = z.object({
  week_number: z.number().min(1, 'El número de semana debe ser al menos 1.'),
  week_start_date: z.string().min(1, 'La fecha de inicio de semana es requerida.'),
  passages: z.array(z.object({
    day_of_week: z.string(),
    passage_reference: z.string().min(3, 'La referencia del pasaje debe tener al menos 3 caracteres.'),
  })),
});

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function PassageForm({ week, onSave, onCancel, loading }) {
  const form = useForm({
    resolver: zodResolver(weekSchema),
    defaultValues: {
      week_number: 0,
      week_start_date: '',
      passages: daysOfWeek.map(day => ({ day_of_week: day, passage_reference: '' }))
    },
  });

  useEffect(() => {
    if (week) {
      form.reset({
        week_number: week.week_number,
        week_start_date: week.week_start_date, // 👈 Literal string YYYY-MM-DD
        passages: daysOfWeek.map(day => {
            const passage = week.passages.find(p => p.day_of_week === day);
            return { day_of_week: day, passage_reference: passage ? passage.passage_reference : '' };
        })
      });
    }
  }, [week, form]);

  const { fields } = useFieldArray({
    control: form.control,
    name: "passages"
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-10">
        <div className="space-y-8">
          {/* Configuración de Semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
            <FormField
              control={form.control}
              name="week_number"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Nº de Semana</FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 42" 
                        className="h-12 rounded-xl border-gray-200 bg-white"
                        value={field.value || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(val ? parseInt(val, 10) : 0);
                        }} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="week_start_date"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Inicio de Semana</FormLabel>
                  </div>
                  <FormControl>
                    <Input type="date" className="h-12 rounded-xl border-gray-200 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Pasajes Diarios */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <BookOpen className="w-4 h-4 text-[var(--puembo-green)]" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Lecturas Diarias</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {fields.map((field, index) => (
                <FormField
                    key={field.id}
                    control={form.control}
                    name={`passages.${index}.passage_reference`}
                    render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center gap-4 space-y-0">
                        <FormLabel className="sm:w-24 text-[10px] font-black uppercase tracking-widest text-gray-400">{daysOfWeek[index]}</FormLabel>
                        <FormControl>
                        <Input 
                            placeholder={`Referencia bíblica para el ${daysOfWeek[index].toLowerCase()}`} 
                            className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all shadow-sm flex-grow"
                            {...field} 
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t border-gray-50">
          <Button 
            type="button" 
            variant="ghost" 
            className="rounded-full px-8 text-gray-400"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" /> Descartar
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            variant="green"
            className="rounded-full px-10 py-7 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {week ? 'Guardar Cambios' : 'Publicar Semana'}
          </Button>
        </div>
      </form>
    </Form>
  );
}