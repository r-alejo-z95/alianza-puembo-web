"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ImageIcon, FileUp, Calendar as CalendarIcon, FileText } from "lucide-react";
import Image from "next/image";
import { getNowInEcuador, formatInEcuador } from "@/lib/date-utils";

// Simple Loading Spinner Components
const LoadingSpinner = () => (
  <div className="flex flex-col gap-4 justify-center items-center h-full">
    <div className="animate-spin rounded-full h-18 w-18 border-b-4 border-(--puembo-green)" />
    <p>Cargando formulario</p>
  </div>
);

const SendingSpinner = () => (
  <div className="flex flex-col gap-4 justify-center items-center h-full">
    <div className="animate-spin rounded-full h-18 w-18 border-b-4 border-(--puembo-green)" />
    <p>Enviando formulario</p>
  </div>
);

export default function PublicForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fileNames, setFileNames] = useState({});
  const { slug } = useParams();

  useEffect(() => {
    const fetchForm = async () => {
      if (!slug) return;
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("forms")
        .select("*, form_fields(*)")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching form:", error);
        toast.error("No se pudo cargar el formulario.");
      } else {
        data.form_fields.sort((a, b) => {
          const orderA = a.order_index ?? a.order ?? 0;
          const orderB = b.order_index ?? b.order ?? 0;
          return orderA - orderB;
        });
        setForm(data);
      }
      setLoading(false);
    };

    fetchForm();
  }, [slug]);

  const onSubmit = async (data) => {
    setSending(true);
    const supabase = createClient();
    try {
      const processedData = {};
      const rawDataForDb = {};

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          const fieldDef = form.form_fields.find((f) => f.label === key);
          const fieldType = fieldDef?.type || fieldDef?.field_type;

          if (value instanceof FileList && value.length > 0) {
            const file = value[0];
            const reader = new FileReader();
            const fileReadPromise = new Promise((resolve, reject) => {
              reader.onload = () => {
                resolve({
                  type: "file",
                  name: file.name,
                  data: reader.result.split(",")[1], // Base64 content
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            processedData[key] = await fileReadPromise;
            rawDataForDb[key] = `[Archivo: ${file.name}]`; 
          } else if (fieldType === "checkbox" && typeof value === "object" && value !== null) {
            const selectedLabels = Object.keys(value)
              .filter((optionKey) => value[optionKey])
              .map((optionKey) => {
                const option = fieldDef.options.find((opt) => opt.value === optionKey);
                return option ? option.label : optionKey;
              });
            processedData[key] = selectedLabels.join("\n");
            rawDataForDb[key] = selectedLabels;
          } else if (fieldType === "radio") {
            const option = fieldDef.options.find((opt) => opt.value === value);
            processedData[key] = option ? option.label : value;
            rawDataForDb[key] = option ? option.label : value;
          } else if (Array.isArray(value)) {
            processedData[key] = value.join("\n");
            rawDataForDb[key] = value;
          } else {
            processedData[key] = value;
            rawDataForDb[key] = value;
          }
        }
      }

      const timestamp = formatInEcuador(getNowInEcuador(), "d/M/yyyy HH:mm:ss");
      processedData.Timestamp = timestamp;
      rawDataForDb.Timestamp = timestamp;

      const { data: edgeFunctionData, error: edgeFunctionError } = 
        await supabase.functions.invoke("sheets-drive-integration", {
          body: JSON.stringify({
            formId: form.id,
            formData: processedData,
          }),
        });

      if (edgeFunctionError) {
        console.error("Error invoking Edge Function:", edgeFunctionError);
        toast.error(`Error al enviar a Google Sheets: ${edgeFunctionError.message || "Error desconocido"}`);
      } else if (edgeFunctionData.error) {
        console.error("Edge Function returned error:", edgeFunctionData.error);
        toast.error(`Error de Google Sheets: ${edgeFunctionData.error}`);
      }

      const { error: dbError } = await supabase
        .from("form_submissions")
        .insert([
          {
            form_id: form.id,
            data: rawDataForDb,
            ip_address: "Not captured (Client-side)",
            user_agent: navigator.userAgent,
          },
        ]);

      if (dbError) {
        console.error("Error saving to Supabase DB:", dbError);
      }

      if (!edgeFunctionError && !dbError && !edgeFunctionData?.error) {
        toast.success("Formulario enviado con éxito!");
        reset();
        setFileNames({});
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error(`Error inesperado al enviar el formulario: ${error.message || "Error desconocido"}`);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Formulario no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {sending ? (
        <SendingSpinner />
      ) : (
        <Card className="w-full max-w-2xl">
          {form.image_url && (
            <Image
              src={form.image_url}
              alt={form.title}
              width={672}
              height={350}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-auto object-cover"
            />
          )}
          <CardHeader>
            <CardTitle className="mb-4">{form.title}</CardTitle>
            {form.description && (
              <CardDescription
                className="text-gray-600"
                dangerouslySetInnerHTML={{ __html: form.description }}
              />
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {form.form_fields.map((field) => {
                const fieldId = `field-${field.id}`;
                const fieldType = field.type || field.field_type;
                const isRequired = field.required ?? field.is_required;
                const placeholder = field.placeholder || "";

                const registrationProps = register(field.label, {
                  required: isRequired,
                });

                return (
                  <div key={field.id} className="space-y-3">
                    {/* Field Label and Attachment * /
                    <div>
                      <Label htmlFor={fieldId} className="mb-2 block text-base font-medium">
                        {field.label}
                        {isRequired && " *"}
                      </Label>
                      {field.attachment_url && (
                        <div className="mb-4">
                          {field.attachment_type === 'image' ? (
                            <Image 
                              src={field.attachment_url} 
                              alt="Adjunto de pregunta" 
                              width={500} 
                              height={300} 
                              className="rounded-md border max-h-[400px] w-auto object-contain" 
                            />
                          ) : (
                            <a 
                              href={field.attachment_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-2 p-3 bg-gray-50 border rounded-md w-fit hover:bg-gray-100 transition-colors"
                            >
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className="text-sm text-blue-700 underline">Ver documento adjunto</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Input Field */}
                    {(() => {
                      switch (fieldType) {
                        case "text":
                          return (
                            <Input id={fieldId} placeholder={placeholder} {...registrationProps} />
                          );
                        case "email":
                          return (
                            <Input id={fieldId} type="email" placeholder={placeholder} {...registrationProps} />
                          );
                        case "number":
                          return (
                            <Controller
                              name={field.label}
                              control={control}
                              rules={{ required: isRequired }}
                              render={({ field: controllerField }) => (
                                <Input
                                  id={fieldId}
                                  type="text"
                                  inputMode="numeric"
                                  placeholder={placeholder}
                                  value={controllerField.value || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^[0-9+\- ]*$/.test(val)) {
                                      controllerField.onChange(val);
                                    }
                                  }}
                                  onBlur={controllerField.onBlur}
                                />
                              )}
                            />
                          );
                        case "textarea":
                          return (
                            <Textarea id={fieldId} placeholder={placeholder} className="min-h-[100px]" {...registrationProps} />
                          );
                        case "date":
                          return (
                            <Input id={fieldId} type="date" {...registrationProps} className="w-full md:w-auto" />
                          );
                        case "radio":
                          return (
                            <Controller
                              name={field.label}
                              control={control}
                              rules={{ required: isRequired }}
                              render={({ field: controllerField }) => (
                                <RadioGroup
                                  onValueChange={controllerField.onChange}
                                  value={controllerField.value}
                                  className="mt-2"
                                >
                                  {field.options.map((option) => (
                                    <div key={option.id} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option.value} id={`${fieldId}-${option.id}`} />
                                      <Label htmlFor={`${fieldId}-${option.id}`} className="font-normal">{option.label}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              )}
                            />
                          );
                        case "checkbox":
                          return (
                            <div className="space-y-2">
                              {field.options.map((option) => (
                                <Controller
                                  key={option.id}
                                  name={`${field.label}.${option.value}`}
                                  control={control}
                                  render={({ field: controllerField }) => (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${fieldId}-${option.id}`}
                                        checked={controllerField.value}
                                        onCheckedChange={controllerField.onChange}
                                      />
                                      <Label htmlFor={`${fieldId}-${option.id}`} className="font-normal">{option.label}</Label>
                                    </div>
                                  )}
                                />
                              ))}
                            </div>
                          );
                        case "file":
                        case "image":
                          return (
                            <div className="flex items-center space-x-2">
                              <Input
                                id={fieldId}
                                type="file"
                                accept={fieldType === 'image' ? "image/*" : "*/*"}
                                className="hidden"
                                {...registrationProps}
                                onChange={(e) => {
                                  registrationProps.onChange(e); // Call RHF's onChange
                                  const file = e.target.files[0];
                                  setFileNames((prev) => ({
                                    ...prev,
                                    [field.id]: file ? file.name : "Ningún archivo seleccionado",
                                  }));
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById(fieldId).click()}
                              >
                                {fieldType === 'image' ? <ImageIcon className="h-4 w-4 mr-2" /> : <FileUp className="h-4 w-4 mr-2" />}
                                {fieldType === 'image' ? 'Subir Imagen' : 'Subir Archivo'}
                              </Button>
                              {fileNames[field.id] && (
                                <span className="text-sm text-gray-500">{fileNames[field.id]}</span>
                              )}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}

                    {errors[field.label] && (
                      <p className="text-red-500 text-sm mt-1">Este campo es requerido.</p>
                    )}
                  </div>
                );
              })}
              <Button className="w-full bg-[var(--puembo-green)] hover:bg-green-700 text-white font-bold py-3 text-lg" type="submit">
                Enviar Respuesta
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}