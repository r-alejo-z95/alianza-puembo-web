'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useForms({ initialForms = [] } = {}) {
  const [forms, setForms] = useState(initialForms);
  const [archivedForms, setArchivedForms] = useState([]);
  const [loading, setLoading] = useState(!initialForms.length);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const supabase = createClient();

  const fetchForms = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('forms')
      .select('*, profiles(full_name, email)')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (!error) {
      setForms(data);
    }
    setLoading(false);
  }, [supabase]);

  const fetchArchivedForms = useCallback(async () => {
    setLoadingArchived(true);
    const { data, error } = await supabase
      .from('forms')
      .select('*, profiles(full_name, email)')
      .eq('is_archived', true)
      .order('archived_at', { ascending: false });

    if (!error) {
      setArchivedForms(data);
    }
    setLoadingArchived(false);
  }, [supabase]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const archiveForm = useCallback(async (formId) => {
    const itemToArchive = forms.find(f => f.id === formId);
    if (!itemToArchive) return false;

    const prevForms = [...forms];
    const prevArchived = [...archivedForms];

    setForms(current => current.filter(f => f.id !== formId));
    setArchivedForms(current => [{ ...itemToArchive, is_archived: true, archived_at: new Date().toISOString() }, ...current]);

    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', formId);
      if (error) throw error;
      toast.success('Formulario movido a la papelera');
      return true;
    } catch (err) {
      setForms(prevForms);
      setArchivedForms(prevArchived);
      toast.error('Error al archivar el formulario');
      return false;
    }
  }, [supabase, forms, archivedForms]);

  const restoreForm = useCallback(async (formId) => {
    const itemToRestore = archivedForms.find(f => f.id === formId);
    if (!itemToRestore) return false;

    const prevForms = [...forms];
    const prevArchived = [...archivedForms];

    setArchivedForms(current => current.filter(f => f.id !== formId));
    setForms(current => [{ ...itemToRestore, is_archived: false, archived_at: null }, ...current]);

    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_archived: false, archived_at: null })
        .eq('id', formId);
      if (error) throw error;
      toast.success('Formulario restaurado');
      fetchForms();
      return true;
    } catch (err) {
      setForms(prevForms);
      setArchivedForms(prevArchived);
      toast.error('Error al restaurar el formulario');
      return false;
    }
  }, [supabase, forms, archivedForms, fetchForms]);

  const permanentlyDeleteForm = useCallback(async (formId) => {
    const prevArchived = [...archivedForms];
    setArchivedForms(current => current.filter(f => f.id !== formId));

    try {
      const { data: formToDelete } = await supabase
        .from("forms")
        .select("image_url, form_fields(attachment_url)")
        .eq("id", formId)
        .single();

      const filesToDelete = [];
      if (formToDelete?.image_url) filesToDelete.push(formToDelete.image_url.split("/").pop());
      if (formToDelete?.form_fields) {
        formToDelete.form_fields.forEach(f => {
          if (f.attachment_url) filesToDelete.push(f.attachment_url.split("/").pop());
        });
      }

      if (filesToDelete.length > 0) {
        await supabase.storage.from("forms").remove(filesToDelete.map(f => decodeURIComponent(f)));
      }

      const { error } = await supabase.from('forms').delete().eq('id', formId);
      if (error) throw error;

      toast.success('Formulario eliminado definitivamente');
      return true;
    } catch (err) {
      setArchivedForms(prevArchived);
      toast.error('Error al eliminar definitivamente');
      return false;
    }
  }, [supabase, archivedForms]);

  return {
    forms, archivedForms, loading, loadingArchived,
    archiveForm, restoreForm, permanentlyDeleteForm,
    fetchArchivedForms, refetchForms: fetchForms,
  };
}
