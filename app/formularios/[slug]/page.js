"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  FileText,
  Loader2,
  ChevronLeft,
  SendHorizontal,
  CheckCircle2,
  XCircle,
  Home,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { getNowInEcuador, formatInEcuador } from "@/lib/date-utils";
import { cn } from "@/lib/utils.ts";

const LoadingSpinner = () => (
  <div className="flex flex-col gap-6 justify-center items-center h-screen animate-in fade-in duration-500">
    <Loader2 className="h-12 w-12 animate-spin text-[var(--puembo-green)] opacity-20" />
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
      Cargando Formulario
    </p>
  </div>
);

const SendingSpinner = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="flex flex-col gap-6 justify-center items-center bg-white p-12 rounded-[3rem] shadow-2xl">
      <Loader2 className="h-16 w-16 animate-spin text-[var(--puembo-green)]" />
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--puembo-green)]">
        Enviando Respuesta...
      </p>
    </div>
  </div>
);

export default function PublicForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm({
    mode: "onChange",
  });

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fileNames, setFileNames] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success' | 'error' | null
  const { slug } = useParams();
  const router = useRouter();

  // Observamos todos los valores del formulario para detectar si está vacío
  const formValues = watch();
  const isFormEmpty = !Object.values(formValues).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some(
        (v) => v === true || (typeof v === "string" && v.trim() !== ""),
      );
    }
    return (
      value !== undefined && value !== null && value !== "" && value !== false
    );
  });

  const hasRequiredFields = form?.form_fields.some(
    (f) => f.required || f.is_required,
  );
  const isFormDisabled = form?.enabled === false;
  const isSubmitDisabled =
    sending || isFormDisabled || (hasRequiredFields ? !isValid : isFormEmpty);

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
    if (isFormDisabled) {
      toast.error("Este formulario ya no acepta más respuestas.");
      return;
    }
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
                  data: reader.result.split(",")[1],
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            processedData[key] = await fileReadPromise;
            rawDataForDb[key] = {
              _type: "file",
              name: file.name,
              info: "Subido al Drive",
            };
          } else if (
            fieldType === "checkbox" &&
            typeof value === "object" &&
            value !== null
          ) {
            const selectedLabels = Object.keys(value)
              .filter((optionKey) => value[optionKey])
              .map((optionKey) => {
                const option = fieldDef.options.find(
                  (opt) => opt.value === optionKey,
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

      if (edgeFunctionError || edgeFunctionData?.error) {
        throw new Error(
          edgeFunctionError?.message ||
            edgeFunctionData?.error ||
            "Error en la integración",
        );
      }

      // Integrar las URLs de los archivos recibidas de la Edge Function
      if (edgeFunctionData?.fileUrls) {
        for (const fieldLabel in edgeFunctionData.fileUrls) {
          if (
            rawDataForDb[fieldLabel] &&
            rawDataForDb[fieldLabel]._type === "file"
          ) {
            rawDataForDb[fieldLabel].url =
              edgeFunctionData.fileUrls[fieldLabel];
            rawDataForDb[fieldLabel].info = "Subido a Google Drive";
          }
        }
      }

      await supabase.from("form_submissions").insert([
        {
          form_id: form.id,
          data: rawDataForDb,
          ip_address: "Client-side submission",
          user_agent: navigator.userAgent,
        },
      ]);

      setSubmissionStatus("success");
      reset();
      setFileNames({});
    } catch (error) {
      console.error("Error during submission:", error);
      setSubmissionStatus("error");
    }
    setSending(false);
  };

  const handleResetForm = () => {
    setSubmissionStatus(null);
    reset();
    setFileNames({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <LoadingSpinner />;

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
        <div className="text-center space-y-6">
          <p className="text-2xl font-serif font-bold text-gray-900">
            Formulario no encontrado
          </p>
          <Button
            variant="green"
            className="rounded-full px-8"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center py-12 px-4 md:py-24 relative overflow-x-hidden">
      {sending && <SendingSpinner />}

      <div className="w-full max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Banner de Estado Cerrado */}
        {isFormDisabled && (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-4 text-amber-800 shadow-sm animate-in zoom-in-95 duration-500">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <XCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-widest">
                Formulario Cerrado
              </p>
              <p className="text-sm font-light opacity-80 leading-relaxed">
                Este formulario ya no acepta más respuestas. Por favor, contacta
                con la administración si crees que es un error.
              </p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card
          className={cn(
            "overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white transition-opacity duration-500",
            isFormDisabled && "opacity-60 grayscale-[0.5]",
          )}
        >
          {form.image_url && (
            <div className="relative w-full aspect-video md:aspect-[21/9]">
              <Image
                src={form.image_url}
                alt={form.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}

          <CardHeader className="p-8 md:p-16 space-y-8 pb-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                  Formulario
                </span>
              </div>
              <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight font-serif">
                {form.title}
              </CardTitle>
              <div className="h-1 w-20 bg-[var(--puembo-green)]/20 rounded-full" />
            </div>

            {form.description && (
              <div
                className="tiptap-content text-gray-600 text-base leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: form.description }}
              />
            )}
          </CardHeader>

          <CardContent className="px-8 md:px-16 pt-8 pb-16">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              {form.form_fields.map((field) => {
                const fieldId = `field-${field.id}`;
                const fieldType = field.type || field.field_type;
                const isRequired = field.required ?? field.is_required;
                const placeholder = field.placeholder || "";
                const registrationProps = register(field.label, {
                  required: isRequired,
                });

                return (
                  <div key={field.id} className="group space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor={fieldId}
                        className="text-lg font-bold text-gray-900 group-focus-within:text-[var(--puembo-green)] transition-colors block"
                      >
                        {field.label}
                        {isRequired && (
                          <span className="text-red-500 ml-1.5">*</span>
                        )}
                      </Label>

                      {field.help_text && (
                        <p className="text-sm text-gray-600 font-light leading-relaxed whitespace-pre-wrap">
                          {field.help_text}
                        </p>
                      )}

                      {field.attachment_url && (
                        <div className="mt-4 rounded-3xl overflow-hidden border border-gray-100 bg-gray-50/50 p-3 shadow-inner">
                          {field.attachment_type === "image" ? (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                              <Image
                                src={field.attachment_url}
                                alt="Referencia"
                                fill
                                className="object-contain bg-white"
                              />
                            </div>
                          ) : (
                            <a
                              href={field.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-[var(--puembo-green)] hover:shadow-lg transition-all group/file"
                              onClick={(e) => {
                                // Forzar apertura si el href es válido
                                if (!field.attachment_url) e.preventDefault();
                              }}
                            >
                              <div className="p-3 bg-gray-50 rounded-xl group-hover/file:bg-[var(--puembo-green)]/10 transition-colors">
                                <FileText className="w-6 h-6 text-gray-400 group-hover/file:text-[var(--puembo-green)]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-700">
                                  Ver documento adjunto
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-[var(--puembo-green)] font-black">
                                  Haga clic para abrir
                                </span>
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      {(() => {
                        const baseInputClass =
                          "h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:bg-white focus:ring-[var(--puembo-green)]/10 focus:border-[var(--puembo-green)] transition-all text-base";

                        switch (fieldType) {
                          case "text":
                          case "email":
                            return (
                              <Input
                                id={fieldId}
                                type={fieldType}
                                placeholder={placeholder}
                                className={baseInputClass}
                                disabled={isFormDisabled}
                                {...registrationProps}
                              />
                            );

                          case "number":
                            return (
                              <Controller
                                name={field.label}
                                control={control}
                                rules={{ required: isRequired }}
                                render={({ field: ctrlField }) => (
                                  <Input
                                    id={fieldId}
                                    type="text"
                                    inputMode="numeric"
                                    placeholder={placeholder}
                                    className={baseInputClass}
                                    disabled={isFormDisabled}
                                    value={ctrlField.value || ""}
                                    onChange={(e) =>
                                      /^[0-9+\- ]*$/.test(e.target.value) &&
                                      ctrlField.onChange(e.target.value)
                                    }
                                    onBlur={ctrlField.onBlur}
                                  />
                                )}
                              />
                            );

                          case "textarea":
                            return (
                              <Textarea
                                id={fieldId}
                                placeholder={placeholder}
                                className={cn(
                                  baseInputClass,
                                  "min-h-[150px] py-4 resize-none",
                                )}
                                disabled={isFormDisabled}
                                {...registrationProps}
                              />
                            );

                          case "date":
                            return (
                              <Input
                                id={fieldId}
                                type="date"
                                className={cn(
                                  baseInputClass,
                                  "w-full md:w-auto px-6",
                                )}
                                disabled={isFormDisabled}
                                {...registrationProps}
                              />
                            );

                          case "radio":
                            return (
                              <Controller
                                name={field.label}
                                control={control}
                                rules={{ required: isRequired }}
                                render={({ field: ctrlField }) => (
                                  <RadioGroup
                                    onValueChange={ctrlField.onChange}
                                    value={ctrlField.value || ""}
                                    disabled={isFormDisabled}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                  >
                                    {field.options.map((opt) => (
                                      <Label
                                        key={opt.id}
                                        htmlFor={`${fieldId}-${opt.id}`}
                                        className={cn(
                                          "flex items-center gap-3 p-5 rounded-2xl border transition-all cursor-pointer",
                                          isFormDisabled &&
                                            "cursor-not-allowed opacity-50",
                                          ctrlField.value === opt.value
                                            ? "bg-white border-[var(--puembo-green)] shadow-md ring-1 ring-[var(--puembo-green)]/10"
                                            : "bg-gray-50/50 border-gray-100 hover:bg-white",
                                        )}
                                      >
                                        <RadioGroupItem
                                          value={opt.value}
                                          id={`${fieldId}-${opt.id}`}
                                          className="text-[var(--puembo-green)] border-gray-300"
                                          disabled={isFormDisabled}
                                        />
                                        <span className="font-bold text-gray-700">
                                          {opt.label}
                                        </span>
                                      </Label>
                                    ))}
                                  </RadioGroup>
                                )}
                              />
                            );

                          case "checkbox":
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {field.options.map((opt) => (
                                  <Controller
                                    key={opt.id}
                                    name={`${field.label}.${opt.value}`}
                                    control={control}
                                    render={({ field: ctrlField }) => (
                                      <Label
                                        htmlFor={`${fieldId}-${opt.id}`}
                                        className={cn(
                                          "flex items-center gap-3 p-5 rounded-2xl border transition-all cursor-pointer",
                                          isFormDisabled &&
                                            "cursor-not-allowed opacity-50",
                                          ctrlField.value
                                            ? "bg-white border-[var(--puembo-green)] shadow-md ring-1 ring-[var(--puembo-green)]/10"
                                            : "bg-gray-50/50 border-gray-100 hover:bg-white",
                                        )}
                                      >
                                        <Checkbox
                                          id={`${fieldId}-${opt.id}`}
                                          checked={ctrlField.value}
                                          onCheckedChange={ctrlField.onChange}
                                          disabled={isFormDisabled}
                                          className="data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)] rounded-md h-5 w-5"
                                        />
                                        <span className="font-bold text-gray-700">
                                          {opt.label}
                                        </span>
                                      </Label>
                                    )}
                                  />
                                ))}
                              </div>
                            );

                          case "file":
                          case "image":
                            return (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-2">
                                <Input
                                  id={fieldId}
                                  type="file"
                                  accept={
                                    fieldType === "image" ? "image/*" : "*/*"
                                  }
                                  className="hidden"
                                  disabled={isFormDisabled}
                                  {...registrationProps}
                                  onChange={(e) => {
                                    registrationProps.onChange(e);
                                    const file = e.target.files[0];
                                    setFileNames((prev) => ({
                                      ...prev,
                                      [field.id]: file ? file.name : null,
                                    }));
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-14 px-8 border-2 border-dashed rounded-2xl hover:border-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/5 transition-all text-sm font-bold uppercase tracking-widest"
                                  disabled={isFormDisabled}
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
                                    ? "Cargar Foto"
                                    : "Adjuntar Archivo"}
                                </Button>
                                {fileNames[field.id] && (
                                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 shadow-sm animate-in zoom-in-95">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[200px]">
                                      {fileNames[field.id]}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          default:
                            return null;
                        }
                      })()}
                    </div>

                    {errors[field.label] && (
                      <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-left-2 mt-2 ml-2">
                        Este campo es obligatorio
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="pt-12 border-t border-gray-100 space-y-8">
                <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
                  <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                    <span className="font-bold text-gray-700 block mb-2 uppercase tracking-widest text-[9px]">
                      Protección de Datos Personales
                    </span>
                    Al enviar esta respuesta, usted autoriza a la Iglesia
                    Alianza Puembo el tratamiento de sus datos personales con
                    fines informativos, administrativos y de gestión eclesial,
                    de conformidad con la Ley Orgánica de Protección de Datos
                    Personales de Ecuador. Garantizamos la confidencialidad y el
                    uso estrictamente institucional de su información.
                  </p>
                </div>

                <Button
                  className="w-full rounded-full py-8 text-lg font-bold shadow-2xl shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-1 active:scale-95 flex gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  variant="green"
                  type="submit"
                  disabled={isSubmitDisabled}
                >
                  {sending ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-6 w-6" />
                  )}
                  {sending ? "Procesando..." : "Enviar Respuesta"}
                </Button>

                <div className="mt-8 flex flex-col items-center gap-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                    Alianza Puembo ®
                  </p>
                  <Image
                    src="/brand/logo-puembo.png"
                    alt="Logo"
                    width={80}
                    height={30}
                    className="opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Result Modal */}
      <Dialog
        open={submissionStatus !== null}
        onOpenChange={() =>
          submissionStatus === "error" && setSubmissionStatus(null)
        }
      >
        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-8 md:p-12 max-w-sm mx-auto overflow-hidden [&>button]:hidden">
          <div className="flex flex-col items-center text-center space-y-8">
            {submissionStatus === "success" ? (
              <>
                <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <DialogTitle className="text-3xl font-serif font-bold text-gray-900">
                    ¡Recibido!
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-500 font-light leading-relaxed">
                    Tu respuesta ha sido enviada correctamente. Gracias por
                    completar el formulario.
                  </DialogDescription>
                </div>
                <div className="grid grid-cols-1 gap-3 w-full">
                  <Button
                    variant="green"
                    className="rounded-full w-full py-6 font-bold uppercase tracking-widest text-[10px] gap-2"
                    onClick={handleResetForm}
                  >
                    <RefreshCcw className="w-4 h-4" /> Enviar otra respuesta
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-full w-full py-6 font-bold uppercase tracking-widest text-[10px] text-gray-400 gap-2"
                    onClick={() => router.push("/")}
                  >
                    <Home className="w-4 h-4" /> Ir al inicio
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-in zoom-in duration-500">
                  <XCircle className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <DialogTitle className="text-3xl font-serif font-bold text-gray-900">
                    Algo salió mal
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-500 font-light leading-relaxed">
                    No pudimos procesar tu respuesta en este momento. Por favor,
                    revisa tu conexión e intenta de nuevo.
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full w-full py-6 font-bold uppercase tracking-widest text-xs"
                  onClick={() => setSubmissionStatus(null)}
                >
                  Intentar de nuevo
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
