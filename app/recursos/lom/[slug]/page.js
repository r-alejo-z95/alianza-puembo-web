
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { contentSection } from '@/lib/styles';
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { getLomPostBySlug, getLomNavigationPosts } from '@/lib/data/lom.ts';

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getLomPostBySlug(slug);

  if (!post) {
    return {
      title: 'Devocional no encontrado',
    };
  }

  return {
    title: {
      absolute: `${post.title} | Devocionales LOM | Alianza Puembo`,
    },
    description: `Lee, ora y medita con el devocional "${post.title}" de Alianza Puembo.`,
    openGraph: {
      title: post.title,
      description: `Lee, ora y medita con el devocional "${post.title}" de Alianza Puembo.`,
    },
    alternates: {
      canonical: `/recursos/lom/${slug}`,
    },
  };
}

export default async function LomPostPage({ params }) {
  const { slug } = await params;
  const post = await getLomPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { prevPost, nextPost } = await getLomNavigationPosts(post.created_at);

  const publicationDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Guayaquil',
  });

  return (
    <PublicPageLayout
      title={post.title}
      description={publicationDate}
      imageUrl="/recursos/lom/Lom.png"
      imageAlt="Nubes en el cielo con luz del sol"
    >

      <div className={contentSection}>
        <div>
          <Link href="/recursos/lom">
            <Button variant="green">
              Regresar
            </Button>
          </Link>
        </div>
        <div
          className="text-gray-700 mb-4 text-justify tiptap max-w-4xl mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <nav className="flex justify-between items-center mt-12 border-t pt-6">
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
        </nav>
      </div>
    </PublicPageLayout>
  );
}
