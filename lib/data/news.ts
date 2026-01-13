import { createClient } from '@/lib/supabase/server';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url?: string;
  image_w?: number;
  image_h?: number;
  created_at: string;
}

/**
 * @description Obtiene las noticias paginadas.
 * @param {number} page - El número de página actual.
 * @param {number} newsPerPage - El número de noticias por página.
 * @returns {Promise<{paginatedNews: Array, totalPages: number, hasNextPage: boolean}>} Un objeto con las noticias paginadas y la información de paginación.
 */
export async function getNews(page: number = 1, newsPerPage: number = 6): Promise<{ paginatedNews: NewsItem[], totalPages: number, hasNextPage: boolean }> {
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
    return { paginatedNews: [], totalPages: 0, hasNextPage: false };
  }

  const totalPages = Math.ceil(news.length / newsPerPage);
  const paginatedNews = news.slice(
    (page - 1) * newsPerPage,
    page * newsPerPage
  );

  const hasNextPage = page * newsPerPage < news.length;

  return { paginatedNews, totalPages, hasNextPage };
}
