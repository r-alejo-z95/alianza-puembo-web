'use client';

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils.ts";

export function PublicPageLayout({ 
  title, 
  description, 
  imageUrl, 
  imageAlt, 
  introSectionData, 
  children,
  contentClassName = "bg-white shadow-[0_-50px_100px_rgba(0,0,0,0.15)]"
}) {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Balanced Parallax & Scale
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.05]);
  
  // FADES OUT the background when content covers it to protect the Footer
  const bgOpacity = useTransform(scrollYProgress, [0.85, 0.98], [1, 0]);
  
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.2], [0, -40]);

  return (
    <main ref={containerRef} className="relative bg-black min-h-screen">
      {/* 1. THE CANVAS: Fixed Backdrop */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="fixed inset-0 w-full h-screen z-0 overflow-hidden bg-black pointer-events-none"
      >
        <motion.div style={{ y: bgY, scale: bgScale }} className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            priority
            className="object-cover object-[center_35%] brightness-[0.65] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
        </motion.div>
      </motion.div>

      {/* 2. THE TYPOGRAPHY LAYER: Professional scale title */}
      <div className="relative z-10 h-[70vh] md:h-[80vh] flex flex-col justify-center items-center px-6">
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="text-center space-y-8 w-full max-w-5xl"
        >
          <div className="flex items-center justify-center gap-6 mb-2">
            <div className="h-px w-16 bg-[var(--puembo-green)] opacity-60" />
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-[var(--puembo-green)]">
              Alianza Puembo
            </span>
            <div className="h-px w-16 bg-[var(--puembo-green)] opacity-60" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-xl">
            {title}
          </h1>
          
          {description && (
            <p className="text-lg md:text-xl text-gray-100 font-light max-w-3xl mx-auto leading-relaxed italic opacity-90">
              {description}
            </p>
          )}
        </motion.div>

        {/* Minimal Scroll Prompt */}
        <motion.div 
          style={{ opacity: contentOpacity }}
          className="absolute bottom-12 flex flex-col items-center gap-4"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-[var(--puembo-green)] to-transparent" />
        </motion.div>
      </div>

      {/* 3. THE REVEAL LAYER: Narrative and Core Content */}
      <div className="relative z-20">
        
        {/* Intro Section: Overlapping card */}
        {introSectionData && (
          <section className="px-4 pb-24 -mt-16 md:-mt-24 lg:-mt-32 relative z-30">
            <div className={cn(
              "max-w-7xl mx-auto flex flex-col items-center",
              introSectionData.imageUrl ? "lg:flex-row gap-12 lg:gap-0" : "justify-center"
            )}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "bg-white p-10 md:p-16 lg:p-20 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-gray-100 z-10",
                  introSectionData.imageUrl ? "w-full lg:w-[60%]" : "w-full max-w-4xl text-center mx-auto"
                )}
              >
                <div className="space-y-8">
                  <div className={cn("flex items-center gap-4", !introSectionData.imageUrl && "justify-center")}>
                    <div className="h-px w-10 bg-[var(--puembo-green)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)] opacity-70">Contexto</span>
                    {!introSectionData.imageUrl && <div className="h-px w-10 bg-[var(--puembo-green)]" />}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight tracking-tight">
                    {introSectionData.title}
                  </h2>
                  <div className="space-y-6">
                    {(Array.isArray(introSectionData.description) ? introSectionData.description : [introSectionData.description]).map((p, i) => (
                      <p key={i} className="text-base md:text-lg text-gray-600 font-light leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                  {introSectionData.buttonText && (
                    <div className={cn("pt-4", !introSectionData.imageUrl && "flex justify-center")}>
                      <a href={introSectionData.buttonLink} className="inline-block px-10 py-5 bg-[var(--puembo-green)] text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg">
                        {introSectionData.buttonText}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Portal Image */}
              {introSectionData.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="w-full lg:w-[45%] lg:-ml-16 relative aspect-video lg:aspect-[4/3] z-20 shadow-2xl rounded-[2.5rem] overflow-hidden group"
                >
                  <Image
                    src={introSectionData.imageUrl}
                    alt={introSectionData.imageAlt || ""}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* Core Page Data: Rising Block */}
        <section className={cn("relative z-40 rounded-t-[3rem] md:rounded-t-[5rem]", contentClassName)}>
          <div className="pt-16 pb-24 md:pt-20 md:pb-32">
            <div className="max-w-7xl mx-auto px-6">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
