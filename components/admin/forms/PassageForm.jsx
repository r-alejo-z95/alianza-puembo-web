'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { formatEcuadorDateForInput } from '@/lib/date-utils';
import { Loader2 } from 'lucide-react';

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
        week_start_date: formatEcuadorDateForInput(week.week_start_date),
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
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField
          control={form.control}
          name="week_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Semana</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Número de Semana" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="week_start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Inicio de Semana</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`passages.${index}.passage_reference`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{daysOfWeek[index]}</FormLabel>
                <FormControl>
                  <Input placeholder={`Pasaje para ${daysOfWeek[index]}`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={loading} className="w-32">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (week ? 'Actualizar Semana' : 'Crear Semana')}
          </Button>
        </div>
      </form>
    </Form>
  );
}