'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { formatLiteralDate } from '@/lib/date-utils';
import { Loader2, BookOpen, ListFilter, PenTool, Trash2 } from 'lucide-react';
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
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { LomRow } from './table-cells/LomRow';
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ManagerSkeleton } from "../layout/AdminSkeletons";

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
    restoreItem,
    permanentlyDeleteItem,
    fetchArchivedItems,
    refetchItems
  } = useLom({ type: 'posts' });

  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editorKey, setEditorKey] = useState(0);

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

  // Cargar archivados al abrir papelera
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
      const newTotalPages = Math.ceil((posts.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  };

  const totalPages = useMemo(() => Math.ceil(posts.length / itemsPerPage), [posts.length, itemsPerPage]);
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return posts.slice(startIndex, endIndex);
  }, [posts, currentPage, itemsPerPage]);

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
                        <Input 
                          placeholder="Ej: Caminando sobre las aguas" 
                          className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
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
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Fecha de Publicación</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
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
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="rounded-full px-4 md:px-8 text-xs md:text-sm font-bold"
                  onClick={() => { 
                    form.reset({ title: '', content: '', publication_date: '' }); 
                    setSelectedPost(null); 
                    setEditorKey((prev) => prev + 1); 
                  }}
                >
                  Descartar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  variant="green"
                  className="rounded-full px-6 md:px-10 py-5 md:py-7 text-xs md:text-sm font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
                >
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
          <Button
            variant="outline"
            className="rounded-full px-6 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
            onClick={() => setIsRecycleBinOpen(true)}
          >
            <Trash2 className="w-5 h-5 lg:mr-2" />
            <span className="hidden lg:inline">Papelera</span>
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={4} />
          ) : posts.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                < BookOpen className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic">No hay devocionales publicados todavía.</p>
            </div>
          ) : (
            <div id='lom-table'>
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Título del Devocional</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Fecha de Publicación</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Autor</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPosts.map((post) => (
                      <LomRow
                        key={post.id}
                        post={post}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        compact={false}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="lg:hidden p-6 space-y-6">
                {currentPosts.map((post) => (
                  <LomRow
                    key={post.id}
                    post={post}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    compact={true}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="p-8 border-t border-gray-50">
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

      <RecycleBin 
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="lom-posts" 
        items={archivedPosts}
        onRestore={restoreItem}
        onDelete={permanentlyDeleteItem}
        loading={loadingArchived}
      />
    </div>
  );
}
