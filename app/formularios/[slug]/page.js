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
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fileNames, setFileNames] = useState({});
  const { slug } = useParams();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm(); // Add control

  useEffect(() => {
    const fetchForm = async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("forms")
        .select("*, form_fields(*)")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching form:", error);
        toast.error("No se pudo cargar el formulario.");
      } else {
        data.form_fields.sort((a, b) => a.order - b.order);
        setForm(data);
      }
      setLoading(false);
    };

    fetchForm();
  }, [slug]);

  const onSubmit = async (data) => {
    setSending(true);
    try {
      const processedData = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
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
          } else if (Array.isArray(value)) {
            processedData[key] = value.join(", ");
          } else if (typeof value === "object" && value !== null) {
            const selectedOptions = Object.keys(value).filter(
              (optionKey) => value[optionKey]
            );
            processedData[key] = selectedOptions.join(", ");
          } else {
            processedData[key] = value;
          }
        }
      }

      // ... inside PublicForm ...
      // Add timestamp
      processedData.Timestamp = formatInEcuador(
        getNowInEcuador(),
        "d/M/yyyy HH:mm:ss"
      );

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
          `Error al enviar el formulario: ${edgeFunctionError.message || "Error desconocido"}`
        );
      } else if (edgeFunctionData.error) {
        console.error("Edge Function returned error:", edgeFunctionData.error);
        toast.error(`Error al enviar el formulario: ${edgeFunctionData.error}`);
      } else {
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
                const registrationProps = register(field.label, {
                  required: field.is_required,
                });

                switch (field.field_type) {
                  case "text":
                    return (
                      <div key={field.id}>
                        <Label htmlFor={fieldId} className="mb-2">
                          {field.label}
                          {field.is_required && " *"}
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
                        rules={{ required: field.is_required }}
                        render={({ field: controllerField }) => (
                          <div key={field.id}>
                            <Label className="mb-2">
                              {field.label}
                              {field.is_required && " *"}
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
                          {field.is_required && " *"}
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
                          {field.is_required && " *"}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={fieldId}
                            type="file"
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
