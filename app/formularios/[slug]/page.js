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
import {
  ImageIcon,
  FileUp,
  Calendar as CalendarIcon,
  FileText,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { getNowInEcuador, formatInEcuador } from "@/lib/date-utils";

// Simple Loading Spinner Components

const LoadingSpinner = () => (
  <div className="flex flex-col gap-6 justify-center items-center h-full animate-in fade-in duration-500">
    <Loader2 className="h-16 w-16 animate-spin text-[var(--puembo-green)]" />
  </div>
);

const SendingSpinner = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="flex flex-col gap-6 justify-center items-center">
      <Loader2 className="h-20 w-20 animate-spin text-[var(--puembo-green)]" />
    </div>
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
          } else if (
            fieldType === "checkbox" &&
            typeof value === "object" &&
            value !== null
          ) {
            const selectedLabels = Object.keys(value)
              .filter((optionKey) => value[optionKey])
              .map((optionKey) => {
                const option = fieldDef.options.find(
                  (opt) => opt.value === optionKey
                );

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

        toast.error(
          `Error al enviar a Google Sheets: ${edgeFunctionError.message || "Error desconocido"}`
        );
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

      toast.error(
        `Error inesperado al enviar el formulario: ${error.message || "Error desconocido"}`
      );
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50/50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-xl font-medium text-gray-600">
            Formulario no encontrado.
          </p>

          <Button variant="green" onClick={() => (window.location.href = "/")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-8 px-4 md:py-12">
      {sending && <SendingSpinner />}

      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
          {form.image_url && (
            <div className="relative w-full aspect-video md:aspect-[21/9]">
              <Image
                src={form.image_url}
                alt={form.title}
                fill
                className="object-cover"
                priority
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          <CardHeader className="space-y-6 pt-8 pb-4">
            <div className="space-y-2">
              <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight font-serif">
                {form.title}
              </CardTitle>

              <div className="h-1.5 w-20 bg-[var(--puembo-green)] rounded-full" />
            </div>

            {form.description && (
              <div
                className="tiptap-content text-gray-600 leading-snug text-sm"
                dangerouslySetInnerHTML={{ __html: form.description }}
              />
            )}

            <hr className="border-t border-gray-100 mt-4" />
          </CardHeader>

          <CardContent className="pt-4 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {form.form_fields.map((field) => {
                const fieldId = `field-${field.id}`;

                const fieldType = field.type || field.field_type;

                const isRequired = field.required ?? field.is_required;

                const placeholder = field.placeholder || "";

                const registrationProps = register(field.label, {
                  required: isRequired,
                });

                return (
                  <div key={field.id} className="group space-y-4">
                    {/* Field Label and Attachment */}

                    <div className="space-y-2">
                      <Label
                        htmlFor={fieldId}
                        className="text-[17px] font-semibold text-gray-800 group-focus-within:text-[var(--puembo-green)] transition-colors"
                      >
                        {field.label}

                        {isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>

                      {field.attachment_url && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 bg-gray-50/50 p-2">
                          {field.attachment_type === "image" ? (
                            <Image
                              src={field.attachment_url}
                              alt="Adjunto de pregunta"
                              width={600}
                              height={400}
                              className="rounded-lg w-full h-auto object-contain max-h-[400px]"
                            />
                          ) : (
                            <a
                              href={field.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[var(--puembo-green)] hover:shadow-md transition-all group/file"
                            >
                              <div className="p-2 bg-blue-50 rounded-lg group-hover/file:bg-[var(--puembo-green)]/10 transition-colors">
                                <FileText className="w-6 h-6 text-blue-600 group-hover/file:text-[var(--puembo-green)]" />
                              </div>

                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700">
                                  Documento adjunto
                                </span>

                                <span className="text-xs text-blue-600 underline">
                                  Haga clic para ver
                                </span>
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Input Field */}

                    <div className="relative">
                      {(() => {
                        switch (fieldType) {
                          case "text":
                            return (
                              <Input
                                id={fieldId}
                                placeholder={placeholder}
                                className="h-12 bg-gray-50/30 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[var(--puembo-green)]/20 focus:border-[var(--puembo-green)] transition-all"
                                {...registrationProps}
                              />
                            );

                          case "email":
                            return (
                              <Input
                                id={fieldId}
                                type="email"
                                placeholder={placeholder}
                                className="h-12 bg-gray-50/30 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[var(--puembo-green)]/20 focus:border-[var(--puembo-green)] transition-all"
                                {...registrationProps}
                              />
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
                                    className="h-12 bg-gray-50/30 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[var(--puembo-green)]/20 focus:border-[var(--puembo-green)] transition-all"
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
                              <Textarea
                                id={fieldId}
                                placeholder={placeholder}
                                className="min-h-[120px] bg-gray-50/30 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[var(--puembo-green)]/20 focus:border-[var(--puembo-green)] transition-all resize-none p-4"
                                {...registrationProps}
                              />
                            );

                          case "date":
                            return (
                              <Input
                                id={fieldId}
                                type="date"
                                className="h-12 w-full md:w-auto bg-gray-50/30 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[var(--puembo-green)]/20 focus:border-[var(--puembo-green)] transition-all"
                                {...registrationProps}
                              />
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
                                    value={controllerField.value || ""}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
                                  >
                                    {field.options.map((option) => (
                                      <div
                                        key={option.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[var(--puembo-green)]/30 hover:shadow-sm transition-all"
                                      >
                                        <RadioGroupItem
                                          value={option.value}
                                          id={`${fieldId}-${option.id}`}
                                          className="text-[var(--puembo-green)] border-gray-300"
                                        />

                                        <Label
                                          htmlFor={`${fieldId}-${option.id}`}
                                          className="font-normal cursor-pointer flex-grow py-1"
                                        >
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                )}
                              />
                            );

                          case "checkbox":
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {field.options.map((option) => (
                                  <Controller
                                    key={option.id}
                                    name={`${field.label}.${option.value}`}
                                    control={control}
                                                                        render={({ field: controllerField }) => (
                                                                          <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[var(--puembo-green)]/30 hover:shadow-sm transition-all">
                                                                            <Checkbox
                                                                              id={`${fieldId}-${option.id}`}
                                                                              checked={controllerField.value}
                                                                              onCheckedChange={
                                                                                controllerField.onChange
                                                                              }
                                                                              className="data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                                                                            />
                                    
                                                                            <Label
                                                                              htmlFor={`${fieldId}-${option.id}`}
                                                                              className="font-normal cursor-pointer flex-grow py-1"
                                                                            >
                                                                              {option.label}
                                                                            </Label>
                                                                          </div>
                                                                        )}
                                    
                                  />
                                ))}
                              </div>
                            );

                          case "file":

                          case "image":
                            return (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <Input
                                  id={fieldId}
                                  type="file"
                                  accept={
                                    fieldType === "image" ? "image/*" : "*/*"
                                  }
                                  className="hidden"
                                  {...registrationProps}
                                  onChange={(e) => {
                                    registrationProps.onChange(e); // Call RHF's onChange

                                    const file = e.target.files[0];

                                    setFileNames((prev) => ({
                                      ...prev,

                                      [field.id]: file
                                        ? file.name
                                        : "Ningún archivo seleccionado",
                                    }));
                                  }}
                                />

                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-12 px-6 border-dashed border-2 hover:border-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/5 transition-all"
                                  onClick={() =>
                                    document.getElementById(fieldId).click()
                                  }
                                >
                                  {fieldType === "image" ? (
                                    <ImageIcon className="h-5 w-5 mr-2 text-gray-500" />
                                  ) : (
                                    <FileUp className="h-5 w-5 mr-2 text-gray-500" />
                                  )}

                                  {fieldType === "image"
                                    ? "Seleccionar Imagen"
                                    : "Seleccionar Archivo"}
                                </Button>

                                {fileNames[field.id] ? (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-[var(--puembo-green)] rounded-full text-sm font-medium">
                                    <FileText className="w-4 h-4" />

                                    <span className="truncate max-w-[200px]">
                                      {fileNames[field.id]}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">
                                    No se ha seleccionado nada
                                  </span>
                                )}
                              </div>
                            );

                          default:
                            return null;
                        }
                      })()}
                    </div>

                    {errors[field.label] && (
                      <p className="text-red-500 text-sm font-medium animate-in slide-in-from-left-2">
                        {field.label} es obligatorio.
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="pt-4">
                <Button
                  className="w-full"
                  variant="green"
                  size="lg"
                  type="submit"
                  disabled={sending}
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Enviar Respuesta"
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Sus respuestas se guardarán de forma segura y se enviarán al
                  equipo de la iglesia.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Image
            src="/brand/logo-puembo.png"
            alt="Logo Alianza Puembo"
            width={120}
            height={40}
            className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
}
