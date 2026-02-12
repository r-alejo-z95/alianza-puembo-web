import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Home } from "lucide-react";
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
    <div className="relative min-h-screen w-full bg-[#0A0A0A] selection:bg-[var(--puembo-green)]/30 overflow-x-hidden flex flex-col">
      {/* Cinematic Sticky Background - Fully Immersive */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/recursos/lom/Lom.avif"
          alt="Background"
          fill
          priority
          className="object-cover object-center brightness-[0.35] scale-105"
        />
        {/* Continuous Depth Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* Standalone Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-black/20 backdrop-blur-md border-b border-white/5 py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/recursos/lom"
            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-[var(--puembo-green)]/20 group-hover:border-[var(--puembo-green)]/30 transition-all">
              <ChevronLeft className="w-4 h-4 text-[var(--puembo-green)] group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Volver al Índice</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all group"
          >
            <span>Ir al Inicio</span>
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-[var(--puembo-green)]/20 group-hover:border-[var(--puembo-green)]/30 transition-all">
              <Home className="w-4 h-4 text-[var(--puembo-green)] group-hover:scale-110 transition-transform" />
            </div>
          </Link>
        </div>
      </nav>

      {/* Main Content Scroll Container */}
      <main className="relative z-10 w-full flex-grow pt-24 pb-32 px-4 md:px-8 bg-transparent">
        <div className="max-w-5xl mx-auto space-y-12 md:space-y-16">
          {/* LOM Branding Badge */}
          <div className="flex items-center justify-center px-2">
            <div className="flex items-center gap-6 text-white/30">
              <div className="h-[1px] w-8 md:w-16 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                  LOM
                </span>
              </div>
              <div className="h-[1px] w-8 md:w-16 bg-white/10 hidden sm:block" />
            </div>
          </div>

          {/* Immersive Dark Content Area */}
          <article className="animate-in fade-in slide-in-from-bottom-16 duration-1000 ease-out">
            {/* Refined Header */}
            <header className="pb-16 md:pb-28 text-center space-y-10 md:space-y-16">
              <div className="flex flex-col items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-8 bg-[var(--puembo-green)]/40 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                  <p className="text-[11px] font-black text-[var(--puembo-green)] uppercase tracking-[0.7em] [text-shadow:0_0_20px_rgba(74,222,128,0.3)]">
                    Devocional
                  </p>
                  <div className="h-[2px] w-8 bg-[var(--puembo-green)]/40 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                </div>
              </div>

              <h1 className="text-5xl md:text-9xl font-serif font-bold text-white leading-[1] md:leading-[0.95] tracking-tighter max-w-5xl mx-auto balance-text drop-shadow-2xl">
                {post.title}
              </h1>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 text-white/50 font-bold text-[11px] uppercase tracking-[0.3em]">
                <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <Clock className="w-4 h-4 text-[var(--puembo-green)]" />
                  <span className="text-white/70">{publicationDate}</span>
                </div>
              </div>
            </header>

            {/* Content Area - White text directly on background */}
            <div
              className="text-white/90 tiptap prose prose-invert max-w-none prose-base md:prose-2xl
                prose-p:leading-[1.9] md:prose-p:leading-[2.2] prose-p:text-white/80 prose-p:mb-10 md:prose-p:mb-16 prose-p:font-light
                prose-headings:font-serif prose-headings:font-bold prose-headings:text-white prose-headings:mt-16 md:prose-headings:mt-24
                prose-blockquote:border-l-0 prose-blockquote:bg-white/5 prose-blockquote:backdrop-blur-sm prose-blockquote:py-12 md:prose-blockquote:py-20 prose-blockquote:px-10 md:prose-blockquote:px-20 prose-blockquote:rounded-[2.5rem] md:prose-blockquote:rounded-[4rem] prose-blockquote:italic prose-blockquote:text-white/70 prose-blockquote:text-center prose-blockquote:font-serif prose-blockquote:text-2xl md:prose-blockquote:text-4xl prose-blockquote:border prose-blockquote:border-white/10 prose-blockquote:my-16 md:prose-blockquote:my-28
                prose-strong:text-white prose-strong:font-black
                prose-img:rounded-[2.5rem] md:prose-img:rounded-[4.5rem] prose-img:shadow-[0_0_80px_rgba(0,0,0,0.6)] prose-img:my-16 md:prose-img:my-32 prose-img:border prose-img:border-white/10
                prose-li:text-white/80 prose-li:marker:text-[var(--puembo-green)]
                prose-a:text-[var(--puembo-green)] prose-a:font-bold prose-a:no-underline hover:prose-a:underline decoration-2 underline-offset-8
                overflow-hidden wrap-anywhere"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Navigation Footer - Matching Top Bar Style */}
            <footer className="mt-18 md:mt-36 pt-12 md:pt-24 border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 md:gap-12">
                {prevPost ? (
                  <Link
                    href={`/recursos/lom/${prevPost.slug}`}
                    className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-all group py-4 w-full sm:w-auto"
                  >
                    <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-[var(--puembo-green)]/20 group-hover:border-[var(--puembo-green)]/30 transition-all flex-shrink-0">
                      <ChevronLeft className="w-6 h-6 text-[var(--puembo-green)] group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="text-[9px] text-white/30 tracking-[0.5em]">Anterior</span>
                      <span className="text-sm md:text-lg font-serif font-bold text-white truncate max-w-[200px] md:max-w-xs">{prevPost.title}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {showNext ? (
                  <Link
                    href={`/recursos/lom/${nextPost.slug}`}
                    className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-all group py-4 text-right w-full sm:w-auto justify-end"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="text-[9px] text-white/30 tracking-[0.5em]">Siguiente</span>
                      <span className="text-sm md:text-lg font-serif font-bold text-white truncate max-w-[200px] md:max-w-xs">{nextPost.title}</span>
                    </div>
                    <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-[var(--puembo-green)]/20 group-hover:border-[var(--puembo-green)]/30 transition-all flex-shrink-0">
                      <ChevronRight className="w-6 h-6 text-[var(--puembo-green)] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>
            </footer>

            <div className="mt-18 md:mt-32 flex flex-col items-center gap-12 text-center w-full pb-40">
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />
              <div className="space-y-6 flex flex-col items-center w-full">
                <p className="text-[11px] font-black uppercase tracking-[0.8em] text-white/20">
                  Iglesia Alianza Puembo
                </p>
                <div className="brightness-0 invert opacity-30 hover:opacity-60 transition-opacity flex justify-center w-full">
                  <Image
                    src="/brand/logo-puembo.png"
                    alt="Logo"
                    width={160}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
