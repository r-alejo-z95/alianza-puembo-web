"use client";

import React, { useState, useMemo } from "react";
import { useForms } from "@/lib/hooks/useForms";
import {
  Search,
  X,
  FileSpreadsheet,
  ChevronLeft,
  User,
  Calendar,
  SortAsc,
  SortDesc,
  Plus,
  ArrowRight,
  Loader2,
  ChevronDown,
  Banknote,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

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
      textarea: "Párrafo",
      number: "Número",
      email: "Correo",
      radio: "Opción Única",
      checkbox: "Múltiple",
      select: "Desplegable",
      date: "Fecha",
      file: "Archivo",
      image: "Imagen",
      section: "Sección",
    };
    return types[type] || type;
  };

  const getFieldColor = (type) => {
    const colors = {
      text: "text-sky-600 bg-sky-50",
      textarea: "text-orange-600 bg-orange-50",
      number: "text-violet-600 bg-violet-50",
      email: "text-rose-500 bg-rose-50",
      radio: "text-emerald-600 bg-emerald-50",
      checkbox: "text-indigo-600 bg-indigo-50",
      select: "text-teal-600 bg-teal-50",
      date: "text-amber-600 bg-amber-50",
      file: "text-gray-600 bg-gray-100",
      image: "text-pink-600 bg-pink-50",
      section: "text-gray-700 bg-gray-100",
    };
    return colors[type] || "text-gray-600 bg-gray-100";
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
        id: undefined,
        order_index: undefined,
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
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)] opacity-30" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Cargando formularios...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Step indicator */}
      <div className="flex items-center gap-2 px-6 pt-4 pb-2 shrink-0">
        <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step === "select-form" ? "bg-[var(--puembo-green)]" : "bg-[var(--puembo-green)]")} />
        <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step === "select-questions" ? "bg-[var(--puembo-green)]" : "bg-gray-200")} />
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">
          {step === "select-form" ? "Paso 1/2" : "Paso 2/2"}
        </span>
      </div>

      {step === "select-form" ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Filtros */}
          <div className="px-5 py-3 border-b border-gray-100 space-y-3 shrink-0">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <Input
                  placeholder="Buscar por nombre..."
                  className="pl-10 h-10 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative group min-w-[160px]">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="w-full pl-10 pr-8 h-10 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium appearance-none outline-none cursor-pointer text-gray-700 focus:bg-white transition-all"
                >
                  <option value="all">Todos</option>
                  {uniqueAuthors.map((author) => (
                    <option key={author.email} value={author.email}>
                      {author.full_name?.split(" ")[0] || author.email}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleSort("title")}
                className={cn(
                  "flex items-center gap-1 rounded-full text-[9px] uppercase font-black tracking-widest px-3 h-7 transition-all border",
                  sortConfig.key === "title"
                    ? "bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] border-[var(--puembo-green)]/20"
                    : "text-gray-400 border-gray-100 hover:border-gray-300 bg-white",
                )}
              >
                {sortConfig.key === "title" && (sortConfig.direction === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                Nombre
              </button>
              <button
                onClick={() => handleSort("created_at")}
                className={cn(
                  "flex items-center gap-1 rounded-full text-[9px] uppercase font-black tracking-widest px-3 h-7 transition-all border",
                  sortConfig.key === "created_at"
                    ? "bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] border-[var(--puembo-green)]/20"
                    : "text-gray-400 border-gray-100 hover:border-gray-300 bg-white",
                )}
              >
                {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                Fecha
              </button>
            </div>
          </div>

          {/* Lista de formularios */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredForms.length === 0 ? (
              <div className="py-20 text-center space-y-3 opacity-40">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  No se encontraron formularios
                </p>
              </div>
            ) : (
              filteredForms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => handleSelectForm(form)}
                  className="w-full text-left p-4 rounded-2xl border border-gray-100 bg-white hover:border-[var(--puembo-green)]/50 hover:shadow-lg hover:shadow-[var(--puembo-green)]/5 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn(
                        "p-2 rounded-xl shrink-0 mt-0.5",
                        form.is_financial ? "bg-amber-50" : form.is_internal ? "bg-emerald-50" : "bg-blue-50"
                      )}>
                        {form.is_financial
                          ? <Banknote className="w-4 h-4 text-amber-600" />
                          : form.is_internal
                            ? <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            : <Globe className="w-4 h-4 text-blue-500" />
                        }
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate leading-tight">
                          {form.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            <User className="w-3 h-3" />
                            {form.profiles?.full_name?.split(" ")[0] || "Admin"}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(form.created_at), "d MMM, yyyy", { locale: es })}
                          </span>
                          <span className="text-[9px] font-black text-[var(--puembo-green)] bg-[var(--puembo-green)]/5 px-2 py-0.5 rounded-full">
                            {form.form_fields?.length || 0} campos
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header Selección de Preguntas */}
          <div className="px-5 py-4 border-b border-gray-100 shrink-0">
            <button
              onClick={() => setStep("select-form")}
              className="flex items-center gap-1 mb-3 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Volver a lista
            </button>
            <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight truncate">
              {selectedForm.title}
            </h3>
            <p className="text-[9px] text-gray-400 mt-0.5 uppercase font-black tracking-widest">
              Selecciona las preguntas a importar
            </p>
          </div>

          {/* Buscador + select all */}
          <div className="px-5 py-3 border-b border-gray-100 space-y-3 shrink-0 bg-white">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
              <Input
                placeholder="Buscar pregunta..."
                className="pl-10 h-10 rounded-2xl bg-gray-50 border-transparent focus:bg-white transition-all text-sm"
                value={questionSearchTerm}
                onChange={(e) => setQuestionSearchTerm(e.target.value)}
              />
              {questionSearchTerm && (
                <button
                  onClick={() => setQuestionSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedQuestionIds.length === filteredQuestions.length && filteredQuestions.length > 0}
                  onCheckedChange={toggleAllQuestions}
                  className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Seleccionar todas
                </span>
              </label>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--puembo-green)] bg-[var(--puembo-green)]/5 px-2 py-0.5 rounded-full">
                {selectedQuestionIds.length} seleccionadas
              </span>
            </div>
          </div>

          {/* Lista de preguntas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredQuestions.length === 0 ? (
              <div className="py-16 text-center opacity-40">
                <p className="text-sm font-medium font-serif italic text-gray-500">
                  No hay preguntas que coincidan
                </p>
              </div>
            ) : (
              filteredQuestions.map((field) => (
                <label
                  key={field.id}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all",
                    selectedQuestionIds.includes(field.id)
                      ? "border-[var(--puembo-green)]/40 bg-[var(--puembo-green)]/5"
                      : "border-gray-100 bg-white hover:border-gray-200",
                  )}
                >
                  <Checkbox
                    checked={selectedQuestionIds.includes(field.id)}
                    onCheckedChange={() => toggleQuestion(field.id)}
                    className="mt-0.5 rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className={cn("inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-current/10", getFieldColor(field.type))}>
                      {getFieldLabel(field.type)}
                    </span>
                    <p className="text-sm font-bold text-gray-900 leading-snug">
                      {field.label || <span className="text-gray-300 italic">Sin etiqueta</span>}
                    </p>
                    {field.help_text && (
                      <p className="text-[10px] text-gray-400 line-clamp-1">
                        {field.help_text}
                      </p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Footer Importar */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <Button
              onClick={handleImport}
              disabled={selectedQuestionIds.length === 0}
              variant="green"
              className="w-full rounded-2xl py-7 font-bold text-sm uppercase tracking-widest shadow-lg shadow-[var(--puembo-green)]/20 disabled:opacity-40"
            >
              <Plus className="w-4 h-4 mr-2" />
              Importar {selectedQuestionIds.length}{" "}
              {selectedQuestionIds.length === 1 ? "pregunta" : "preguntas"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
