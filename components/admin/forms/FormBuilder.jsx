'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import RichTextEditor from './RichTextEditor';

const fieldSchema = z.object({
  id: z.string().default(() => uuidv4()),
  field_type: z.enum(['text', 'radio', 'checkbox', 'file']),
  label: z.string().min(1, 'El label del campo es requerido.'),
  options: z.array(z.object({
    id: z.string().default(() => uuidv4()),
    value: z.string(),
    label: z.string().min(1, 'El label de la opción es requerido.'),
  })).optional(),
  is_required: z.boolean().default(false),
  order: z.number(),
});

const formSchema = z.object({
  title: z.string().min(3, 'El título del formulario es requerido.'),
  description: z.string().optional(),
  image_url: z.string().url('URL de imagen inválida.').optional().or(z.literal('')),
  fields: z.array(fieldSchema),
});

export default function FormBuilder({ form: initialForm, onSave, onCancel }) {
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
      fields: [],
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  useEffect(() => {
    if (initialForm) {
      const preparedFields = (initialForm.form_fields || []).map(field => ({
        ...field,
        id: field.id || uuidv4(),
        options: (field.options || []).map(option => ({
          ...option,
          id: option.id || uuidv4(),
          value: option.value || option.label.toLowerCase().replace(/[^a-z0-9]+/g, ''),
        })),
      })).sort((a, b) => a.order - b.order);

      form.reset({
        title: initialForm.title || '',
        description: initialForm.description || '',
        image_url: initialForm.image_url || '',
        fields: preparedFields,
      });
    }
  }, [initialForm, form]);

  const addField = (type) => {
    const newOrder = fields.length > 0 ? Math.max(...fields.map(f => f.order)) + 1 : 0;
    append({
      id: uuidv4(),
      field_type: type,
      label: '',
      options: type === 'radio' || type === 'checkbox' ? [{ value: '', label: '', id: uuidv4() }] : undefined,
      is_required: false,
      order: newOrder,
    });
  };

  const addOption = (fieldIndex) => {
    const field = form.getValues(`fields.${fieldIndex}`);
    const newOptions = [...(field.options || []), { value: '', label: '', id: uuidv4() }];
    update(fieldIndex, { ...field, options: newOptions });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const field = form.getValues(`fields.${fieldIndex}`);
    const newOptions = field.options.filter((_, i) => i !== optionIndex);
    update(fieldIndex, { ...field, options: newOptions });
  };

  const onSubmit = (data) => {
    const orderedFields = data.fields.map((field, index) => ({ ...field, order: index }));
    onSave({ ...data, fields: orderedFields }, imageFile);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Formulario</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Registro de Voluntarios" {...field} />
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
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Imagen del Formulario (Opcional)</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Seleccionar Imagen
              </Button>
              {imageFile && <span className="text-sm text-gray-500">{imageFile.name}</span>}
              {!imageFile && initialForm?.image_url && (
                <span className="text-sm text-gray-500">{initialForm.image_url.split('/').pop()} (actual)</span>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="text-lg font-semibold">Campos del Formulario</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col space-y-2 p-2 border rounded-md">
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon" type="button" className="cursor-grab" onMouseDown={(e) => { /* Implement drag logic later */ }}>
                  <GripVertical className="h-4 w-4" />
                </Button>
                <span className="font-medium capitalize">{field.field_type}</span>
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <FormField
                control={form.control}
                name={`fields.${index}.label`}
                render={({ field: itemField }) => (
                  <FormItem>
                    <FormLabel>Label del Campo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tu Nombre Completo" {...itemField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`fields.${index}.is_required`}
                render={({ field: itemField }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={itemField.value}
                        onCheckedChange={itemField.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Requerido</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {(field.field_type === 'radio' || field.field_type === 'checkbox') && (
                <div className="space-y-2 pl-4 max-h-48 overflow-y-auto">
                  <h4 className="font-medium">Opciones</h4>
                  {field.options?.map((option, optionIndex) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Controller
                        control={form.control}
                        name={`fields.${index}.options.${optionIndex}.label`}
                        render={({ field: optionField }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input
                                placeholder="Label de la opción"
                                {...optionField}
                                onChange={(e) => {
                                  optionField.onChange(e);
                                  const newLabel = e.target.value;
                                  const newValue = newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '');
                                  form.setValue(`fields.${index}.options.${optionIndex}.value`, newValue);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeOption(index, optionIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addOption(index)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Añadir Opción
                  </Button>
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" className="justify-start" onClick={() => addField('text')}>
              <PlusCircle className="h-4 w-4 mr-2" /> Añadir Campo de Texto
            </Button>
            <Button type="button" variant="outline" className="justify-start" onClick={() => addField('radio')}>
              <PlusCircle className="h-4 w-4 mr-2" /> Añadir Campo de Radio
            </Button>
            <Button type="button" variant="outline" className="justify-start" onClick={() => addField('checkbox')}>
              <PlusCircle className="h-4 w-4 mr-2" /> Añadir Campo de Checkbox
            </Button>
            <Button type="button" variant="outline" className="justify-start" onClick={() => addField('file')}>
              <PlusCircle className="h-4 w-4 mr-2" /> Añadir Campo de Imagen
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar Formulario</Button>
        </div>
      </form>
    </Form>
  );
}