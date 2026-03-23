"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sectionPx } from "@/lib/styles.ts";
import { cn } from "@/lib/utils.ts";
import Image from "next/image";
import { motion } from "framer-motion";
import { Share2, ChevronRight } from "lucide-react";

const icons = [
  { src: "/the-four/The Four_Corazon_Blanco.png", alt: "Dios me ama" },
  { src: "/the-four/The Four_Division_Blanco.png", alt: "Vivo separado de Dios" },
  { src: "/the-four/The Four_Cruz_Blanco.png", alt: "Jesús murió por mí" },
  { src: "/the-four/The Four_Pregunta_Blanco.png", alt: "¿Elegiré seguir a Jesús?" },
];

export default function TheFour() {
  const router = useRouter();

  return (
    <section className="relative w-full h-screen min-h-[500px] md:h-[80vh] flex flex-col overflow-hidden bg-[var(--puembo-green)]">

      {/* Desktop: 4 icons spanning full width as background */}
      <div className="absolute inset-0 hidden md:flex">
        {icons.map((icon) => (
          <div key={icon.alt} className="relative flex-1 h-full">
            <Image src={icon.src} alt={icon.alt} fill className="object-contain p-8 lg:p-12 opacity-85" />
          </div>
        ))}
      </div>

      {/* Mobile: 2×2 grid filling full section */}
      <div className="absolute inset-0 md:hidden grid grid-cols-2">
        {icons.map((icon) => (
          <div key={icon.alt} className="relative">
            <Image src={icon.src} alt={icon.alt} fill className="object-contain p-5 opacity-85" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />

      <div
        className={cn(
          sectionPx,
          "relative z-20 w-full h-full flex items-center pt-10 md:pt-0"
        )}
      >
        <div className="max-w-2xl space-y-8 md:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Share2 className="w-5 h-5 text-[var(--puembo-green)]" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-[var(--puembo-green)]">
                Evangelismo
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight">
              The <br />
              <span className="italic text-[var(--puembo-green)] font-medium">
                Four
              </span>
            </h2>

            <p className="text-base md:text-xl text-gray-200/90 font-light leading-relaxed max-w-sm md:max-w-lg">
              Cuatro verdades que cambian todo. Compártelas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full sm:w-auto"
          >
            <Button
              variant="green"
              className="rounded-full px-8 py-4 md:px-7 md:py-3.5 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 h-auto shadow-lg shadow-[var(--puembo-green)]/20 group w-full sm:w-auto"
              onClick={() => router.push("/ministerios/the-four")}
            >
              Descubrir The Four
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 hidden md:block z-20">
        <div className="flex items-center gap-6">
          <div className="h-px w-24 bg-white/20" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            The Four · Alianza Puembo
          </span>
        </div>
      </div>
    </section>
  );
}
