import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Clock } from "lucide-react";
import { getLomPostBySlug, getLomNavigationPosts } from "@/lib/data/lom.ts";
import { formatInEcuador, formatEcuadorDateForInput } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getLomPostBySlug(slug);

  if (!post) {
    return {
      title: "Devocional no encontrado",
    };
  }

  return {
    title: {
      absolute: `${post.title} | LOM | Alianza Puembo`,
    },
    description: `Lectura diaria: ${post.title}`,
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

  const { prevPost, nextPost } = await getLomNavigationPosts(
    post.publication_date
  );

  const todayStr = formatEcuadorDateForInput(new Date());
  const nextPostDateStr = nextPost
    ? formatEcuadorDateForInput(nextPost.publication_date)
    : null;

  // Solo mostrar el siguiente si su fecha es hoy o anterior
  const showNext = nextPost && nextPostDateStr && nextPostDateStr <= todayStr;

  const publicationDate = formatInEcuador(
    post.publication_date,
    "EEEE d 'de' MMMM, yyyy"
  );

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image restricted to page height (Stops at Footer) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/recursos/lom/Lom.png"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Soft overlay to help contrast */}
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* Content Layer */}
      <main className="relative z-10 w-full pt-8 md:pt-16 pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Nav (Glass style) */}
          <div className="flex items-center justify-between px-2">
            <Link
              href="/recursos/lom"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[var(--puembo-green)] transition-colors group uppercase tracking-widest bg-white/40 backdrop-blur-xs px-4 py-2 rounded-full border border-white/50"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Ver todos los devocionales
            </Link>

            <div className="flex items-center gap-3 text-[var(--puembo-green)] bg-white/40 backdrop-blur-xs px-4 py-2 rounded-full border border-white/50">
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Lee, Ora y Medita
              </span>
            </div>
          </div>

          {/* Premium Transparent Article Card */}
          <article className="bg-white/40 backdrop-blur-sm rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden">
            <div className="p-8 md:p-16 lg:p-20">
              {/* Header Area */}
              <header className="px-4 pb-12 text-center space-y-8">
                <div className="flex flex-col items-center gap-5">
                  <div className="h-1.5 w-16 bg-[var(--puembo-green)] rounded-full shadow-lg" />
                  <p className="text-xs font-black text-[var(--puembo-green)] uppercase tracking-[0.4em]">
                    Devocional Diario
                  </p>
                </div>

                <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-[1.15] tracking-tight max-w-3xl mx-auto">
                  {post.title}
                </h1>

                <div className="flex items-center justify-center gap-4 text-gray-500 font-medium text-sm md:text-base italic">
                  <Clock className="w-4 h-4 opacity-60" />
                  <span>{publicationDate}</span>
                </div>
              </header>

              {/* Content Area */}
              <div
                className="text-gray-800 tiptap prose prose-neutral max-w-none prose-lg md:prose-xl
                  prose-p:leading-[1.8] prose-p:text-gray-700 prose-p:mb-8
                  prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900
                  prose-blockquote:border-l-[6px] prose-blockquote:border-[var(--puembo-green)] prose-blockquote:bg-white/30 prose-blockquote:py-8 prose-blockquote:px-10 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                  prose-strong:text-gray-900 prose-strong:font-bold
                  prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-12
                  prose-li:text-gray-700 prose-li:marker:text-[var(--puembo-green)]"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Navigation Footer */}
              <footer className="mt-20 pt-16 border-t border-black/5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                  {prevPost ? (
                    <Link
                      href={`/recursos/lom/${prevPost.slug}`}
                      className="flex items-center gap-6 group w-full sm:w-auto"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-gray-400 group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all border border-white/50 shadow-sm">
                        <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                          Anterior
                        </span>
                        <span className="text-base font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors">
                          Lectura Previa
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {showNext ? (
                    <Link
                      href={`/recursos/lom/${nextPost.slug}`}
                      className="flex items-center gap-6 group w-full sm:w-auto text-right justify-end"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                          Siguiente
                        </span>
                        <span className="text-base font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors">
                          Próxima Lectura
                        </span>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-gray-400 group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all border border-white/50 shadow-sm">
                        <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>
              </footer>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
