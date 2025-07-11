
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { contentSection } from '@/lib/styles';
import { PageHeader } from "@/components/public/layout/pages/PageHeader";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getLomPost(slug);

  if (!post) {
    return {
      title: 'Devocional no encontrado',
    };
  }

  return {
    title: {
      absolute: `${post.title} | Devocionales LOM | Alianza Puembo`,
    },
    description: post.content.substring(0, 160), // Basic description from content
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
    },
  };
}

async function getLomPost(slug) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase
    .from('lom_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

async function getAdjacentPosts(currentPostDate) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: prevPost } = await supabase
    .from('lom_posts')
    .select('slug, title')
    .order('created_at', { ascending: false })
    .lt('created_at', currentPostDate)
    .limit(1)
    .single();

  const { data: nextPost } = await supabase
    .from('lom_posts')
    .select('slug, title')
    .order('created_at', { ascending: true })
    .gt('created_at', currentPostDate)
    .limit(1)
    .single();

  return { prevPost, nextPost };
}


export default async function LomPostPage({ params }) {
  const { slug } = await params;
  const post = await getLomPost(slug);

  if (!post) {
    notFound();
  }

  const { prevPost, nextPost } = await getAdjacentPosts(post.created_at);

  const publicationDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Guayaquil',
  });

  return (
    <section>
      <PageHeader
        title={post.title}
        description={publicationDate}
        imageUrl="/recursos/lom/Lom.png"
        imageAlt="Nubes en el cielo con luz del sol"
      />

      <div className={contentSection}>
        <div
          className="text-gray-700 mb-4 text-justify tiptap max-w-4xl mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="flex justify-between items-center mt-12 border-t pt-6 md:px-16">
          {prevPost ? (
            <Button asChild variant="green">
              <Link href={`/recursos/lom/${prevPost.slug}`} className="flex items-center gap-2">
                <ChevronLeft size={16} />
                Anterior
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Button asChild variant="green">
              <Link href={`/recursos/lom/${nextPost.slug}`} className="flex items-center gap-2">
                Siguiente
                <ChevronRight size={16} />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </section>
  );
}
