'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/admin/forms/RichTextEditor';
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
import { useIsLargeScreen } from '@/lib/hooks/useIsLargeScreen';
import { PaginationControls } from "@/components/admin/PaginationControls";

const lomSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres.'),
});

export default function LomManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isLargeScreen = useIsLargeScreen();
  const itemsPerPage = 3; // Always 3 for LOM posts

  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(lomSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lom_posts')
      .select('*')
      .order('publication_date', { ascending: false });

    if (error) {
      console.error('Error fetching LOM posts:', error);
      toast.error('Error al cargar los devocionales.');
    } else {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const slug = createSlug(data.title);

    const dataToSave = {
      ...data,
      user_id: user?.id,
      slug: slug,
    };

    if (selectedPost) {
      const { error } = await supabase.from('lom_posts').update(dataToSave).eq('id', selectedPost.id);
      if (error) {
        console.error('Error updating LOM post:', error);
        toast.error('Error al actualizar el devocional.');
      } else {
        toast('Devocional actualizado con éxito.');
      }
    } else {
      const { error } = await supabase.from('lom_posts').insert([dataToSave]);
      if (error) {
        console.error('Error creating LOM post:', error);
        toast.error('Error al crear el devocional.');
      } else {
        toast('Devocional creado con éxito.');
      }
    }
    setSelectedPost(null);
    form.reset({
      title: '',
      content: '',
    });
    fetchPosts();
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    form.reset({
      title: post.title,
      content: post.content,
    });
  };

  const handleDelete = async (postId) => {
    setLoading(true);
    const { error } = await supabase.from('lom_posts').delete().eq('id', postId);
    if (error) {
      console.error('Error deleting LOM post:', error);
      toast.error('Error al eliminar el devocional.');
    } else {
      toast('Devocional eliminado con éxito.');
    }
    fetchPosts();
  };

  const totalPages = useMemo(() => Math.ceil(posts.length / itemsPerPage), [posts.length, itemsPerPage]);
  const hasNextPage = currentPage * itemsPerPage < posts.length;
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return posts.slice(startIndex, endIndex);
  }, [posts, currentPage, itemsPerPage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear/Editar Devocional</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del devocional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <RichTextEditor content={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { form.reset({ title: '', content: '' }); setSelectedPost(null); }}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {selectedPost ? 'Actualizar' : 'Publicar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      <CardHeader className="mt-8">
        <CardTitle>Devocionales Publicados</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando devocionales...</p>
        ) : (
          <div id='lom-table'>
            {/* Pantallas grandes */}
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Título</TableHead>
                    <TableHead className="font-bold">Fecha de Publicación</TableHead>
                    <TableHead className="font-bold">Acciones</TableHead>
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
              {totalPages > 1 && (
                <PaginationControls
                  hasNextPage={hasNextPage}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>

            {/* Pantallas pequeñas */}
            <div className="lg:hidden space-y-4">
              <div className="w-full">
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
                <PaginationControls
                  hasNextPage={hasNextPage}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}