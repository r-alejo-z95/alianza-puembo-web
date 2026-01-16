'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlusCircle, Trash2, GripVertical, Image as ImageIcon, 
  Type, CheckSquare, CircleDot, FileUp, MoreVertical, X,
  AlignLeft, Hash, Mail, Calendar as CalendarIcon
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import RichTextEditor from './RichTextEditor';
import { cn } from '@/lib/utils';

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const fieldSchema = z.object({
  id: z.string().default(() => uuidv4()),
  type: z.enum(['text', 'textarea', 'number', 'email', 'date', 'radio', 'checkbox', 'file']),
  label: z.string().min(1, 'El label del campo es requerido.'),
  options: z.array(z.object({
    id: z.string().default(() => uuidv4()),
    value: z.string(),
    label: z.string().min(1, 'El label de la opción es requerido.'),
  })).optional(),
  required: z.boolean().default(false),
  order_index: z.number(),
  placeholder: z.string().optional(),
});

const formSchema = z.object({
  title: z.string().min(3, 'El título del formulario es requerido.'),
  description: z.string().optional(),
  image_url: z.string().url('URL de imagen inválida.').optional().or(z.literal('')),
  fields: z.array(fieldSchema),
});

// Map of Field Types to Icons and Labels
const FIELD_TYPES = {
  text: { label: 'Texto Corto', icon: <Type className="w-4 h-4" /> },
  textarea: { label: 'Párrafo', icon: <AlignLeft className="w-4 h-4" /> },
  number: { label: 'Número', icon: <Hash className="w-4 h-4" /> },
  email: { label: 'Email', icon: <Mail className="w-4 h-4" /> },
  date: { label: 'Fecha', icon: <CalendarIcon className="w-4 h-4" /> },
  radio: { label: 'Varias Opciones', icon: <CircleDot className="w-4 h-4" /> },
  checkbox: { label: 'Casillas', icon: <CheckSquare className="w-4 h-4" /> },
  file: { label: 'Subir Archivo', icon: <FileUp className="w-4 h-4" /> },
};

