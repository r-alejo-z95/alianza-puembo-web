import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Home, BookOpen, ArrowDown } from "lucide-react";
import { getLomPostBySlug, getLomNavigationPosts } from "@/lib/data/lom.ts";
import { formatLiteralDate, getTodayEcuadorDateLiteral } from "@/lib/date-utils";
import { parseWhatsAppFormatting } from "@/lib/lomUtils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getLomPostBySlug(slug);

  if (!post) return { title: "Devocional no encontrado" };

  return {
    title: { absolute: `${post.title} | LOM | Alianza Puembo` },
    description: `Lectura diaria: ${post.title}`,
    alternates: { canonical: `/recursos/lom/${slug}` },
  };
}

export default async function LomPostPage({ params }) {
  const { slug } = await params;
  const post = await getLomPostBySlug(slug);
  if (!post) notFound();

  const { prevPost, nextPost } = await getLomNavigationPosts(post.publication_date);
  const todayStr = getTodayEcuadorDateLiteral();
  const showNext = nextPost && nextPost.publication_date <= todayStr;

  const publicationDate = formatLiteralDate(
    post.publication_date,
    "EEEE d 'de' MMMM, yyyy",
  );

  const processedContent = parseWhatsAppFormatting(post.content);

  return (
    <div className="bg-[#0A0804]">
      {/* ── Minimal fixed nav ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 py-3.5 bg-black/25 backdrop-blur-md border-b border-white/[0.06]">
        <Link
          href="/recursos/lom"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.35em]">LOM</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1.5 opacity-50">
          <BookOpen className="w-3 h-3 text-[var(--puembo-green)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/80">
            Lee · Ora · Medita
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 group"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.35em]">Inicio</span>
          <Home className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* ── Cinematic hero ───────────────────────────────────────── */}
      <section className="relative min-h-[55vh] md:min-h-[65vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/recursos/lom/Lom.avif"
            alt=""
            fill
            priority
            className="object-cover object-center scale-105"
          />
          {/* Layered dark overlays for depth */}
          <div className="absolute inset-0 bg-[#0A0804]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0804] via-transparent to-[#0A0804]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_0%,#0A0804/60_100%)]" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-7 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          {/* Badge */}
          <div className="flex items-center gap-3.5">
            <div className="h-px w-10 bg-[var(--puembo-green)]/40 rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.7em] text-[var(--puembo-green)]/80">
              Devocional Diario
            </span>
            <div className="h-px w-10 bg-[var(--puembo-green)]/40 rounded-full" />
          </div>

          {/* Title */}
          <h1 className="font-serif font-bold text-white tracking-tight leading-[1.08] text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-2xl">
            {post.title}
          </h1>

          {/* Date */}
          <time className="text-[10px] font-black tracking-[0.45em] text-white/35 capitalize">
            {publicationDate}
          </time>

          {/* Scroll cue */}
          <div className="mt-6 flex flex-col items-center gap-1.5 text-white/20 animate-bounce">
            <span className="text-[8px] uppercase tracking-[0.6em]">Leer</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Gradient bridge into parchment */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F7F2E9] to-transparent pointer-events-none" />
      </section>

      {/* ── Parchment reading pane ────────────────────────────────── */}
      <main className="bg-[#F7F2E9] relative">
        {/* Top ornament */}
        <div className="flex justify-center pt-10 pb-8">
          <div className="flex items-center gap-5 text-[#B8A48C]">
            <div className="h-px w-10 bg-[#C4AD91]/50" />
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-50"
            >
              <path
                d="M12 2L13.5 8.5H20L14.5 12.5L16.5 19L12 15L7.5 19L9.5 12.5L4 8.5H10.5L12 2Z"
                fill="#8B7355"
              />
            </svg>
            <div className="h-px w-10 bg-[#C4AD91]/50" />
          </div>
        </div>

        <article className="max-w-[680px] mx-auto px-6 md:px-10 pb-28 lom-reading-reveal">
          {/* Post content */}
          <div
            className="lom-content"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {/* Divider */}
          <div className="my-16 flex items-center gap-5">
            <div className="flex-1 h-px bg-[#C4AD91]/30" />
            <div className="w-1 h-1 rounded-full bg-[#C4AD91]/50" />
            <div className="flex-1 h-px bg-[#C4AD91]/30" />
          </div>

          {/* Prev / Next navigation */}
          <nav className="flex flex-row items-start justify-between gap-4">
            {prevPost ? (
              <Link
                href={`/recursos/lom/${prevPost.slug}`}
                className="group flex items-center gap-3 text-[#6B5537] hover:text-[#2A1F10] transition-colors duration-200 min-w-0"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#C4AD91]/50 flex items-center justify-center group-hover:border-[var(--puembo-green)]/50 group-hover:bg-[var(--puembo-green)]/6 transition-all duration-200">
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] font-black uppercase tracking-[0.55em] text-[#B8A48C] mb-0.5">
                    Anterior
                  </div>
                  <div className="text-[0.78rem] font-serif font-bold leading-snug text-[#3A2C1A] line-clamp-2 max-w-[130px] sm:max-w-xs">
                    {prevPost.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {showNext ? (
              <Link
                href={`/recursos/lom/${nextPost.slug}`}
                className="group flex flex-row-reverse items-center gap-3 text-[#6B5537] hover:text-[#2A1F10] transition-colors duration-200 min-w-0 text-right"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#C4AD91]/50 flex items-center justify-center group-hover:border-[var(--puembo-green)]/50 group-hover:bg-[var(--puembo-green)]/6 transition-all duration-200">
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] font-black uppercase tracking-[0.55em] text-[#B8A48C] mb-0.5">
                    Siguiente
                  </div>
                  <div className="text-[0.78rem] font-serif font-bold leading-snug text-[#3A2C1A] line-clamp-2 max-w-[130px] sm:max-w-xs">
                    {nextPost.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </nav>

          {/* Church mark */}
          <div className="mt-20 flex flex-col items-center gap-4 opacity-25">
            <div className="h-px w-16 bg-[#8B7355]" />
            <p className="text-[8px] font-black uppercase tracking-[0.8em] text-[#6B5234]">
              Iglesia Alianza Puembo
            </p>
            <Image
              src="/brand/logo-puembo.png"
              alt="Logo Alianza Puembo"
              width={100}
              height={40}
              className="object-contain"
            />
          </div>
        </article>
      </main>
    </div>
  );
}
