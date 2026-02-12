'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { revalidateFormSubmissions } from '@/lib/actions/cache';

export function useFormSubmissions({ formId, initialSubmissions = [] } = {}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [archivedSubmissions, setArchivedSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const supabase = createClient();

  const fetchSubmissions = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*, profiles(*)')
      .eq('form_id', formId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (!error) {
      setSubmissions(data);
    }
    setLoading(false);
  }, [supabase, formId]);

  const fetchArchivedSubmissions = useCallback(async () => {
    if (!formId) return;
    setLoadingArchived(true);
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*, profiles(*)')
      .eq('form_id', formId)
      .eq('is_archived', true)
      .order('archived_at', { ascending: false });

    if (!error) {
      setArchivedSubmissions(data);
    }
    setLoadingArchived(false);
  }, [supabase, formId]);

  useEffect(() => {
    if (!initialSubmissions.length && formId) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, formId, initialSubmissions.length]);

  const archiveSubmission = useCallback(async (id) => {
    const itemToArchive = submissions.find(s => s.id === id);
    if (!itemToArchive) return false;

    const prevSubmissions = [...submissions];
    const prevArchived = [...archivedSubmissions];

    const now = new Date().toISOString();
    setSubmissions(current => current.filter(s => s.id !== id));
    setArchivedSubmissions(current => [{ ...itemToArchive, is_archived: true, archived_at: now }, ...current]);

    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ is_archived: true, archived_at: now })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Respuesta movida a la papelera');
      await revalidateFormSubmissions(formId);
      return true;
    } catch (err) {
      setSubmissions(prevSubmissions);
      setArchivedSubmissions(prevArchived);
      toast.error('Error al archivar la respuesta');
      return false;
    }
  }, [supabase, submissions, archivedSubmissions, formId]);

  const archiveManySubmissions = useCallback(async (ids) => {
    const prevSubmissions = [...submissions];
    const now = new Date().toISOString();
    
    setSubmissions(current => current.filter(s => !ids.includes(s.id)));

    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ is_archived: true, archived_at: now })
        .in('id', ids);
      
      if (error) throw error;
      toast.success(`${ids.length} respuestas movidas a la papelera`);
      await revalidateFormSubmissions(formId);
      return true;
    } catch (err) {
      setSubmissions(prevSubmissions);
      toast.error('Error al archivar respuestas');
      return false;
    }
  }, [supabase, submissions, formId]);

  const restoreSubmission = useCallback(async (id) => {
    const itemToRestore = archivedSubmissions.find(s => s.id === id);
    if (!itemToRestore) return false;

    const prevSubmissions = [...submissions];
    const prevArchived = [...archivedSubmissions];

    setArchivedSubmissions(current => current.filter(s => s.id !== id));
    setSubmissions(current => [{ ...itemToRestore, is_archived: false, archived_at: null }, ...current]);

    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ is_archived: false, archived_at: null })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Respuesta restaurada');
      await revalidateFormSubmissions(formId);
      return true;
    } catch (err) {
      setSubmissions(prevSubmissions);
      setArchivedSubmissions(prevArchived);
      toast.error('Error al restaurar la respuesta');
      return false;
    }
  }, [supabase, submissions, archivedSubmissions, formId]);

  const restoreManySubmissions = useCallback(async (ids) => {
    const prevArchived = [...archivedSubmissions];
    setArchivedSubmissions(current => current.filter(s => !ids.includes(s.id)));

    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ is_archived: false, archived_at: null })
        .in('id', ids);
      
      if (error) throw error;
      toast.success(`${ids.length} respuestas restauradas`);
      await revalidateFormSubmissions(formId);
      fetchSubmissions();
      return true;
    } catch (err) {
      setArchivedSubmissions(prevArchived);
      toast.error('Error al restaurar respuestas');
      return false;
    }
  }, [supabase, archivedSubmissions, fetchSubmissions, formId]);

  const permanentlyDeleteSubmission = useCallback(async (id) => {
    const prevArchived = [...archivedSubmissions];
    setArchivedSubmissions(current => current.filter(s => s.id !== id));

    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Respuesta eliminada definitivamente');
      await revalidateFormSubmissions(formId);
      return true;
    } catch (err) {
      setArchivedSubmissions(prevArchived);
      toast.error('Error al eliminar definitivamente');
      return false;
    }
  }, [supabase, archivedSubmissions, formId]);

  const permanentlyDeleteManySubmissions = useCallback(async (ids) => {
    const prevArchived = [...archivedSubmissions];
    setArchivedSubmissions(current => current.filter(s => !ids.includes(s.id)));

    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      toast.success(`${ids.length} respuestas eliminadas definitivamente`);
      await revalidateFormSubmissions(formId);
      return true;
    } catch (err) {
      setArchivedSubmissions(prevArchived);
      toast.error('Error al eliminar respuestas');
      return false;
    }
  }, [supabase, archivedSubmissions, formId]);

  const emptyRecycleBin = useCallback(async () => {
    const ids = archivedSubmissions.map(s => s.id);
    if (ids.length === 0) return true;
    return permanentlyDeleteManySubmissions(ids);
  }, [archivedSubmissions, permanentlyDeleteManySubmissions]);

  return {
    submissions,
    archivedSubmissions,
    loading,
    loadingArchived,
    archiveSubmission,
    archiveManySubmissions,
    restoreSubmission,
    restoreManySubmissions,
    permanentlyDeleteSubmission,
    permanentlyDeleteManySubmissions,
    emptyRecycleBin,
    fetchArchivedSubmissions,
    refetchSubmissions: fetchSubmissions,
  };
}
