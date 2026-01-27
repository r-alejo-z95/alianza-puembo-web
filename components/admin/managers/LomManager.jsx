'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { formatLiteralDate } from '@/lib/date-utils';
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
  ChevronDown, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { useLom } from '@/lib/hooks/useLom';
import RecycleBin from './RecycleBin';

const RichTextEditor = dynamic(
  () => import('@/components/admin/forms/RichTextEditor'),
  { ssr: false }
);
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';
import { LomRow } from './table-cells/LomRow';
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

const lomSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres.'),
  publication_date: z.string().min(1, 'La fecha de publicación es requerida.'),
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
    refetchItems
  } = useLom({ type: 'posts' });

  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editorKey, setEditorKey] = useState(0);

  // UX States with Persistence
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "publication_date", direction: "desc" });
  const [groupByMonth, setGroupByMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_lom_groupByMonth");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("admin_lom_groupByMonth", JSON.stringify(groupByMonth));
  }, [groupByMonth]);

  const [selectedIds, setSelectedIds] = useState([]);

  const itemsPerPage = 10;
  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(lomSchema),
    defaultValues: {
      title: '',
      content: '',
      publication_date: '',
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (isRecycleBinOpen) {
      fetchArchivedItems();
    }
  }, [isRecycleBinOpen, fetchArchivedItems]);

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const slug = createSlug(data.title);

      const dataToSave = {
        ...data,
        publication_date: data.publication_date,
        user_id: user?.id,
        slug: slug,
        is_archived: false
      };

      if (selectedPost) {
        const { error } = await supabase.from('lom_posts').update(dataToSave).eq('id', selectedPost.id);
        if (error) throw error;
        toast.success('Devocional actualizado con éxito.');
      } else {
        const { error } = await supabase.from('lom_posts').insert([dataToSave]);
        if (error) throw error;
        toast.success('Devocional creado con éxito.');
      }
      
      setSelectedPost(null);
      form.reset({ title: '', content: '', publication_date: '' });
      setEditorKey((prev) => prev + 1);
      refetchItems();
    } catch (error) {
      console.error('Error saving LOM post:', error);
      toast.error('Error al guardar el devocional.');
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (postId) => {
    const success = await archiveItem(postId);
    if (success) {
      setSelectedIds(prev => prev.filter(id => id !== postId));
    }
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
    if (searchTerm) {
      result = result.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (!valA) return 1; if (!valB) return -1;
      if (sortConfig.key === "title") { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [posts, searchTerm, sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedPosts.slice(startIndex, endIndex);
  }, [processedPosts, currentPage, itemsPerPage]);

  const groupedCurrentItems = useMemo(() => {
    if (!groupByMonth) return { "Resultados": currentItems };
    const groups = {};
    currentItems.forEach(post => {
      const date = parseISO(post.publication_date);
      const monthYear = format(date, "MMMM yyyy", { locale: es });
      const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      if (!groups[capitalizedMonth]) groups[capitalizedMonth] = [];
      groups[capitalizedMonth].push(post);
    });
    return groups;
  }, [currentItems, groupByMonth]);

  const totalPages = Math.ceil(processedPosts.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length && currentItems.length > 0) setSelectedIds([]);
    else setSelectedIds(currentItems.map(p => p.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-16">
      {/* Editorial Form Card */}
      <Card id="editorial-form" className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <div className="bg-black p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">Composición</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-white leading-tight">
            {selectedPost ? "Refinar" : "Escribir"} <br />
            <span className="text-[var(--puembo-green)] italic">Devocional</span>
          </h2>
        </div>
        
        <CardContent className="p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Título de la Lectura</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Caminando sobre las aguas" className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all" {...field} />
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
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Fecha de Publicación</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all" {...field} />
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
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Cuerpo del Devocional</FormLabel>
                    <FormControl>
                      <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-inner">
                        <RichTextEditor key={editorKey} content={field.value} onChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 md:gap-4 pt-4">
                <Button type="button" variant="ghost" className="rounded-full px-4 md:px-8 text-xs md:text-sm font-bold" onClick={() => { form.reset({ title: '', content: '', publication_date: '' }); setSelectedPost(null); setEditorKey((prev) => prev + 1); }}>Descartar</Button>
                <Button type="submit" disabled={submitting} variant="green" className="rounded-full px-6 md:px-10 py-5 md:py-7 text-xs md:text-sm font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PenTool className="w-4 h-4 mr-2" />}
                  {selectedPost ? 'Guardar Cambios' : 'Publicar Lectura'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 md:p-12 border-b border-gray-50 bg-gray-50/30 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <ListFilter className="w-3 h-3" />
              <span>Archivo Editorial</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">Lecturas Publicadas</CardTitle>
          </div>
          <Button variant="outline" className="rounded-full px-6 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all" onClick={() => setIsRecycleBinOpen(true)}>
            <Trash2 className="w-5 h-5 lg:mr-2" />
            <span className="hidden lg:inline">Papelera</span>
          </Button>
        </CardHeader>

        {/* Toolbar */}
        <div className="px-8 py-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
              <Input placeholder="Buscar por nombre..." className="pl-14 h-14 rounded-full bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"><X className="w-3 h-3 text-gray-400" /></button>}
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <div className="flex items-center bg-gray-50 p-1.5 rounded-full border border-gray-100">
                <Button variant={sortConfig.key === "title" ? "green" : "ghost"} onClick={() => handleSort("title")} className={cn("rounded-full h-11 px-6 font-bold text-[10px] uppercase tracking-[0.2em] gap-2 transition-all", sortConfig.key === "title" ? "shadow-lg" : "text-gray-400 hover:bg-gray-100")}>
                  {sortConfig.key === "title" && (sortConfig.direction === "asc" ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />)} Nombre
                </Button>
                <Button variant={sortConfig.key === "publication_date" ? "green" : "ghost"} onClick={() => handleSort("publication_date")} className={cn("rounded-full h-11 px-6 font-bold text-[10px] uppercase tracking-[0.2em] gap-2 transition-all", sortConfig.key === "publication_date" ? "shadow-lg" : "text-gray-400 hover:bg-gray-100")}>
                  {sortConfig.key === "publication_date" && (sortConfig.direction === "asc" ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />)} Fecha
                </Button>
              </div>
              <div className="h-8 w-px bg-gray-100 mx-2 hidden lg:block" />
              <Button variant={groupByMonth ? "green" : "outline"} className={cn("rounded-full h-14 px-8 font-bold text-[10px] uppercase tracking-[0.2em] gap-3 transition-all", !groupByMonth && "border-gray-100 text-gray-500 hover:bg-gray-50")} onClick={() => setGroupByMonth(!groupByMonth)}>
                {groupByMonth ? <LayoutGrid className="w-4 h-4" /> : <Rows className="w-4 h-4" />} {groupByMonth ? "Agrupado" : "Lista Plana"}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="mt-6 p-4 bg-gray-900 rounded-full flex items-center justify-between shadow-2xl ring-4 ring-black/5 z-30">
                <div className="flex items-center gap-5 pl-4 text-white">
                  <div className="w-12 h-12 bg-[var(--puembo-green)] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20 animate-pulse"><CheckCircle2 className="w-6 h-6" /></div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-sm text-white">{selectedIds.length} seleccionados</span>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Gestión masiva</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full font-bold text-[10px] uppercase tracking-widest h-12 px-8" onClick={() => setSelectedIds([])}>Cancelar</Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-[10px] uppercase tracking-widest px-10 h-12 gap-3 shadow-xl transition-all" onClick={handleBulkArchive}><Trash2 className="w-4 h-4" /> Archivar</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <CardContent className="p-0">
          {loading ? ( <ManagerSkeleton rows={itemsPerPage} columns={4} /> ) : processedPosts.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto"><BookOpen className="w-8 h-8 text-gray-200" /></div>
              <p className="text-gray-400 font-light italic text-lg font-serif px-8">{searchTerm ? "No se encontraron devocionales." : "No hay devocionales publicados todavía."}</p>
            </div>
          ) : (
            <div id='lom-table'>
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 w-[80px]">
                        <Checkbox checked={selectedIds.length === currentItems.length && currentItems.length > 0} onCheckedChange={toggleSelectAll} className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)] scale-110" />
                      </TableHead>
                      <TableHead className="px-4 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Título</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Fecha de Publicación</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Autor</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedCurrentItems).map(([group, groupPosts]) => (
                      <React.Fragment key={group}>
                        {groupByMonth && (
                          <TableRow className="bg-white hover:bg-white border-none">
                            <TableCell colSpan={5} className="px-8 pt-12 pb-4">
                              <div className="flex items-center gap-4">
                                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">{group}</span>
                                <div className="h-px grow bg-gray-50" />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {groupPosts.map((post) => (
                          <LomRow key={post.id} post={post} isSelected={selectedIds.includes(post.id)} onSelect={() => toggleSelect(post.id)} onEdit={handleEdit} onDelete={handleDelete} compact={false} />
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="lg:hidden p-6 space-y-12">
                {Object.entries(groupedCurrentItems).map(([group, groupPosts]) => (
                   <div key={group} className="space-y-6">
                      {groupByMonth && ( <div className="flex items-center gap-4 px-2 pt-4"><div className="h-px w-8 bg-[var(--puembo-green)]" /><span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">{group}</span></div> )}
                      {groupPosts.map((post) => ( <LomRow key={post.id} post={post} isSelected={selectedIds.includes(post.id)} onSelect={() => toggleSelect(post.id)} onEdit={handleEdit} onDelete={handleDelete} compact={true} /> ))}
                   </div>
                 ))}
              </div>
              {totalPages > 1 && ( <div className="p-12 border-t border-gray-50 bg-gray-50/10"><PaginationControls hasNextPage={currentPage < totalPages} totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} /></div> )}
            </div>
          )}
        </CardContent>
      </Card>
      <RecycleBin open={isRecycleBinOpen} onOpenChange={setIsRecycleBinOpen} type="lom-posts" items={archivedPosts} onRestore={restoreItem} onDelete={permanentlyDeleteItem} onBulkRestore={restoreManyItems} onBulkDelete={permanentlyDeleteManyItems} onEmptyTrash={emptyRecycleBin} loading={loadingArchived} />
    </div>
  );
}