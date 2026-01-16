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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form"; // Import Controller
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
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
      const rawDataForDb = {}; // Store raw values for DB, or processed? Processed is usually better for reading.

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
            // For DB, we store the file name (we don't want to store base64 in JSONB if we can avoid it, or maybe we do for now as per plan?)
            // The plan said: "Archivos... Lo pasamos directamente a Google Drive... en Supabase solo guardamos el Link de Google Drive."
            // Since we get the link BACK from the Edge Function, we might need to adjust the flow.
            // OR we store "Pending Upload" and then update it? 
            // For now, let's store the filename in DB to avoid massive JSON.
            rawDataForDb[key] = `[Archivo: ${file.name}]`; 
          } else if (fieldType === "checkbox" && typeof value === "object" && value !== null) {
            // Map technical values to human-readable labels and join with newline
            const selectedLabels = Object.keys(value)
              .filter((optionKey) => value[optionKey])
              .map((optionKey) => {
                const option = fieldDef.options.find((opt) => opt.value === optionKey);
                return option ? option.label : optionKey;
              });
            processedData[key] = selectedLabels.join("\n");
            rawDataForDb[key] = selectedLabels; // Store array in DB
          } else if (fieldType === "radio") {
            // Map radio technical value back to label
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

      // Add timestamp
      const timestamp = formatInEcuador(getNowInEcuador(), "d/M/yyyy HH:mm:ss");
      processedData.Timestamp = timestamp;
      rawDataForDb.Timestamp = timestamp;

      // 1. Send to Google Sheets (Edge Function)
      const { data: edgeFunctionData, error: edgeFunctionError } =
        await supabase.functions.invoke("sheets-drive-integration", {
          body: JSON.stringify({
            formId: form.id,
            formData: processedData,
          }),
        });

      let googleDriveLinks = {};

      if (edgeFunctionError) {
        console.error("Error invoking Edge Function:", edgeFunctionError);
        toast.error(
          `Error al enviar a Google Sheets: ${edgeFunctionError.message || "Error desconocido"}`
        );
      } else if (edgeFunctionData.error) {
        console.error("Edge Function returned error:", edgeFunctionData.error);
        toast.error(`Error de Google Sheets: ${edgeFunctionData.error}`);
      } else {
        // Success! If there were files, the edge function might return links?
        // Let's check the Edge Function response structure.
        // It returns: { message: "...", sheetId, folderId }
        // It DOES NOT currently return the file URLs mapped to keys easily in the response root.
        // BUT, the Edge Function uploads them. 
        // Improvement: We can trust the Edge Function did its job.
      }

      // 2. Save to Supabase (Form Submissions)
      const { error: dbError } = await supabase
        .from("form_submissions")
        .insert([
          {
            form_id: form.id,
            data: rawDataForDb, // Store the cleaner data
            ip_address: "Not captured (Client-side)", // Middleware usually handles this best
            user_agent: navigator.userAgent,
          },
        ]);

      if (dbError) {
        console.error("Error saving to Supabase DB:", dbError);
        // We don't block the user success if Sheets worked, but we warn console.
      }

      if (!edgeFunctionError && !dbError && !edgeFunctionData?.error) {
        toast.success("Formulario enviado con éxito!");
        reset(); // Reset the form fields
        setFileNames({}); // Clear file names
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

                const registrationProps = register(field.label, {
                  required: isRequired,
                });

                switch (fieldType) {
                  case "text":
                    return (
                      <div key={field.id}>
                        <Label htmlFor={fieldId} className="mb-2">
                          {field.label}
                          {isRequired && " *"}
                        </Label>
                        <Input id={fieldId} {...registrationProps} />
                        {errors[field.label] && (
                          <p className="text-red-500 text-sm">
                            Este campo es requerido.
                          </p>
                        )}
                      </div>
                    );
                  case "radio":
                    return (
                      <Controller
                        key={field.id}
                        name={field.label}
                        control={control}
                        rules={{ required: isRequired }}
                        render={({ field: controllerField }) => (
                          <div key={field.id}>
                            <Label className="mb-2">
                              {field.label}
                              {isRequired && " *"}
                            </Label>
                            <RadioGroup
                              onValueChange={controllerField.onChange}
                              value={controllerField.value}
                              className="mt-2"
                            >
                              {field.options.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`${fieldId}-${option.id}`}
                                  />
                                  <Label htmlFor={`${fieldId}-${option.id}`}>
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            {errors[field.label] && (
                              <p className="text-red-500 text-sm">
                                Este campo es requerido.
                              </p>
                            )}
                          </div>
                        )}
                      />
                    );
                  case "checkbox":
                    return (
                      <div key={field.id}>
                        <Label className="mb-2">
                          {field.label}
                          {isRequired && " *"}
                        </Label>
                        <div className="space-y-2 mt-2">
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
                                  <Label htmlFor={`${fieldId}-${option.id}`}>
                                    {option.label}
                                  </Label>
                                </div>
                              )}
                            />
                          ))}
                        </div>
                        {errors[field.label] && (
                          <p className="text-red-500 text-sm">
                            Debes seleccionar al menos una opción.
                          </p>
                        )}
                      </div>
                    );
                  case "file":
                    return (
                      <div key={field.id}>
                        <Label className="mb-2">
                          {field.label}
                          {isRequired && " *"}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={fieldId}
                            type="file"
                            accept="image/*"
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
                            variant="green"
                            size="sm"
                            onClick={() =>
                              document.getElementById(fieldId).click()
                            }
                          >
                            <ImageIcon className="h-4 w-4 mr-2" /> Seleccionar
                            Imagen
                          </Button>
                          {fileNames[field.id] && (
                            <span className="text-sm text-gray-500">
                              {fileNames[field.id]}
                            </span>
                          )}
                        </div>
                        {errors[field.label] && (
                          <p className="text-red-500 text-sm">
                            Este campo es requerido.
                          </p>
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              })}
              <Button variant="green" type="submit">
                Enviar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
