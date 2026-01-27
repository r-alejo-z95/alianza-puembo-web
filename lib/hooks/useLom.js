'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useLom({ type = 'posts', initialItems = [] } = {}) {
  const table = type === 'posts' ? 'lom_posts' : 'lom_passages';
  const [items, setItems] = useState(initialItems);
  const [archivedItems, setArchivedItems] = useState([]);
  const [loading, setLoading] = useState(!initialItems.length);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select('*, profiles(full_name, email)').eq('is_archived', false);
    
    if (type === 'posts') {
      query = query.order('publication_date', { ascending: false });
    } else {
      query = query.order('week_number', { ascending: false }).order('day_of_week', { ascending: true });
    }

    const { data, error } = await query;
    if (!error) {
      setItems(data);
    }
    setLoading(false);
  }, [supabase, table, type]);

  const fetchArchivedItems = useCallback(async () => {
    setLoadingArchived(true);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*, profiles(full_name, email)')
        .eq('is_archived', true)
        .order('archived_at', { ascending: false });

      if (error) throw error;
      setArchivedItems(data || []);
    } catch (error) {
      console.error(`Error fetching archived ${type}:`, error);
      toast.error('Error al cargar la papelera');
    } finally {
      setLoadingArchived(false);
    }
  }, [supabase, table, type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const archiveItem = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;

      setItems(current => current.filter(i => i.id !== id));
      toast.success('Elemento movido a la papelera');
      return true;
    } catch (err) {
      console.error(`Error archiving ${type}:`, err);
      toast.error('Error al archivar');
      return false;
    }
  }, [supabase, table, type]);

  const archiveManyItems = useCallback(async (ids) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .in('id', ids);
      
      if (error) throw error;

      setItems(current => current.filter(i => !ids.includes(i.id)));
      toast.success(`${ids.length} elementos movidos a la papelera`);
      return true;
    } catch (err) {
      console.error(`Error archiving many ${type}:`, err);
      toast.error('Error al archivar elementos');
      return false;
    }
  }, [supabase, table, type]);

  const restoreItem = useCallback(async (id) => {
    const itemToRestore = archivedItems.find(i => i.id === id);
    if (!itemToRestore) return false;

    const prevItems = [...items];
    const prevArchived = [...archivedItems];

    setArchivedItems(current => current.filter(i => i.id !== id));
    setItems(current => [{ ...itemToRestore, is_archived: false, archived_at: null }, ...current]);

    try {
      const { error } = await supabase
        .from(table)
        .update({ is_archived: false, archived_at: null })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Elemento restaurado');
      fetchItems();
      return true;
    } catch (err) {
      setItems(prevItems);
      setArchivedItems(prevArchived);
      toast.error('Error al restaurar');
      return false;
    }
  }, [supabase, items, archivedItems, fetchItems, table]);

  const restoreManyItems = useCallback(async (ids) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_archived: false, archived_at: null })
        .in('id', ids);
      
      if (error) throw error;
      toast.success(`${ids.length} elementos restaurados`);
      fetchItems();
      return true;
    } catch (err) {
      console.error(`Error restoring many ${type}:`, err);
      toast.error('Error al restaurar elementos');
      return false;
    }
  }, [supabase, fetchItems, table, type]);

  const permanentlyDeleteItem = useCallback(async (id) => {
    const prevArchived = [...archivedItems];
    setArchivedItems(current => current.filter(i => i.id !== id));

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success('Eliminado definitivamente');
      return true;
    } catch (err) {
      setArchivedItems(prevArchived);
      toast.error('Error al eliminar');
      return false;
    }
  }, [supabase, archivedItems, table]);

  const permanentlyDeleteManyItems = useCallback(async (ids) => {
    const prevArchived = [...archivedItems];
    setArchivedItems(current => current.filter(i => !ids.includes(i.id)));

    try {
      const { error } = await supabase.from(table).delete().in('id', ids);
      if (error) throw error;
      toast.success(`${ids.length} elementos eliminados definitivamente`);
      return true;
    } catch (err) {
      setArchivedItems(prevArchived);
      toast.error('Error al eliminar elementos');
      return false;
    }
  }, [supabase, archivedItems, table]);

  const emptyRecycleBin = useCallback(async () => {
    const ids = archivedItems.map(i => i.id);
    if (ids.length === 0) return true;
    return permanentlyDeleteManyItems(ids);
  }, [archivedItems, permanentlyDeleteManyItems]);

  return {
    items, archivedItems, loading, loadingArchived,
    archiveItem, archiveManyItems, restoreItem, restoreManyItems,
    permanentlyDeleteItem, permanentlyDeleteManyItems, emptyRecycleBin,
    fetchArchivedItems, refetchItems: fetchItems,
  };
}