import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, BookOpen, Clock } from "lucide-react";
import { getLomPostBySlug, getLomNavigationPosts } from "@/lib/data/lom.ts";
import {
  formatEcuadorDateForInput,
  formatLiteralDate,
  getTodayEcuadorDateLiteral,
} from "@/lib/date-utils";

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
    post.publication_date,
  );

  const todayStr = getTodayEcuadorDateLiteral();
  const nextPostDateStr = nextPost ? nextPost.publication_date : null;

  const showNext = nextPost && nextPostDateStr && nextPostDateStr <= todayStr;

  const publicationDate = formatLiteralDate(
    post.publication_date,
    "EEEE d 'de' MMMM, yyyy",
  );

  return (
    <div className="relative min-h-screen w-full bg-[#FDFDFD]">
      {/* Cinematic Full-Height Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/recursos/lom/Lom.avif"
          alt="Background"
          fill
          priority
          className="object-cover object-center brightness-[0.7]"
        />
      </div>

      <main className="relative z-10 w-full pt-28 pb-20 md:pb-32 px-3 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between px-2 md:px-4">
            <Link
              href="/recursos/lom"
              className="inline-flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/70 hover:text-white transition-all group"
            >
              <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform text-[var(--puembo-green)]" />
              Regresar al Índice
            </Link>

            <div className="hidden md:flex items-center gap-4 text-white/40">
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Lee, Ora y Medita
              </span>
            </div>
          </div>

          {/* Solid Editorial Article Card */}
          <article className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="p-6 md:p-20 lg:p-24">
              {/* Refined Header */}
              <header className="pb-10 md:pb-16 text-center space-y-6 md:space-y-10 border-b border-gray-50 mb-10 md:mb-16">
                <div className="flex flex-col items-center gap-4 md:gap-6">
                  <div className="h-1 w-10 md:w-12 bg-[var(--puembo-green)] rounded-full" />
                  <p className="text-[9px] md:text-[10px] font-black text-[var(--puembo-green)] uppercase tracking-[0.4em] md:tracking-[0.5em] ml-2">
                    Devocional Diario
                  </p>
                </div>

                <h1 className="text-3xl md:text-7xl font-serif font-bold text-gray-900 leading-[1.2] md:leading-[1.1] tracking-tight max-w-3xl mx-auto">
                  {post.title}
                </h1>

                <div className="flex items-center justify-center gap-4 md:gap-6 text-gray-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-[var(--puembo-green)]" />
                    <span>{publicationDate}</span>
                  </div>
                </div>
              </header>

              {/* Premium Content Area */}
              <div
                className="text-gray-700 tiptap prose prose-neutral max-w-none prose-base md:prose-xl
                  prose-p:leading-[1.8] md:prose-p:leading-[2] prose-p:text-gray-600 prose-p:mb-6 md:prose-p:mb-10 prose-p:font-light
                  prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-10 md:prose-headings:mt-16
                  prose-blockquote:border-l-0 prose-blockquote:bg-gray-50 prose-blockquote:py-8 md:prose-blockquote:py-12 prose-blockquote:px-6 md:prose-blockquote:px-12 prose-blockquote:rounded-[1.5rem] md:prose-blockquote:rounded-[2.5rem] prose-blockquote:italic prose-blockquote:text-gray-500 prose-blockquote:text-center prose-blockquote:font-serif prose-blockquote:text-xl md:prose-blockquote:text-2xl
                  prose-strong:text-gray-900 prose-strong:font-black
                  prose-img:rounded-[1.5rem] md:prose-img:rounded-[3rem] prose-img:shadow-2xl prose-img:my-10 md:prose-img:my-20
                  prose-li:text-gray-600 prose-li:marker:text-[var(--puembo-green)]
                  prose-a:text-[var(--puembo-green)] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                  overflow-hidden wrap-anywhere"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Enhanced Navigation Footer */}
              <footer className="mt-16 md:mt-24 pt-10 md:pt-16 border-t border-gray-50 flex flex-row items-center justify-between gap-6 md:gap-8">
                {prevPost ? (
                  <Link
                    href={`/recursos/lom/${prevPost.slug}`}
                    className="inline-flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform text-[var(--puembo-green)]" />
                    Lectura Anterior
                  </Link>
                ) : (
                  <div className="hidden sm:block w-32" />
                )}

                {showNext ? (
                  <Link
                    href={`/recursos/lom/${nextPost.slug}`}
                    className="inline-flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group text-right w-full sm:w-auto justify-center sm:justify-end"
                  >
                    Lectura Siguiente
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform text-[var(--puembo-green)]" />
                  </Link>
                ) : (
                  <div className="hidden sm:block w-32" />
                )}
              </footer>

              <div className="mt-16 md:mt-24 flex flex-col items-center gap-4 md:gap-6 text-center">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-gray-300">
                  Iglesia Alianza Puembo
                </p>
                <Image
                  src="/brand/logo-puembo.png"
                  alt="Logo"
                  width={80}
                  height={32}
                  className="md:w-[100px] md:h-[40px]"
                />
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
