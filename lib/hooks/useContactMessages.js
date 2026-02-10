'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useContactMessages({ initialMessages = [] } = {}) {
  const [messages, setMessages] = useState(initialMessages);
  const [archivedMessages, setArchivedMessages] = useState([]);
  const [loading, setLoading] = useState(initialMessages.length === 0);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*, replied_by:profiles(full_name, email)')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (!error) {
      setMessages(data);
    }
    setLoading(false);
  }, [supabase]);

  const fetchArchivedMessages = useCallback(async () => {
    setLoadingArchived(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*, replied_by:profiles(full_name, email)')
      .eq('is_archived', true)
      .order('archived_at', { ascending: false });

    if (!error) {
      setArchivedMessages(data);
    }
    setLoadingArchived(false);
  }, [supabase]);

  useEffect(() => {
    if (initialMessages.length === 0) {
      fetchMessages();
    }
  }, [fetchMessages, initialMessages]);

  const markAsRead = useCallback(async (id) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', id);
    
    if (!error) {
      setMessages(current => 
        current.map(m => m.id === id && m.status === 'unread' ? { ...m, status: 'read' } : m)
      );
    }
  }, [supabase]);

  const archiveMessage = useCallback(async (id) => {
    const itemToArchive = messages.find(m => m.id === id);
    if (!itemToArchive) return false;

    setMessages(current => current.filter(m => m.id !== id));
    
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      fetchMessages();
      toast.error('Error al archivar el mensaje');
      return false;
    }
    toast.success('Mensaje movido a la papelera');
    return true;
  }, [supabase, messages, fetchMessages]);

  const restoreMessage = useCallback(async (id) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_archived: false, archived_at: null })
      .eq('id', id);

    if (error) {
      toast.error('Error al restaurar el mensaje');
      return false;
    }
    fetchMessages();
    fetchArchivedMessages();
    toast.success('Mensaje restaurado');
    return true;
  }, [supabase, fetchMessages, fetchArchivedMessages]);

  const deleteMessagePermanently = useCallback(async (id) => {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error al eliminar permanentemente');
      return false;
    }
    fetchArchivedMessages();
    toast.success('Mensaje eliminado definitivamente');
    return true;
  }, [supabase, fetchArchivedMessages]);

  return {
    messages,
    archivedMessages,
    loading,
    loadingArchived,
    markAsRead,
    archiveMessage,
    restoreMessage,
    deleteMessagePermanently,
    refetchMessages: fetchMessages,
    fetchArchivedMessages
  };
}
