import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { pageSection, pageHeaderContainer, pageTitle, pageDescription, sectionTitle } from "@/lib/styles";

export default async function Lom({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page) || 0;
  const postsPerPage = 1;

  const { data: posts, error, count } = await supabase
    .from('lom_posts')
    .select('*', { count: 'exact' })
    .order('publication_date', { ascending: false })
    .range(page * postsPerPage, (page + 1) * postsPerPage - 1);

  if (error) {
    console.error('Error fetching LOM posts:', error);
    return <p>Error al cargar los devocionales.</p>;
  }

  const hasOlderDevocional = (page + 1) * postsPerPage < count;
  const hasNewerDevocional = page > 0;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-merriweather">
          Devocionales LOM
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Alimento espiritual para tu día a día.
        </p>
      </div>
      {posts.length === 0 ? (
        <p className="text-center text-lg min-h-[60vh] flex items-center justify-center">No hay devocionales publicados por el momento.</p>
      ) : (
        <div className="flex flex-col gap-12 w-full max-w-3xl mx-auto">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <h2 className={cn(sectionTitle, "text-3xl mb-2")}>{post.title}</h2>
              <p className="text-gray-600 text-sm mb-4">
                {new Date(post.publication_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
              </p>
              <div className="text-gray-700 mb-4 text-justify tiptap max-w-none" dangerouslySetInnerHTML={{ __html: post.content }}></div>
            </div>
          ))}
          <div className="flex justify-between w-full mt-8">
            {hasOlderDevocional ? (
              <Button asChild className="px-4 py-2 bg-(--puembo-green) text-white rounded-md hover:bg-[hsl(92,45.9%,40%)]">
                <Link href={`/recursos/lom?page=${page + 1}`}>Devocional Anterior</Link>
              </Button>
            ) : (
              <div className="w-[1px]" />
            )}
            {hasNewerDevocional ? (
              <Button asChild className="px-4 py-2 bg-(--puembo-green) text-white rounded-md hover:bg-[hsl(92,45.9%,40%)]">
                <Link href={`/recursos/lom?page=${page - 1}`}>Devocional Siguiente</Link>
              </Button>
            ) : (
              <div className="w-[1px]" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
