"use client";

import React, { useState, useMemo } from "react";
import { useForms } from "@/lib/hooks/useForms";
import {
  Search,
  X,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  User,
  Calendar,
  SortAsc,
  SortDesc,
  Plus,
  ArrowRight,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionImporter({ onImport, onCancel }) {
  const { forms, loading } = useForms();
  const [step, setStep] = useState("select-form"); // 'select-form' | 'select-questions'
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedQuestionIds, setSelectedQuestions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [questionSearchTerm, setQuestionSearchTerm] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  // --- Mapeo de tipos a etiquetas en español ---
  const getFieldLabel = (type) => {
    const types = {
      text: "Respuesta Corta",
      textarea: "Párrafo / Texto Largo",
      number: "Número",
      email: "Correo Electrónico",
      radio: "Opción Única",
      checkbox: "Opción Múltiple",
      select: "Lista Desplegable",
      date: "Fecha",
      file: "Subida de PDF / Archivo",
      image: "Subida de Imagen",
      section: "Sección",
    };
    return types[type] || type;
  };

  // --- Filtros para la lista de formularios ---
  const uniqueAuthors = useMemo(() => {
    const authors = forms.map((f) => f.profiles).filter(Boolean);
    const seen = new Set();
    return authors.filter((author) => {
      const duplicate = seen.has(author.email);
      seen.add(author.email);
      return !duplicate;
    });
  }, [forms]);

  const filteredForms = useMemo(() => {
    let result = [...forms];
    if (searchTerm) {
      result = result.filter((f) =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (authorFilter !== "all") {
      result = result.filter((f) => f.profiles?.email === authorFilter);
    }
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === "title") {
        valA = valA?.toLowerCase() || "";
        valB = valB?.toLowerCase() || "";
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [forms, searchTerm, authorFilter, sortConfig]);

  // --- Filtro para las preguntas del formulario seleccionado ---
  const filteredQuestions = useMemo(() => {
    if (!selectedForm?.form_fields) return [];
    if (!questionSearchTerm) return selectedForm.form_fields;
    return selectedForm.form_fields.filter(
      (f) =>
        f.label?.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
        getFieldLabel(f.type)
          .toLowerCase()
          .includes(questionSearchTerm.toLowerCase()),
    );
  }, [selectedForm, questionSearchTerm]);

  const handleSelectForm = (form) => {
    setSelectedForm(form);
    setStep("select-questions");
    setSelectedQuestions(form.form_fields?.map((f) => f.id) || []);
    setQuestionSearchTerm("");
  };

  const handleImport = () => {
    const questionsToImport = selectedForm.form_fields
      .filter((f) => selectedQuestionIds.includes(f.id))
      .map((f) => ({
        ...f,
        id: undefined, // El builder generará nuevos UUIDs
        order_index: undefined, // El builder los colocará al final o donde corresponda
      }));
    onImport(questionsToImport);
  };

  const toggleQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAllQuestions = () => {
    if (
      selectedQuestionIds.length === filteredQuestions.length &&
      filteredQuestions.length > 0
    ) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map((f) => f.id));
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--puembo-green)] opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
          Cargando Formularios
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {step === "select-form" ? (
        <div className="flex flex-col h-full">
          {/* Header filtros */}
          <div className="p-6 border-b border-gray-50 space-y-4 bg-gray-50/30">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <Input
                  placeholder="Buscar por nombre..."
                  className="pl-14 h-14 rounded-full bg-white border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative group min-w-[200px]">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="w-full pl-14 pr-10 h-14 rounded-full bg-white border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10 appearance-none outline-none cursor-pointer text-gray-700"
                >
                  <option value="all">Todos los autores</option>
                  {uniqueAuthors.map((author) => (
                    <option key={author.email} value={author.email}>
                      {author.full_name?.split(" ")[0] || author.email}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("title")}
                className={cn(
                  "rounded-full text-[10px] uppercase font-black tracking-widest px-6 h-10 transition-all",
                  sortConfig.key === "title"
                    ? "bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] shadow-sm"
                    : "text-gray-400 hover:bg-gray-100",
                )}
              >
                {sortConfig.key === "title" ? (
                  sortConfig.direction === "asc" ? (
                    <SortAsc className="w-3.5 h-3.5 mr-2" />
                  ) : (
                    <SortDesc className="w-3.5 h-3.5 mr-2" />
                  )
                ) : null}
                Nombre
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("created_at")}
                className={cn(
                  "rounded-full text-[10px] uppercase font-black tracking-widest px-6 h-10 transition-all",
                  sortConfig.key === "created_at"
                    ? "bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] shadow-sm"
                    : "text-gray-400 hover:bg-gray-100",
                )}
              >
                {sortConfig.key === "created_at" ? (
                  sortConfig.direction === "asc" ? (
                    <SortAsc className="w-3.5 h-3.5 mr-2" />
                  ) : (
                    <SortDesc className="w-3.5 h-3.5 mr-2" />
                  )
                ) : null}
                Fecha
              </Button>
            </div>
          </div>

          {/* Lista de formularios */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredForms.length === 0 ? (
              <div className="py-20 text-center space-y-4 opacity-40">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-sm font-medium">
                  No se encontraron formularios
                </p>
              </div>
            ) : (
              filteredForms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => handleSelectForm(form)}
                  className="w-full text-left p-5 rounded-[2rem] border border-gray-100 bg-white hover:border-[var(--puembo-green)] hover:shadow-xl hover:shadow-green-500/5 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="font-serif font-bold text-lg text-gray-900 truncate pr-8">
                        {form.title}
                      </h4>
                      <div className="flex items-center gap-4 text-[9px] md:text-[10px] font-black uppercase md:tracking-widest text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />{" "}
                          {form.profiles?.full_name?.split(" ")[0] || "Admin"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />{" "}
                          {format(parseISO(form.created_at), "d MMM, yyyy", {
                            locale: es,
                          })}
                        </span>
                        <span className="text-[var(--puembo-green)]">
                          {form.form_fields?.length || 0} preguntas
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all shrink-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header Selección de Preguntas */}
          <div className="p-8 border-b border-gray-50 bg-gray-50/30">
            <Button
              variant="ghost"
              onClick={() => setStep("select-form")}
              className="mb-4 -ml-4 rounded-full text-gray-400 hover:text-gray-900 text-xs font-bold uppercase tracking-widest"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Volver a
              lista
            </Button>
            <h3 className="text-2xl font-serif font-bold text-gray-900">
              {selectedForm.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1 uppercase font-black tracking-widest">
              Selecciona las preguntas a importar
            </p>
          </div>

          {/* Buscador de preguntas */}
          <div className="px-6 py-4 border-b border-gray-50 bg-white sticky top-0 z-20">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
              <Input
                placeholder="Buscar preguntas por nombre o tipo..."
                className="pl-12 h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white transition-all text-sm"
                value={questionSearchTerm}
                onChange={(e) => setQuestionSearchTerm(e.target.value)}
              />
              {questionSearchTerm && (
                <button
                  onClick={() => setQuestionSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={
                  selectedQuestionIds.length === filteredQuestions.length &&
                  filteredQuestions.length > 0
                }
                onCheckedChange={toggleAllQuestions}
                className="rounded-md border-gray-300"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Seleccionar filtradas
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)]">
              {selectedQuestionIds.length} seleccionadas
            </span>
          </div>

          {/* Lista de preguntas */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <p className="text-sm font-medium font-serif italic">
                  No hay preguntas que coincidan con la búsqueda
                </p>
              </div>
            ) : (
              filteredQuestions.map((field, index) => (
                <label
                  key={field.id}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer",
                    selectedQuestionIds.includes(field.id)
                      ? "border-[var(--puembo-green)] bg-green-50/30 shadow-inner"
                      : "border-gray-100 bg-white hover:border-gray-300",
                  )}
                >
                  <Checkbox
                    checked={selectedQuestionIds.includes(field.id)}
                    onCheckedChange={() => toggleQuestion(field.id)}
                    className="mt-1 rounded-md border-gray-300"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--puembo-green)] bg-[var(--puembo-green)]/5 px-2 py-0.5 rounded-full border border-[var(--puembo-green)]/10">
                        {getFieldLabel(field.type)}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 leading-snug">
                      {field.label || "Sin etiqueta"}
                    </p>
                    {field.help_text && (
                      <p className="text-[10px] text-gray-400 italic line-clamp-1">
                        {field.help_text}
                      </p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Footer Importar */}
          <div className="p-8 bg-white border-t border-gray-50">
            <Button
              onClick={handleImport}
              disabled={selectedQuestionIds.length === 0}
              variant="green"
              className="w-full rounded-full py-8 font-bold text-sm uppercase tracking-widest shadow-xl shadow-green-500/20"
            >
              <Plus className="w-5 h-5 mr-2" /> Importar{" "}
              {selectedQuestionIds.length}{" "}
              {selectedQuestionIds.length === 1 ? "pregunta" : "preguntas"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
