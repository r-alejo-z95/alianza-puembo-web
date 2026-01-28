"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Trash2, Layout, Plus } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { useRef, useCallback, useMemo } from "react";
import RichTextEditor from "../RichTextEditor";
import { toast } from "sonner";

const FormHeader = ({
  isActive,
  onActivate,
  headerFile,
  setHeaderFile,
  error,
}) => {
  const { control, watch, setValue } = useFormContext();
  const imageUrl = watch("image_url");
  const description = watch("description");
  const title = watch("title");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast.error("Imagen demasiado pesada", {
          description: "El límite es de 5MB",
        });
        return;
      }

      setHeaderFile(file);
      const objectUrl = URL.createObjectURL(file);
      setValue("image_url", objectUrl, { shouldDirty: true });
    }
  };

  const removeHeaderImage = (e) => {
    e.stopPropagation();
    if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    setHeaderFile(null);
    setValue("image_url", "", { shouldDirty: true });
  };

  return (
    <div
      id="field-header"
      data-field-card
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      className={cn(
        "bg-white rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group mb-8 cursor-pointer form-header-card",
        isActive
          ? "border-[var(--puembo-green)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] ring-8 ring-[var(--puembo-green)]/5"
          : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md",
        error && !isActive && "border-red-500 ring-4 ring-red-500/5",
      )}
    >
      {/* Top Accent line for visual cues */}
      <div
        className={cn(
          "h-1.5 w-full transition-colors",
          isActive
            ? "bg-[var(--puembo-green)]"
            : "bg-gray-100 group-hover:bg-gray-200",
        )}
      />

      {/* Hero Image Section */}
      <div
        className={cn(
          "relative transition-all duration-700 ease-in-out bg-[#FDFDFD] flex items-center justify-center overflow-hidden border-b border-gray-50",
          imageUrl ? "h-56 md:h-72" : isActive ? "h-32" : "h-12",
        )}
      >
        {imageUrl ? (
          <div className="w-full h-full relative group/img">
            <img
              src={imageUrl}
              alt="Portada"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
            />
            {isActive && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                <div className="flex gap-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" /> Cambiar Portada
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-xl"
                    onClick={removeHeaderImage}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          isActive && (
            <Button
              variant="ghost"
              className="w-full h-full rounded-none flex flex-col gap-3 hover:bg-gray-50 text-gray-400 hover:text-[var(--puembo-green)] group/upload"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <div className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 group-hover/upload:shadow-md transition-all">
                <ImageIcon className="w-8 h-8 opacity-40 group-hover/upload:opacity-100" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Añadir Portada del Formulario
              </span>
            </Button>
          )
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Header Info Section */}
      <div className="p-10 md:p-14 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-px w-8 transition-colors",
                error ? "bg-red-500" : "bg-[var(--puembo-green)]",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.4em]",
                error ? "text-red-500" : "text-[var(--puembo-green)]",
              )}
            >
              {error ? "Título Requerido" : "Formulario"}
            </span>
          </div>

          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value || ""}
                placeholder="Título del Formulario"
                className={cn(
                  "text-3xl md:text-5xl font-serif font-bold border-none shadow-none px-0 focus-visible:ring-0 rounded-none h-auto py-2 transition-all bg-transparent placeholder:text-gray-200",
                  isActive ? "border-b border-gray-100" : "pointer-events-none",
                  error && "text-red-500",
                )}
              />
            )}
          />
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-(--puembo-green)" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-(--puembo-green)">
              Contexto y Descripción
            </span>
          </div>
          {isActive ? (
            <div className="rounded-[2rem] border-2 border-gray-100 overflow-hidden bg-[#FAFAFA] shadow-inner focus-within:border-[var(--puembo-green)]/30 transition-all">
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value || ""}
                    onChange={field.onChange}
                    className="prose-sm cursor-auto max-w-none min-h-[80px] p-6 text-gray-600 font-light leading-relaxed focus:outline-none bg-transparent"
                  />
                )}
              />
            </div>
          ) : (
            <div
              className={cn(
                "prose prose-sm max-w-none text-gray-600 font-light min-h-[40px] leading-relaxed",
                !description && "text-gray-300 italic",
              )}
              dangerouslySetInnerHTML={{
                __html:
                  description ||
                  "Haz clic aquí para añadir una introducción o instrucciones para los usuarios...",
              }}
            />
          )}
        </div>
      </div>

      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--puembo-green)]" />
      )}
    </div>
  );
};

export default function FormCanvas({
  fields,
  activeFieldId,
  onActivateField,
  headerFile,
  setHeaderFile,
  onDuplicate,
  onDelete,
  errors,
}) {
  // Analizar qué secciones tienen preguntas con saltos lógicos internos
  const sections = useMemo(() => {
    const groups = [];
    let currentSectionBranching = false;
    let currentSectionId = null;

    // Solo nos interesan las secciones para el mapeo de destinos
    const sectionList = fields
      .filter((f) => f.type === "section")
      .map((f) => ({ id: f.id, label: f.label || "Sección sin título" }));

    // Analizar la estructura para detectar bifurcaciones por sección
    fields.forEach((f) => {
      if (f.type === "section") {
        currentSectionId = f.id;
        currentSectionBranching = false;
      } else if (f.type === "radio") {
        const hasJumps = f.options?.some(opt => opt.next_section_id && opt.next_section_id !== "default");
        if (hasJumps) {
          currentSectionBranching = true;
        }
      }
      
      if (currentSectionId) {
        const existing = groups.find(g => g.id === currentSectionId);
        if (existing) {
          existing.hasInternalBranching = existing.hasInternalBranching || currentSectionBranching;
        } else {
          groups.push({ id: currentSectionId, hasInternalBranching: currentSectionBranching });
        }
      }
    });

    return { sectionList, groupsMeta: groups };
  }, [fields]);

  return (
    <div className="w-full max-w-3xl mx-auto pt-4 md:pt-10">
      <FormHeader
        isActive={activeFieldId === "header"}
        onActivate={() => onActivateField("header")}
        headerFile={headerFile}
        setHeaderFile={setHeaderFile}
        error={!!errors?.title}
      />

      <SortableContext
        items={fields.map((f) => f.rhf_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-8">
          {fields.map((field, index) => {
            const sectionMeta = sections.groupsMeta.find(g => g.id === field.id);
            return (
              <QuestionCard
                key={field.rhf_id}
                field={field}
                index={index}
                isActive={activeFieldId === field.id}
                onActivate={() => onActivateField(field.id)}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                sections={sections.sectionList}
                hasInternalBranching={sectionMeta?.hasInternalBranching}
                error={errors?.fields?.[index]?.label}
              />
            );
          })}

          {fields.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed border-gray-200 rounded-[3rem] bg-white/40 backdrop-blur-sm flex flex-col items-center gap-8 hover:bg-white/60 transition-all group">
              <div className="relative">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 text-gray-200 group-hover:scale-110 transition-transform duration-500">
                  <Layout className="w-16 h-16" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[var(--puembo-green)] p-3 rounded-2xl shadow-lg text-white animate-bounce">
                  <Plus className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3 max-w-sm px-10">
                <h3 className="text-gray-600 font-bold font-serif text-2xl tracking-tight">
                  Crea tu primer bloque
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Añade preguntas o secciones usando el menú lateral para dar
                  forma a tu formulario.
                </p>
              </div>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
