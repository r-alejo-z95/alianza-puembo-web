"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.ts";
import { sectionPx } from "@/lib/styles.ts";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, MapPin, ArrowRight } from "lucide-react";

const heroImages = [
  "/homepage/hero/Hero1.avif",
  "/homepage/hero/Hero2.avif",
  "/homepage/hero/Hero3.avif",
  "/homepage/hero/Hero4.avif",
  "/homepage/hero/Hero5.avif",
  "/homepage/hero/Hero6.avif",
  "/homepage/hero/Hero7.avif",
];

export default function Hero({ youtubeStatus, announcementBar }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const { isLive, videoUrl } = youtubeStatus;

  const premiumBtnClass =
    "rounded-full px-7 py-3.5 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2.5 h-auto shadow-lg";

  return (
    <section className="relative w-full h-screen min-h-[600px] md:h-screen overflow-hidden bg-black">
      {/* Announcement Bar */}
      {announcementBar?.enabled && (
        <div className="absolute top-0 left-0 w-full z-50 bg-[var(--puembo-green)] text-white text-center py-2 px-4 text-xs md:text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <span>{announcementBar.text}</span>
            {announcementBar.link && (
              <Link 
                href={announcementBar.link} 
                className="underline hover:text-white/80 flex items-center gap-1"
              >
                Ver más <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={heroImages[currentImageIndex]}
            alt="Iglesia Alianza Puembo"
            fill
            sizes="(max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
            priority
            className="object-cover object-center lg:object-[center:70%]"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div
        className={cn(
          sectionPx,
          "relative z-10 w-full h-full flex flex-col justify-center items-start text-white pt-20 md:pt-0"
        )}
      >
        <div className="max-w-4xl space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-0.5 w-8 md:w-12 bg-[var(--puembo-green)]" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-[var(--puembo-green)]">
                Iglesia Alianza Puembo
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight">
              Bienvenido <br />
              <span className="text-[var(--puembo-green)] italic font-medium">
                a casa
              </span>
            </h1>

            <p className="text-base md:text-xl text-gray-200/90 font-light leading-relaxed max-w-sm md:max-w-xl">
              Somos una familia de familias experimentando la presencia de Dios
              y caminando juntos en fe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4 w-full sm:w-auto"
          >
            <Button
              variant="green"
              className={cn(premiumBtnClass, "shadow-[var(--puembo-green)]/20 w-full sm:w-auto")}
              onClick={() => {
                const ubicacion = document.getElementById("ubicacion");
                ubicacion?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <MapPin className="h-4 w-4" />
              Visítanos
            </Button>

            <Link href={videoUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className={cn(
                  premiumBtnClass,
                  "bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-black w-full"
                )}
              >
                <Play
                  className={cn(
                    "h-4 w-4",
                    isLive
                      ? "text-red-500 fill-red-500 animate-pulse"
                      : "fill-current"
                  )}
                />
                <span>{isLive ? "En Vivo Ahora" : "Última Prédica"}</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 right-12 z-20 hidden lg:block"
      >
        <div className="flex flex-col items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 [writing-mode:vertical-lr]">
            Scroll
          </span>
          <div className="h-16 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
