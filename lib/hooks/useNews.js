"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

export function useNews({ initialNews = [] } = {}) {
  const [news, setNews] = useState(initialNews);
  const [archivedNews, setArchivedNews] = useState([]);
  const [loading, setLoading] = useState(!initialNews.length);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const supabase = createClient();

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("*, profiles(full_name, email)")
      .eq("is_archived", false)
      .order("news_date", { ascending: false, nullsFirst: true })
      .order("news_time", { ascending: false, nullsFirst: true });

    if (!error) {
      setNews(data);
    }
    setLoading(false);
  }, [supabase]);

  const fetchArchivedNews = useCallback(async () => {
    setLoadingArchived(true);
    const { data, error } = await supabase
      .from("news")
      .select("*, profiles(full_name, email)")
      .eq("is_archived", true)
      .order("archived_at", { ascending: false });

    if (!error) {
      setArchivedNews(data);
    }
    setLoadingArchived(false);
  }, [supabase]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const saveNews = useCallback(
    async (newsData, imageFile, selectedNews = null) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let image_url = selectedNews?.image_url || null;
      let image_w = selectedNews?.image_w || null;
      let image_h = selectedNews?.image_h || null;

      if (newsData.remove_image || imageFile) {
        if (selectedNews && selectedNews.image_url) {
          const fileName = selectedNews.image_url.split("/").pop();
          await supabase.storage
            .from("news-images")
            .remove([decodeURIComponent(fileName)]);
          image_url = null;
          image_w = null;
          image_h = null;
        }
      }

      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(fileName, imageFile.file);

        if (uploadError) {
          toast.error("Error al subir imagen.");
          return { success: false };
        } else {
          const { data: urlData } = supabase.storage
            .from("news-images")
            .getPublicUrl(uploadData.path);
          image_url = urlData.publicUrl;
          image_w = imageFile.width;
          image_h = imageFile.height;
        }
      }

      const baseSlug = selectedNews && selectedNews.title === newsData.title 
        ? selectedNews.slug 
        : slugify(newsData.title);

      let slug = baseSlug;

      // Verificar colisión de slug si es nuevo o cambió el título
      if (!selectedNews || selectedNews.title !== newsData.title) {
        const { data: existing } = await supabase
          .from("news")
          .select("id")
          .eq("slug", baseSlug)
          .maybeSingle();

        if (existing && existing.id !== selectedNews?.id) {
          slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }
      }

      let dataToSave = {
        title: newsData.title,
        slug,
        description: newsData.description || null,
        news_date: newsData.news_date || null,
        news_time: newsData.news_time || null,
        publish_at: newsData.publish_at || new Date().toISOString(),
        image_url,
        image_w,
        image_h,
        is_archived: false,
      };

      if (selectedNews?.id) {
        const { error } = await supabase
          .from("news")
          .update(dataToSave)
          .eq("id", selectedNews.id);
        if (error) {
          toast.error("Error al actualizar");
          return { success: false };
        }
      } else {
        const { error } = await supabase
          .from("news")
          .insert([{ ...dataToSave, user_id: user?.id }]);
        if (error) {
          toast.error("Error al crear");
          return { success: false };
        }
      }

      await fetchNews();
      return { success: true };
    },
    [supabase, fetchNews],
  );

  const archiveNews = useCallback(
    async (newsId) => {
      const prev = [...news];
      setNews((current) => current.filter((n) => n.id !== newsId));

      try {
        const { error } = await supabase
          .from("news")
          .update({
            is_archived: true,
            archived_at: new Date().toISOString(),
          })
          .eq("id", newsId);
        if (error) throw error;
        toast.success("Noticia enviada a la papelera");
        return true;
      } catch (err) {
        setNews(prev);
        toast.error("Error al archivar");
        return false;
      }
    },
    [supabase, news],
  );

  const archiveManyNews = useCallback(
    async (newsIds) => {
      const prev = [...news];
      setNews((current) => current.filter((n) => !newsIds.includes(n.id)));

      try {
        const { error } = await supabase
          .from("news")
          .update({
            is_archived: true,
            archived_at: new Date().toISOString(),
          })
          .in("id", newsIds);
        if (error) throw error;
        toast.success(`${newsIds.length} noticias enviadas a la papelera`);
        return true;
      } catch (err) {
        setNews(prev);
        toast.error("Error al archivar noticias");
        return false;
      }
    },
    [supabase, news],
  );

  const restoreNews = useCallback(
    async (newsId) => {
      const prevArchived = [...archivedNews];
      setArchivedNews((current) => current.filter((n) => n.id !== newsId));

      try {
        const { error } = await supabase
          .from("news")
          .update({
            is_archived: false,
            archived_at: null,
          })
          .eq("id", newsId);
        if (error) throw error;
        toast.success("Noticia restaurada");
        fetchNews();
        return true;
      } catch (err) {
        setArchivedNews(prevArchived);
        toast.error("Error al restaurar");
        return false;
      }
    },
    [supabase, archivedNews, fetchNews],
  );

  const restoreManyNews = useCallback(
    async (newsIds) => {
      const prevArchived = [...archivedNews];
      setArchivedNews((current) =>
        current.filter((n) => !newsIds.includes(n.id)),
      );

      try {
        const { error } = await supabase
          .from("news")
          .update({
            is_archived: false,
            archived_at: null,
          })
          .in("id", newsIds);
        if (error) throw error;
        toast.success(`${newsIds.length} noticias restauradas`);
        fetchNews();
        return true;
      } catch (err) {
        setArchivedNews(prevArchived);
        toast.error("Error al restaurar noticias");
        return false;
      }
    },
    [supabase, archivedNews, fetchNews],
  );

  const permanentlyDeleteNews = useCallback(
    async (newsId) => {
      const prevArchived = [...archivedNews];
      setArchivedNews((current) => current.filter((n) => n.id !== newsId));

      try {
        const { data: item } = await supabase
          .from("news")
          .select("image_url")
          .eq("id", newsId)
          .single();
        if (item?.image_url) {
          const fileName = item.image_url.split("/").pop();
          await supabase.storage
            .from("news-images")
            .remove([decodeURIComponent(fileName)]);
        }
        const { error } = await supabase.from("news").delete().eq("id", newsId);
        if (error) throw error;
        toast.success("Noticia eliminada permanentemente");
        return true;
      } catch (err) {
        setArchivedNews(prevArchived);
        toast.error("Error al eliminar");
        return false;
      }
    },
    [supabase, archivedNews],
  );

  const permanentlyDeleteManyNews = useCallback(
    async (newsIds) => {
      const prevArchived = [...archivedNews];
      setArchivedNews((current) =>
        current.filter((n) => !newsIds.includes(n.id)),
      );

      try {
        const { data: items } = await supabase
          .from("news")
          .select("image_url")
          .in("id", newsIds);
        const fileNames = items
          ?.map((i) => i.image_url?.split("/").pop())
          .filter(Boolean)
          .map((name) => decodeURIComponent(name));

        if (fileNames?.length > 0) {
          await supabase.storage.from("news-images").remove(fileNames);
        }

        const { error } = await supabase
          .from("news")
          .delete()
          .in("id", newsIds);
        if (error) throw error;
        toast.success(`${newsIds.length} noticias eliminadas definitivamente`);
        return true;
      } catch (err) {
        setArchivedNews(prevArchived);
        toast.error("Error al eliminar noticias");
        return false;
      }
    },
    [supabase, archivedNews],
  );

  const emptyRecycleBin = useCallback(async () => {
    const ids = archivedNews.map((n) => n.id);
    if (ids.length === 0) return true;
    return permanentlyDeleteManyNews(ids);
  }, [archivedNews, permanentlyDeleteManyNews]);

  return {
    news,
    archivedNews,
    loading,
    loadingArchived,
    saveNews,
    archiveNews,
    archiveManyNews,
    restoreNews,
    restoreManyNews,
    permanentlyDeleteNews,
    permanentlyDeleteManyNews,
    emptyRecycleBin,
    fetchArchivedNews,
    refetchNews: fetchNews,
  };
}
