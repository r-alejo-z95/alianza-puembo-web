'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const lomSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres.'),
});

export default function LomManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

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

  const onSubmit = async (data) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const dataToSave = {
      ...data,
      publication_date: new Date().toISOString(),
      user_id: user?.id,
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
                {selectedPost ? 'Actualizar Devocional' : 'Publicar Devocional'}
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
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Título</TableHead>
                  <TableHead className="font-bold">Fecha de Publicación</TableHead>
                  <TableHead className="font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {post.title}
                    </TableCell>
                    <TableCell>{new Date(post.publication_date).toLocaleDateString()}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(post)}>Editar</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Eliminar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el devocional.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(post.id)}>Continuar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
