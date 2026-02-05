"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import {
  Loader2,
  BookOpen,
  ListFilter,
  PenTool,
  Trash2,
  Search,
  SortAsc,
  SortDesc,
  LayoutGrid,
  Rows,
  X,
  CheckCircle2,
  Plus,
  ChevronDown,
  User,
} from "lucide-react";
import { useLom } from "@/lib/hooks/useLom";
import RecycleBin from "./RecycleBin";
import { slugify } from "@/lib/utils";

const RichTextEditor = dynamic(
  () => import("@/components/admin/forms/RichTextEditor"),
  { ssr: false },
);
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LomRow } from "./table-cells/LomRow";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AdminEditorPanel } from "../layout/AdminEditorPanel";
import { AdminFAB } from "../layout/AdminFAB";

import { motion, AnimatePresence } from "framer-motion";

const lomSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  content: z
    .string()
    .min(10, "El contenido debe tener al menos 10 caracteres."),
  publication_date: z.string().min(1, "La fecha de publicación es requerida."),
});

export default function LomManager() {
  const {
    items: posts,
    archivedItems: archivedPosts,
    loading,
    loadingArchived,
    archiveItem,
    archiveManyItems,
    restoreItem,
    restoreManyItems,
    permanentlyDeleteItem,
    permanentlyDeleteManyItems,
    emptyRecycleBin,
    fetchArchivedItems,
    refetchItems,
  } = useLom({ type: "posts" });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editorKey, setEditorKey] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "publication_date",
    direction: "desc",
  });
  const [groupByMonth, setGroupByMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_lom_groupByMonth");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(
      "admin_lom_groupByMonth",
      JSON.stringify(groupByMonth),
    );
  }, [groupByMonth]);

  const [selectedIds, setSelectedIds] = useState([]);
  const itemsPerPage = 10;
  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(lomSchema),
    defaultValues: { title: "", content: "", publication_date: "" },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, authorFilter]);

  useEffect(() => {
    if (isRecycleBinOpen) fetchArchivedItems();
  }, [isRecycleBinOpen, fetchArchivedItems]);

  const uniqueAuthors = useMemo(() => {
    const authors = posts.map((p) => p.profiles).filter(Boolean);
    const seen = new Set();
    return authors.filter((author) => {
      const duplicate = seen.has(author.email);
      seen.add(author.email);
      return !duplicate;
    });
  }, [posts]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const baseSlug = slugify(data.title);
      let slug = baseSlug;

      if (!selectedPost || selectedPost.title !== data.title) {
        const { data: existing } = await supabase
          .from("lom_posts")
          .select("id")
          .eq("slug", baseSlug)
          .maybeSingle();
        if (existing && existing.id !== selectedPost?.id) {
          slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }
      }

      const dataToSave = {
        ...data,
        publication_date: data.publication_date,
        user_id: user?.id,
        slug: slug,
        is_archived: false,
      };

      if (selectedPost) {
        const { error } = await supabase
          .from("lom_posts")
          .update(dataToSave)
          .eq("id", selectedPost.id);
        if (error) throw error;
        toast.success("Devocional actualizado.");
      } else {
        const { error } = await supabase.from("lom_posts").insert([dataToSave]);
        if (error) throw error;
        toast.success("Devocional creado.");
      }

      setIsFormOpen(false);
      setSelectedPost(null);
      form.reset({ title: "", content: "", publication_date: "" });
      setEditorKey((prev) => prev + 1);
      refetchItems();
    } catch (error) {
      toast.error("Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    form.reset({
      title: post.title,
      content: post.content,
      publication_date: post.publication_date,
    });
    setEditorKey((prev) => prev + 1);
    setIsFormOpen(true);
  };

  const handleDelete = async (postId) => {
    const success = await archiveItem(postId);
    if (success) setSelectedIds((prev) => prev.filter((id) => id !== postId));
  };

  const handleBulkArchive = async () => {
    const success = await archiveManyItems(selectedIds);
    if (success) setSelectedIds([]);
  };

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  const processedPosts = useMemo(() => {
    let result = [...posts];
    if (searchTerm)
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (!valA) return 1;
      if (!valB) return -1;
      if (sortConfig.key === "title") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [posts, searchTerm, sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPosts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPosts, currentPage, itemsPerPage]);

  const groupedCurrentItems = useMemo(() => {
    if (!groupByMonth) return { Resultados: currentItems };
    const groups = {};
    currentItems.forEach((post) => {
      const date = parseISO(post.publication_date);
      const monthYear = format(date, "MMMM yyyy", { locale: es });
      const capitalizedMonth =
        monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      if (!groups[capitalizedMonth]) groups[capitalizedMonth] = [];
      groups[capitalizedMonth].push(post);
    });
    return groups;
  }, [currentItems, groupByMonth]);

  const totalPages = Math.ceil(processedPosts.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length && currentItems.length > 0)
      setSelectedIds([]);
    else setSelectedIds(currentItems.map((p) => p.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {isFormOpen ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 md:p-12 border-b border-gray-50 bg-black text-white flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[var(--puembo-green)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                      Editor Editorial
                    </span>
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                    {selectedPost ? "Refinar" : "Crear"} <br />
                    <span className="text-[var(--puembo-green)] italic">
                      Devocional
                    </span>
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsFormOpen(false);
                    setSelectedPost(null);
                  }}
                  className="rounded-full text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5 mr-2" /> Cancelar Edición
                </Button>
              </CardHeader>
              <CardContent className="p-8 md:p-12 bg-white">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                              Título de la Lectura
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Caminando sobre las aguas"
                                className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-lg font-medium"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="publication_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                              Fecha de Publicación
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-lg font-medium"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                            Cuerpo del Devocional
                          </FormLabel>
                          <FormControl>
                            <div className="rounded-[2rem] border border-gray-100 overflow-hidden shadow-inner bg-gray-50 focus-within:bg-white transition-all">
                              <RichTextEditor
                                key={editorKey}
                                content={field.value}
                                onChange={field.onChange}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-50">
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full px-8 h-14 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900"
                        onClick={() => {
                          setIsFormOpen(false);
                          setSelectedPost(null);
                        }}
                      >
                        Descartar
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        variant="green"
                        className="rounded-full px-12 h-14 text-sm font-bold uppercase tracking-widest shadow-xl shadow-green-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
                      >
                        {submitting ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        ) : (
                          <PenTool className="w-5 h-5 mr-3" />
                        )}
                        {selectedPost ? "Guardar Cambios" : "Publicar Lectura"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-6 md:p-10 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-3 justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <BookOpen className="w-3 h-3" />{" "}
                    <span>Archivo Editorial</span>
                  </div>
                  <CardTitle className="text-3xl font-serif font-bold text-gray-900">
                    Gestión de LOM
                  </CardTitle>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="rounded-full px-5 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all"
                    onClick={() => setIsRecycleBinOpen(true)}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />{" "}
                    <span className="text-xs uppercase tracking-widest">
                      Papelera
                    </span>
                  </Button>
                  <Button
                    variant="green"
                    className="hidden lg:flex rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
                    onClick={() => {
                      setSelectedPost(null);
                      form.reset({
                        title: "",
                        content: "",
                        publication_date: "",
                      });
                      setEditorKey((prev) => prev + 1);
                      setIsFormOpen(true);
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" /> Añadir Devocional
                  </Button>
                </div>
              </CardHeader>

              <div className="px-6 py-4 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                      <Input
                        placeholder="Buscar devocional..."
                        className="pl-14 h-14 rounded-full bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                    </div>

                    <div className="relative group min-w-[200px]">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                      <select
                        value={authorFilter}
                        onChange={(e) => setAuthorFilter(e.target.value)}
                        className="w-full pl-14 pr-10 h-14 rounded-full bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10 appearance-none outline-none cursor-pointer text-gray-700"
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

                  <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center bg-gray-50 p-1 rounded-full border border-gray-100 shrink-0 w-full lg:w-auto">
                      <Button
                        variant={sortConfig.key === "title" ? "green" : "ghost"}
                        onClick={() => handleSort("title")}
                        className={cn(
                          "flex-1 lg:flex-none rounded-full h-10 px-6 font-bold text-[9px] uppercase tracking-[0.2em] gap-2 transition-all",
                          sortConfig.key === "title"
                            ? "shadow-md"
                            : "text-gray-400 hover:bg-gray-100",
                        )}
                      >
                        {sortConfig.key === "title" &&
                          (sortConfig.direction === "asc" ? (
                            <SortAsc className="w-3.5 h-3.5" />
                          ) : (
                            <SortDesc className="w-3.5 h-3.5" />
                          ))}{" "}
                        Nombre
                      </Button>
                      <Button
                        variant={
                          sortConfig.key === "publication_date"
                            ? "green"
                            : "ghost"
                        }
                        onClick={() => handleSort("publication_date")}
                        className={cn(
                          "flex-1 lg:flex-none rounded-full h-10 px-6 font-bold text-[9px] uppercase tracking-[0.2em] gap-2 transition-all",
                          sortConfig.key === "publication_date"
                            ? "shadow-md"
                            : "text-gray-400 hover:bg-gray-100",
                        )}
                      >
                        {sortConfig.key === "publication_date" &&
                          (sortConfig.direction === "asc" ? (
                            <SortAsc className="w-3.5 h-3.5" />
                          ) : (
                            <SortDesc className="w-3.5 h-3.5" />
                          ))}{" "}
                        Fecha
                      </Button>
                    </div>

                    <Button
                      variant={groupByMonth ? "green" : "outline"}
                      className={cn(
                        "w-full lg:w-auto rounded-full h-12 px-8 font-bold text-[9px] uppercase tracking-[0.2em] gap-3 transition-all shrink-0",
                        !groupByMonth &&
                          "border-gray-100 text-gray-500 hover:bg-gray-50",
                      )}
                      onClick={() => setGroupByMonth(!groupByMonth)}
                    >
                      {groupByMonth ? (
                        <LayoutGrid className="w-3.5 h-3.5" />
                      ) : (
                        <Rows className="w-3.5 h-3.5" />
                      )}{" "}
                      {groupByMonth ? "Agrupado" : "Lista"}
                    </Button>

                    <div className="lg:hidden flex items-center justify-between bg-gray-50/50 px-6 rounded-full border border-gray-100 h-14 w-full">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Seleccionar Todo
                      </span>
                      <Checkbox
                        checked={
                          selectedIds.length === currentItems.length &&
                          currentItems.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)] scale-125"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 40 }}
                      className="mt-6 p-5 lg:p-4 bg-gray-900 rounded-[2.5rem] lg:rounded-full flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl ring-4 ring-black/5 z-30"
                    >
                      <div className="flex items-center gap-5 w-full lg:w-auto pl-2 text-white">
                        <div className="w-12 h-12 bg-[var(--puembo-green)] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-base text-white">
                            {selectedIds.length} seleccionados
                          </span>
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">
                            Gestión masiva
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
                        <Button
                          variant="ghost"
                          className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full font-bold text-[10px] uppercase tracking-widest h-14 lg:h-12"
                          onClick={() => setSelectedIds([])}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-[10px] uppercase tracking-widest h-14 lg:h-12 gap-2 shadow-xl transition-all"
                          onClick={handleBulkArchive}
                        >
                          <Trash2 className="w-4 h-4" /> Archivar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <CardContent className="p-0">
                {loading ? (
                  <ManagerSkeleton rows={10} columns={4} />
                ) : processedPosts.length === 0 ? (
                  <div className="py-32 text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-light italic text-lg font-serif px-8">
                      {searchTerm
                        ? "No se encontraron devocionales."
                        : "No hay devocionales publicados."}
                    </p>
                  </div>
                ) : (
                  <div id="lom-table">
                    <div className="hidden lg:block overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader className="bg-gray-50/50">
                          <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableHead className="px-8 py-6 w-[80px]">
                              <Checkbox
                                checked={
                                  selectedIds.length === currentItems.length &&
                                  currentItems.length > 0
                                }
                                onCheckedChange={toggleSelectAll}
                                className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] scale-110"
                              />
                            </TableHead>
                            <TableHead className="px-4 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                              Título
                            </TableHead>
                            <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                              Fecha de Publicación
                            </TableHead>
                            <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                              Autor
                            </TableHead>
                            <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">
                              Acciones
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(groupedCurrentItems).map(
                            ([group, groupPosts]) => (
                              <React.Fragment key={group}>
                                {groupByMonth && (
                                  <TableRow className="bg-white hover:bg-white border-none">
                                    <TableCell
                                      colSpan={5}
                                      className="px-8 pt-12 pb-4"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="h-px w-8 bg-[var(--puembo-green)]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                                          {group}
                                        </span>
                                        <div className="h-px grow bg-gray-50" />
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                                {groupPosts.map((post) => (
                                  <LomRow
                                    key={post.id}
                                    post={post}
                                    isSelected={selectedIds.includes(post.id)}
                                    onSelect={() => toggleSelect(post.id)}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    compact={false}
                                  />
                                ))}
                              </React.Fragment>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="lg:hidden p-6 space-y-12">
                      {Object.entries(groupedCurrentItems).map(
                        ([group, groupPosts]) => (
                          <div key={group} className="space-y-6">
                            {groupByMonth && (
                              <div className="flex items-center gap-4 px-2 pt-4">
                                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                                  {group}
                                </span>
                              </div>
                            )}
                            {groupPosts.map((post) => (
                              <LomRow
                                key={post.id}
                                post={post}
                                isSelected={selectedIds.includes(post.id)}
                                onSelect={() => toggleSelect(post.id)}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                compact={true}
                              />
                            ))}
                          </div>
                        ),
                      )}
                    </div>
                    {totalPages > 1 && (
                      <div className="p-12 border-t border-gray-50 bg-gray-50/10">
                        <PaginationControls
                          hasNextPage={currentPage < totalPages}
                          totalPages={totalPages}
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <RecycleBin
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="lom-posts"
        items={archivedPosts}
        onRestore={restoreItem}
        onDelete={permanentlyDeleteItem}
        onBulkRestore={restoreManyItems}
        onBulkDelete={permanentlyDeleteManyItems}
        onEmptyTrash={emptyRecycleBin}
        loading={loadingArchived}
      />
      {!isFormOpen && (
        <AdminFAB
          onClick={() => {
            setSelectedPost(null);
            form.reset({ title: "", content: "", publication_date: "" });
            setEditorKey((prev) => prev + 1);
            setIsFormOpen(true);
          }}
          label="Nuevo LOM"
        />
      )}
    </div>
  );
}
