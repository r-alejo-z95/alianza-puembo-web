"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.ts";
import { sectionPx } from "@/lib/styles.ts";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, MapPin } from "lucide-react";

const heroImages = [
  "/homepage/hero/Hero1.jpg",
  "/homepage/hero/Hero2.jpg",
  "/homepage/hero/Hero3.jpg",
  "/homepage/hero/Hero4.jpg",
  "/homepage/hero/Hero5.jpg",
  "/homepage/hero/Hero6.jpg",
  "/homepage/hero/Hero7.jpg",
];

export default function Hero({ youtubeStatus }) {
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
    <section className="relative w-full h-screen overflow-hidden bg-black">
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
          "relative z-10 w-full h-full flex flex-col justify-center items-start text-white"
        )}
      >
        <div className="max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-0.5 w-12 bg-[var(--puembo-green)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
                Iglesia Alianza Puembo
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight">
              Bienvenido <br />
              <span className="text-[var(--puembo-green)] italic font-medium">
                a casa
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-200/90 font-light leading-relaxed max-w-xl">
              Somos una familia de familias experimentando la presencia de Dios
              y caminando juntos en fe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Button
              variant="green"
              className={cn(premiumBtnClass, "shadow-[var(--puembo-green)]/20")}
              onClick={() => {
                const ubicacion = document.getElementById("ubicacion");
                ubicacion?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <MapPin className="h-4 w-4" />
              Visítanos
            </Button>

            <Link href={videoUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className={cn(
                  premiumBtnClass,
                  "bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-black"
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
