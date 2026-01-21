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
    post.publication_date
  );

  const todayStr = getTodayEcuadorDateLiteral();
  const nextPostDateStr = nextPost ? nextPost.publication_date : null;

  const showNext = nextPost && nextPostDateStr && nextPostDateStr <= todayStr;

  const publicationDate = formatLiteralDate(
    post.publication_date,
    "EEEE d 'de' MMMM, yyyy"
  );

  return (
    <div className="relative min-h-screen w-full bg-[#FDFDFD]">
      {/* Cinematic Full-Height Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/recursos/lom/Lom.png"
          alt="Background"
          fill
          priority
          className="object-cover object-center brightness-[0.7]"
        />
      </div>

      <main className="relative z-10 w-full pt-12 md:pt-24 pb-32 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between px-4">
            <Link
              href="/recursos/lom"
              className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[var(--puembo-green)]" />
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
          <article className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="p-8 md:p-20 lg:p-24">
              {/* Refined Header */}
              <header className="pb-16 text-center space-y-10 border-b border-gray-50 mb-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="h-1 w-12 bg-[var(--puembo-green)] rounded-full" />
                  <p className="text-[10px] font-black text-[var(--puembo-green)] uppercase tracking-[0.5em] ml-2">
                    Devocional Diario
                  </p>
                </div>

                <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
                  {post.title}
                </h1>

                <div className="flex items-center justify-center gap-6 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[var(--puembo-green)]" />
                    <span>{publicationDate}</span>
                  </div>
                </div>
              </header>

              {/* Premium Content Area */}
              <div
                className="text-gray-700 tiptap prose prose-neutral max-w-none prose-lg md:prose-xl
                  prose-p:leading-[2] prose-p:text-gray-600 prose-p:mb-10 prose-p:font-light
                  prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-16
                  prose-blockquote:border-l-0 prose-blockquote:bg-gray-50 prose-blockquote:py-12 prose-blockquote:px-12 prose-blockquote:rounded-[2.5rem] prose-blockquote:italic prose-blockquote:text-gray-500 prose-blockquote:text-center prose-blockquote:font-serif prose-blockquote:text-2xl
                  prose-strong:text-gray-900 prose-strong:font-black
                  prose-img:rounded-[3rem] prose-img:shadow-2xl prose-img:my-20
                  prose-li:text-gray-600 prose-li:marker:text-[var(--puembo-green)]
                  prose-a:text-[var(--puembo-green)] prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Enhanced Navigation Footer */}
              <footer className="mt-24 pt-16 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-8">
                {prevPost ? (
                  <Link
                    href={`/recursos/lom/${prevPost.slug}`}
                    className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[var(--puembo-green)]" />
                    Lectura Anterior
                  </Link>
                ) : (
                  <div className="hidden sm:block w-32" />
                )}

                {showNext ? (
                  <Link
                    href={`/recursos/lom/${nextPost.slug}`}
                    className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group text-right"
                  >
                    Lectura Siguiente
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--puembo-green)]" />
                  </Link>
                ) : (
                  <div className="hidden sm:block w-32" />
                )}
              </footer>

              <div className="mt-24 flex flex-col items-center gap-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
                  Iglesia Alianza Puembo
                </p>
                <Image
                  src="/brand/logo-puembo.png"
                  alt="Logo"
                  width={100}
                  height={40}
                />
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
