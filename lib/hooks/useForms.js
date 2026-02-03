'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useForms({ initialForms = [], isInternal = null } = {}) {
  const [forms, setForms] = useState(initialForms);
  const [archivedForms, setArchivedForms] = useState([]);
  const [loading, setLoading] = useState(!initialForms.length);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const supabase = createClient();

  const fetchForms = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('forms')
      .select('*, profiles(full_name, email), form_fields(*)')
      .eq('is_archived', false);
    
    if (isInternal !== null) {
      query = query.eq('is_internal', isInternal);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error) {
      setForms(data);
    }
    setLoading(false);
  }, [supabase, isInternal]);

  const fetchArchivedForms = useCallback(async () => {
    setLoadingArchived(true);
    let query = supabase
      .from('forms')
      .select('*, profiles(full_name, email), form_fields(*)')
      .eq('is_archived', true);

    if (isInternal !== null) {
      query = query.eq('is_internal', isInternal);
    }

    const { data, error } = await query.order('archived_at', { ascending: false });

    if (!error) {
      setArchivedForms(data);
    }
    setLoadingArchived(false);
  }, [supabase, isInternal]);

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

  const archiveManyForms = useCallback(async (formIds) => {
    const prevForms = [...forms];
    setForms(current => current.filter(f => !formIds.includes(f.id)));

    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .in('id', formIds);
      if (error) throw error;
      toast.success(`${formIds.length} formularios movidos a la papelera`);
      return true;
    } catch (err) {
      setForms(prevForms);
      toast.error('Error al archivar formularios');
      return false;
    }
  }, [supabase, forms]);

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

  const restoreManyForms = useCallback(async (formIds) => {
    const prevArchived = [...archivedForms];
    setArchivedForms(current => current.filter(f => !formIds.includes(f.id)));

    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_archived: false, archived_at: null })
        .in('id', formIds);
      if (error) throw error;
      toast.success(`${formIds.length} formularios restaurados`);
      fetchForms();
      return true;
    } catch (err) {
      setArchivedForms(prevArchived);
      toast.error('Error al restaurar formularios');
      return false;
    }
  }, [supabase, archivedForms, fetchForms]);

  const permanentlyDeleteForm = useCallback(async (formId) => {
    const prevArchived = [...archivedForms];
    setArchivedForms(current => current.filter(f => f.id !== formId));

    try {
      // 1. Obtener datos para limpiar storage
      const { data: formToDelete } = await supabase
        .from("forms")
        .select("image_url, form_fields(attachment_url)")
        .eq("id", formId)
        .single();

      const pathsToDelete = [];
      
      // Función helper para extraer el path después de /forms/
      const extractPath = (url) => {
        if (!url || !url.includes("/forms/")) return null;
        return url.split("/forms/")[1];
      };

      if (formToDelete?.image_url) {
        const path = extractPath(formToDelete.image_url);
        if (path) pathsToDelete.push(path);
      }

      if (formToDelete?.form_fields) {
        formToDelete.form_fields.forEach(f => {
          if (f.attachment_url) {
            const path = extractPath(f.attachment_url);
            if (path) pathsToDelete.push(path);
          }
        });
      }

      // 2. Limpiar Storage
      if (pathsToDelete.length > 0) {
        const { error: storageErr } = await supabase.storage
          .from("forms")
          .remove(pathsToDelete.map(p => decodeURIComponent(p)));
        
        if (storageErr) console.error("Error cleaning storage:", storageErr);
      }

      // 3. Borrar de la base de datos (CASCADE se encargará de los form_fields)
      const { error } = await supabase.from('forms').delete().eq('id', formId);
      if (error) throw error;

      toast.success('Formulario y archivos eliminados definitivamente');
      return true;
    } catch (err) {
      setArchivedForms(prevArchived);
      toast.error('Error al eliminar definitivamente');
      return false;
    }
  }, [supabase, archivedForms]);

  const permanentlyDeleteManyForms = useCallback(async (formIds) => {
    const prevArchived = [...archivedForms];
    setArchivedForms(current => current.filter(f => !formIds.includes(f.id)));

    try {
      // 1. Obtener datos de todos los formularios
      const { data: formsToDelete } = await supabase
        .from("forms")
        .select("image_url, form_fields(attachment_url)")
        .in("id", formIds);

      const pathsToDelete = [];
      const extractPath = (url) => {
        if (!url || !url.includes("/forms/")) return null;
        return url.split("/forms/")[1];
      };

      formsToDelete?.forEach(formToDelete => {
        if (formToDelete.image_url) {
          const path = extractPath(formToDelete.image_url);
          if (path) pathsToDelete.push(path);
        }
        if (formToDelete.form_fields) {
          formToDelete.form_fields.forEach(f => {
            if (f.attachment_url) {
              const path = extractPath(f.attachment_url);
              if (path) pathsToDelete.push(path);
            }
          });
        }
      });

      // 2. Limpiar Storage
      if (pathsToDelete.length > 0) {
        await supabase.storage
          .from("forms")
          .remove(pathsToDelete.map(p => decodeURIComponent(p)));
      }

      // 3. Borrar de DB
      const { error } = await supabase.from('forms').delete().in('id', formIds);
      if (error) throw error;

      toast.success(`${formIds.length} formularios eliminados definitivamente`);
      return true;
    } catch (err) {
      setArchivedForms(prevArchived);
      toast.error('Error al eliminar formularios');
      return false;
    }
  }, [supabase, archivedForms]);

  const emptyRecycleBin = useCallback(async () => {
    const ids = archivedForms.map(f => f.id);
    if (ids.length === 0) return true;
    return permanentlyDeleteManyForms(ids);
  }, [archivedForms, permanentlyDeleteManyForms]);

  return {
    forms, archivedForms, loading, loadingArchived,
    archiveForm, archiveManyForms, restoreForm, restoreManyForms,
    permanentlyDeleteForm, permanentlyDeleteManyForms, emptyRecycleBin,
    fetchArchivedForms, refetchForms: fetchForms,
  };
}