'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function usePrayerRequests({ initialRequests = [] } = {}) {
  const [requests, setRequests] = useState(initialRequests);
  const [archivedRequests, setArchivedRequests] = useState([]);
  const [loading, setLoading] = useState(!initialRequests.length);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const supabase = createClient();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (!error) {
      setRequests(data);
    }
    setLoading(false);
  }, [supabase]);

  const fetchArchivedRequests = useCallback(async () => {
    setLoadingArchived(true);
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('is_archived', true)
      .order('archived_at', { ascending: false });

    if (!error) {
      setArchivedRequests(data);
    }
    setLoadingArchived(false);
  }, [supabase]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = useCallback(async (id, newStatus) => {
    const prev = [...requests];
    setRequests(current => current.map(r => r.id === id ? { ...r, status: newStatus } : r));

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Estado actualizado a ${newStatus}`);
      return true;
    } catch (err) {
      setRequests(prev);
      toast.error('Error al actualizar estado');
      return false;
    }
  }, [supabase, requests]);

  const archiveRequest = useCallback(async (requestId) => {
    const prev = [...requests];
    setRequests(current => current.filter(r => r.id !== requestId));

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', requestId);
      if (error) throw error;
      toast.success('Petición movida a la papelera');
      return true;
    } catch (err) {
      setRequests(prev);
      toast.error('Error al archivar');
      return false;
    }
  }, [supabase, requests]);

  const restoreRequest = useCallback(async (requestId) => {
    const prevArchived = [...archivedRequests];
    setArchivedRequests(current => current.filter(r => r.id !== requestId));

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ is_archived: false, archived_at: null })
        .eq('id', requestId);
      if (error) throw error;
      toast.success('Petición restaurada');
      fetchRequests();
      return true;
    } catch (err) {
      setArchivedRequests(prevArchived);
      toast.error('Error al restaurar');
      return false;
    }
  }, [supabase, archivedRequests, fetchRequests]);

  const permanentlyDeleteRequest = useCallback(async (requestId) => {
    const prevArchived = [...archivedRequests];
    setArchivedRequests(current => current.filter(r => r.id !== requestId));

    try {
      const { error } = await supabase.from('prayer_requests').delete().eq('id', requestId);
      if (error) throw error;
      toast.success('Petición eliminada definitivamente');
      return true;
    } catch (err) {
      setArchivedRequests(prevArchived);
      toast.error('Error al eliminar');
      return false;
    }
  }, [supabase, archivedRequests]);

  return {
    requests, archivedRequests, loading, loadingArchived,
    updateStatus, archiveRequest, restoreRequest, permanentlyDeleteRequest,
    fetchArchivedRequests, refetchRequests: fetchRequests,
  };
}
