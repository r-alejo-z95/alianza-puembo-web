import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { pageSection, pageHeaderContainer, pageTitle, pageDescription, sectionTitle } from "@/lib/styles";
import { PaginationControls } from "@/components/public/PaginationControls";

export default async function Lom({ searchParams }) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page) || 1;
  const postsPerPage = 1;

  const { data: posts, error, count } = await supabase
    .from('lom_posts')
    .select('*')
    .order('publication_date', { ascending: false });

  if (error) {
    console.error('Error fetching LOM posts:', error);
    return <p>Error al cargar los devocionales.</p>;
  }

  const totalPages = Math.ceil(count / postsPerPage);
  const paginatedPosts = posts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  const hasNextPage = page * postsPerPage < count;

  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Devocionales LOM
        </h1>
        <p className={pageDescription}>
          Alimento espiritual para tu día a día.
        </p>
      </div>
      {paginatedPosts.length === 0 ? (
        <p className="text-center text-lg min-h-[60vh] flex items-center justify-center">No hay devocionales publicados por el momento.</p>
      ) : (
        <div className="flex flex-col gap-12 w-full max-w-3xl mx-auto">
          {paginatedPosts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <h2 className={cn(sectionTitle, "text-3xl mb-2")}>{post.title}</h2>
              <p className="text-gray-600 text-sm mb-4">
                {new Date(post.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Guayaquil' })}
              </p>
              <div className="text-gray-700 mb-4 text-justify tiptap max-w-none" dangerouslySetInnerHTML={{ __html: post.content }}></div>
            </div>
          ))}
          {totalPages > 1 && (
            <PaginationControls hasNextPage={hasNextPage} totalPages={totalPages} basePath="/recursos/lom" />
          )}
        </div>
      )}
    </section>
  );
}