// Sortable Item Component
function SortableFieldCard({ id, index, field, form, remove, activeId, setActiveId, addOption, removeOption, updateFieldType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: 'relative',
  };

  const isActive = activeId === id;

  const handleClick = (e) => {
    // Prevent activation if clicking specific interactive elements
    if (e.target.closest('button') || e.target.closest('.drag-handle') || e.target.closest('[role="combobox"]')) return;
    setActiveId(id);
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card 
        className={cn(
          "transition-all duration-200 border-l-4",
          isActive ? "border-l-blue-500 shadow-md ring-1 ring-blue-100" : "border-l-transparent hover:border-l-gray-300",
          isDragging && "opacity-50"
        )}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          {isActive ? (
            // EDIT MODE
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-grow space-y-4">
                  <FormField
                    control={form.control}
                    name={`fields.${index}.label`}
                    render={({ field: itemField }) => (
                      <Input 
                        placeholder="Pregunta" 
                        className="text-lg font-medium border-x-0 border-t-0 border-b-2 rounded-none px-0 focus-visible:ring-0 bg-gray-50/50" 
                        {...itemField} 
                      />
                    )}
                  />
                  
                  {/* Options for Select-like fields */}
                  {(field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="space-y-3 pl-2">
                      {field.options?.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center gap-2 group">
                          {field.type === 'radio' ? <CircleDot className="w-4 h-4 text-gray-400" /> : <CheckSquare className="w-4 h-4 text-gray-400" />}
                          <FormField
                            control={form.control}
                            name={`fields.${index}.options.${optionIndex}.label`}
                            render={({ field: optionField }) => (
                              <Input
                                placeholder={`Opción ${optionIndex + 1}`}
                                className="flex-grow h-8 border-none hover:border-b hover:border-gray-200 focus-visible:border-b-blue-500 rounded-none px-1"
                                {...optionField}
                                onChange={(e) => {
                                  optionField.onChange(e);
                                  const newLabel = e.target.value;
                                  const newValue = newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
                                  form.setValue(`fields.${index}.options.${optionIndex}.value`, newValue || uuidv4());
                                }}
                              />
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 h-8 w-8"
                            onClick={() => removeOption(index, optionIndex)}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => addOption(index)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" /> Añadir opción
                      </Button>
                    </div>
                  )}

                  {/* Placeholder for text-like fields */}
                  {(['text', 'textarea', 'email', 'number'].includes(field.type)) && (
                     <FormField
                        control={form.control}
                        name={`fields.${index}.placeholder`}
                        render={({ field: itemField }) => (
                           <Input 
                              placeholder="Texto de ayuda (placeholder)..." 
                              className="text-sm text-gray-500 border-none border-b border-gray-200 rounded-none px-0 focus-visible:ring-0" 
                              {...itemField} 
                           />
                        )}
                     />
                  )}
                </div>
                
                {/* Type Selector Dropdown */}
                <div className="w-64 shrink-0">
                   <Select 
                      value={field.type} 
                      onValueChange={(value) => updateFieldType(index, value)}
                   >
                      <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                         <SelectValue>
                            <div className="flex items-center gap-2">
                               {FIELD_TYPES[field.type]?.icon}
                               <span>{FIELD_TYPES[field.type]?.label}</span>
                            </div>
                         </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                         {Object.entries(FIELD_TYPES).map(([key, { label, icon }]) => (
                            <SelectItem key={key} value={key}>
                               <div className="flex items-center gap-2">
                                  {icon}
                                  <span>{label}</span>
                               </div>
                            </SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t mt-2">
                 <div className="flex items-center gap-2 border-r pr-4">
                    <Trash2 
                      className="w-5 h-5 text-gray-500 hover:text-red-600 cursor-pointer transition-colors" 
                      onClick={() => remove(index)}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Obligatorio</span>
                    <FormField
                      control={form.control}
                      name={`fields.${index}.required`}
                      render={({ field: itemField }) => (
                        <Switch
                          checked={itemField.value}
                          onCheckedChange={itemField.onChange}
                        />
                      )}
                    />
                 </div>
                 <div className="border-l pl-4 flex items-center cursor-move drag-handle" {...attributes} {...listeners}>
                    <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                 </div>
              </div>
            </div>
          ) : (
            // PREVIEW MODE
            <div className="group flex items-start gap-4">
               <div className="flex-grow space-y-2">
                  <p className="text-base font-medium">
                    {field.label || "Pregunta sin título"}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  
                  {field.type === 'text' && (
                    <Input disabled placeholder={field.placeholder || "Texto de respuesta corta"} className="border-dotted bg-gray-50 max-w-md" />
                  )}
                  {field.type === 'textarea' && (
                    <div className="h-20 w-full max-w-md border border-dotted border-gray-300 bg-gray-50 rounded-md p-2 text-sm text-gray-400">
                       {field.placeholder || "Texto de respuesta larga"}
                    </div>
                  )}
                  {field.type === 'email' && (
                    <Input disabled placeholder={field.placeholder || "ejemplo@correo.com"} className="border-dotted bg-gray-50 max-w-md" />
                  )}
                  {field.type === 'number' && (
                    <Input disabled type="number" placeholder={field.placeholder || "0"} className="border-dotted bg-gray-50 max-w-xs" />
                  )}
                  {field.type === 'date' && (
                    <div className="flex items-center gap-2 border border-dotted border-gray-300 rounded-md p-2 w-fit bg-gray-50 text-gray-400">
                       <CalendarIcon className="w-4 h-4" />
                       <span>dd/mm/aaaa</span>
                    </div>
                  )}
                  
                  {(field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="space-y-2 pl-1">
                      {field.options?.map((option, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                           {field.type === 'radio' ? <CircleDot className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                           <span>{option.label || `Opción ${i+1}`}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {field.type === 'file' && (
                    <div className="border border-gray-200 rounded-md p-3 flex items-center gap-2 w-fit bg-gray-50 text-gray-500">
                       <FileUp className="w-5 h-5" />
                       <span className="text-sm">Subida de archivo</span>
                    </div>
                  )}
               </div>
               
               {/* Drag handle visible on hover even in preview */}
               <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move drag-handle p-2" {...attributes} {...listeners}>
                  <GripVertical className="w-5 h-5 text-gray-400" />
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Floating Sidebar Component
function ToolsSidebar({ onAddField }) {
  return (
    <div className="sticky top-28 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-200 w-fit h-fit">
      <div className="flex flex-col gap-1 items-center">
         <TooltipButton onClick={() => onAddField('text')} icon={<PlusCircle className="w-6 h-6 text-blue-600" />} label="Añadir Pregunta" className="mb-2 hover:bg-blue-50" />
         
         <div className="w-8 h-[1px] bg-gray-200 my-1"></div>
         
         <TooltipButton onClick={() => onAddField('text')} icon={<Type className="w-5 h-5" />} label="Texto Corto" />
         <TooltipButton onClick={() => onAddField('textarea')} icon={<AlignLeft className="w-5 h-5" />} label="Párrafo" />
         <TooltipButton onClick={() => onAddField('radio')} icon={<CircleDot className="w-5 h-5" />} label="Opción Múltiple" />
         <TooltipButton onClick={() => onAddField('checkbox')} icon={<CheckSquare className="w-5 h-5" />} label="Casillas" />
         <TooltipButton onClick={() => onAddField('date')} icon={<CalendarIcon className="w-5 h-5" />} label="Fecha" />
         <TooltipButton onClick={() => onAddField('file')} icon={<FileUp className="w-5 h-5" />} label="Subir Archivo" />
      </div>
    </div>
  );
}

function TooltipButton({ onClick, icon, label, className }) {
  return (
    <Button 
      type="button" 
      variant="ghost" 
      size="icon" 
      className={cn("text-gray-500 hover:text-blue-600 hover:bg-gray-100", className)}
      onClick={onClick}
      title={label}
    >
      {icon}
    </Button>
  );
}

export default function FormBuilder({ form: initialForm, onSave, onCancel, isFullScreen = false }) {
  const [imageFile, setImageFile] = useState(null);
  const [activeId, setActiveId] = useState(null);
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

  // Sensors for Dnd
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialForm) {
      const preparedFields = (initialForm.form_fields || []).map(field => ({
        ...field,
        id: field.id || uuidv4(),
        type: field.type || field.field_type,
        required: field.required !== undefined ? field.required : field.is_required,
        order_index: field.order_index !== undefined ? field.order_index : field.order,
        placeholder: field.placeholder || '',
        options: (field.options || []).map(option => ({
          ...option,
          id: option.id || uuidv4(),
          value: option.value || option.label.toLowerCase().replace(/[^a-z0-9]+/g, ''),
        })),
      })).sort((a, b) => a.order_index - b.order_index);

      form.reset({
        title: initialForm.title || '',
        description: initialForm.description || '',
        image_url: initialForm.image_url || '',
        fields: preparedFields,
      });
    }
  }, [initialForm, form]);

  const addField = (type = 'text') => {
    const newOrder = fields.length > 0 ? Math.max(...fields.map(f => f.order_index)) + 1 : 0;
    const newId = uuidv4();
    append({
      id: newId,
      type: type,
      label: '',
      options: type === 'radio' || type === 'checkbox' ? [{ value: '', label: '', id: uuidv4() }] : undefined,
      required: false,
      order_index: newOrder,
      placeholder: '',
    });
    setActiveId(newId); // Activate the new field immediately
  };

  const updateFieldType = (index, newType) => {
    const currentField = fields[index];
    const needsOptions = newType === 'radio' || newType === 'checkbox';
    const hasOptions = currentField.options && currentField.options.length > 0;
    
    update(index, {
      ...currentField,
      type: newType,
      options: needsOptions ? (hasOptions ? currentField.options : [{ value: '', label: '', id: uuidv4() }]) : undefined
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
    const orderedFields = data.fields.map((field, index) => ({ ...field, order_index: index }));
    onSave({ ...data, fields: orderedFields }, imageFile);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-700">Editor de Formulario</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={form.handleSubmit(onSubmit)} className="bg-purple-700 hover:bg-purple-800 text-white">Guardar</Button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex justify-center w-full max-w-5xl mx-auto pt-8 px-4 gap-6 relative">
        
        {/* Central Column */}
        <div className="w-full max-w-3xl space-y-4">
          
          {/* Header Card */}
          <Card className="border-t-8 border-t-purple-600 shadow-sm relative group bg-white">
             <CardContent className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <Input 
                      className="text-3xl font-bold border-none px-0 py-2 h-auto focus-visible:ring-0 placeholder:text-gray-300 border-b border-b-transparent focus:border-b-gray-300 rounded-none transition-colors" 
                      placeholder="Título del formulario" 
                      {...field} 
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <div className="relative">
                       <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Descripción del formulario"
                          className="border-none px-0 py-0 min-h-[40px] text-gray-600 focus:ring-0"
                       />
                    </div>
                  )}
                />
                
                {/* Image Upload Trigger */}
                <div className="absolute top-6 right-6">
                   <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                      ref={fileInputRef}
                   />
                   <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => fileInputRef.current.click()}
                      title="Cambiar imagen de encabezado"
                   >
                      <ImageIcon className="w-5 h-5 text-gray-400 hover:text-purple-600" />
                   </Button>
                </div>
                {(imageFile || initialForm?.image_url) && (
                   <div className="mt-4 rounded-md overflow-hidden bg-gray-100 max-h-60 flex justify-center items-center relative group/img">
                      {imageFile ? (
                         <span className="text-sm p-4">{imageFile.name}</span>
                      ) : (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={initialForm.image_url} alt="Header" className="w-full object-cover" />
                      )}
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100"
                        onClick={() => {
                           setImageFile(null);
                           form.setValue('image_url', '');
                        }}
                      >
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                )}
             </CardContent>
          </Card>

          {/* Dnd Context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 pb-20">
                {fields.map((field, index) => (
                  <SortableFieldCard 
                    key={field.id} 
                    id={field.id}
                    index={index}
                    field={field}
                    form={form}
                    remove={remove}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    addOption={addOption}
                    removeOption={removeOption}
                    updateFieldType={updateFieldType}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {fields.length === 0 && (
             <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-dashed border-gray-300 p-8">
                <p>Tu formulario está vacío.</p>
                <p className="text-sm">Usa el menú de la derecha para añadir preguntas.</p>
             </div>
          )}

        </div>

        {/* Right Sidebar (Tools) */}
        <div className="hidden md:block w-fit">
           <ToolsSidebar onAddField={addField} />
        </div>
      </div>
    </div>
  );
}