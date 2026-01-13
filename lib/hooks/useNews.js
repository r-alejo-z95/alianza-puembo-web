"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useNews({ initialNews = [] } = {}) {
  const [news, setNews] = useState(initialNews);
  const [loading, setLoading] = useState(!initialNews.length);

  const supabase = createClient();

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: true, nullsFirst: true });

    if (error) {
      console.error("Error fetching news:", error);
      toast.error("Error al cargar las noticias.");
    } else {
      setNews(data);
    }
    setLoading(false);
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

      // Handle image upload
      if (imageFile) {
        if (selectedNews && selectedNews.image_url) {
          const oldFileName = selectedNews.image_url.split("/").pop();
          const { error: deleteOldStorageError } = await supabase.storage
            .from("news-images")
            .remove([oldFileName]);

          if (deleteOldStorageError) {
            console.error(
              "Error deleting old image from storage:",
              deleteOldStorageError
            );
            // Don't block execution, just log warning
          }
        }

        const fileName = `${Date.now()}_${imageFile.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(fileName, imageFile.file);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Error al subir la imagen de la noticia.");
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

      // Prepare news data
      let dataToSave = {
        title: newsData.title,
        description: newsData.description || null,
        date: newsData.date || null,
        time: newsData.time || null,
        image_w,
        image_h,
      };

      // Save or update news
      if (selectedNews?.id) {
        const { error } = await supabase
          .from("news")
          .update(dataToSave)
          .eq("id", selectedNews.id);

        if (error) {
          console.error("Error updating news:", error);
          toast.error(
            `Error al actualizar la noticia: ${error.message || "Error desconocido"}`
          );
          return { success: false };
        } else {
          toast.success("Noticia actualizada con éxito.");
        }
      } else {
        const { error } = await supabase
          .from("news")
          .insert([{ ...dataToSave, user_id: user?.id }]);

        if (error) {
          console.error("Error creating news:", error);
          toast.error(
            `Error al crear la noticia: ${error.message || "Error desconocido"}`
          );
          return { success: false };
        } else {
          toast.success("Noticia creada con éxito.");
        }
      }

      await fetchNews();
      return { success: true };
    },
    [supabase, fetchNews]
  );

  const deleteNews = useCallback(
    async (newsId) => {
      // Get the news to get image_url before deleting it
      const { data: newsToDelete, error: fetchError } = await supabase
        .from("news")
        .select("image_url")
        .eq("id", newsId)
        .single();

      if (fetchError) {
        console.error("Error fetching news for deletion:", fetchError);
        toast.error("Error al obtener la noticia para eliminar.");
        return false;
      }

      // If there's an image_url, delete the file from storage
      if (newsToDelete.image_url) {
        const fileName = newsToDelete.image_url.split("/").pop();
        const { error: deleteStorageError } = await supabase.storage
          .from("news-images")
          .remove([fileName]);

        if (deleteStorageError) {
          console.error(
            "Error deleting image from storage:",
            deleteStorageError
          );
          toast.error("Error al eliminar la imagen del almacenamiento.");
        }
      }

      // Delete the news record from database
      const { error: deleteDbError } = await supabase
        .from("news")
        .delete()
        .eq("id", newsId);
      if (deleteDbError) {
        console.error("Error deleting news from database:", deleteDbError);
        toast.error("Error al eliminar la noticia de la base de datos.");
        return false;
      } else {
        toast.success("Noticia eliminada con éxito.");
        await fetchNews();
        return true;
      }
    },
    [supabase, fetchNews]
  );

  return {
    news,
    loading,
    saveNews,
    deleteNews,
    refetchNews: fetchNews,
  };
}
