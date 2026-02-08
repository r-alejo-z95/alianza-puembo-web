"use client";

import { cn } from "@/lib/utils.ts";
import { contentSection } from "@/lib/styles";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import {
  Baby,
  Palette,
  Footprints,
  Search,
  Compass,
  LinkIcon,
  Users,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Heart,
  BookUp,
  MusicIcon,
  Lightbulb,
  Shirt,
  Handshake,
  Gift,
  Soup,
  Hammer,
  Sofa,
  DollarSign,
  HeartPulse,
  Pill,
  MessageSquare,
  Calendar,
  PiggyBank,
  GraduationCap,
  Home,
  HeartCrack,
  Hospital,
  Grape,
  HandHelping,
  Info,
  CalendarCheck,
  Camera,
  Smile,
  Church,
  Globe,
  Clock,
  Mic,
  HandHeart,
  TrendingUp,
  Map,
  Target,
} from "lucide-react";

const IconComponents = {
  Baby,
  Palette,
  Footprints,
  Search,
  Compass,
  LinkIcon,
  Users,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Heart,
  Sparkles,
  BookUp,
  MusicIcon,
  Lightbulb,
  Shirt,
  Handshake,
  Gift,
  Soup,
  Hammer,
  Sofa,
  DollarSign,
  HeartPulse,
  Pill,
  MessageSquare,
  Calendar,
  PiggyBank,
  GraduationCap,
  Home,
  HeartCrack,
  Hospital,
  Grape,
  HandHelping,
  Info,
  CalendarCheck,
  Camera,
  Smile,
  Church,
  Globe,
  Clock,
  Mic,
  HandHeart,
  TrendingUp,
  Map,
  Target,
};

export function MinistryContentSection({ title, items }) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section className="bg-gray-50/50 py-16 md:py-20 overflow-hidden border-t border-gray-100">
      <div className={cn(contentSection, "max-w-7xl mx-auto space-y-16 md:space-y-24")}>
        {/* Separador Visual Estándar */}
        <div className="flex items-center gap-6 px-4">
          <h2 className="text-xl md:text-3xl font-serif font-bold text-gray-900 whitespace-nowrap">
            {title}
          </h2>
          <div className="h-1 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1 w-10 bg-[var(--puembo-green)] rounded-full" />
        </div>

        {/* LAYOUT EDITORIAL UNIFICADO COMPACTO */}
        <div className="space-y-20 md:space-y-24">
          {items.map((item, index) => {
            const isReversed = index % 2 !== 0;
            const IconComponent = item.iconType ? IconComponents[item.iconType] : Sparkles;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "flex flex-col lg:flex-row items-center gap-10 lg:gap-16",
                  isReversed && "lg:flex-row-reverse"
                )}
              >
                {/* Lado Visual (Imagen o Icono) */}
                <div className="w-full lg:w-[45%] relative group">
                  {item.imageUrl ? (
                    <div className="relative aspect-video rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl z-10 transition-all duration-700 group-hover:shadow-2xl">
                      <Image
                        src={item.imageUrl}
                        alt={item.imageAlt || item.itemTitle}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
                      <div className={cn(
                        "absolute bottom-6 w-16 h-1 bg-[var(--puembo-green)] rounded-full",
                        isReversed ? "right-6" : "left-6"
                      )} />
                    </div>
                  ) : (
                    /* Composición con Icono para niveles finales */
                    <div className="relative aspect-video flex items-center justify-center">
                      <div className={cn(
                        "absolute inset-0 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_15px_40px_-12px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-700 group-hover:border-[var(--puembo-green)]/20",
                        isReversed ? "rotate-1" : "-rotate-1"
                      )} />
                      <div className="absolute w-32 h-32 bg-[var(--puembo-green)]/5 rounded-full blur-3xl" />
                      
                      <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--puembo-green)] border border-gray-100 group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all duration-700">
                        {IconComponent && <IconComponent className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />}
                      </div>
                    </div>
                  )}
                  <div className={cn(
                    "absolute -top-10 w-40 h-40 bg-[var(--puembo-green)]/5 rounded-full blur-3xl -z-10",
                    isReversed ? "-left-10" : "-right-10"
                  )} />
                </div>

                {/* Lado de Texto */}
                <div className={cn(
                  "w-full lg:w-[55%] space-y-6",
                  isReversed ? "lg:text-right" : "lg:text-left"
                )}>
                  <div className="space-y-2">
                    <div className={cn("flex items-center gap-3", isReversed && "justify-end")}>
                      <span className="text-[10px] font-black text-[var(--puembo-green)] tracking-[0.4em] opacity-50">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="h-px w-6 bg-[var(--puembo-green)]/20" />
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight">
                      {item.itemTitle}
                    </h3>
                  </div>

                  <p className="text-sm md:text-base lg:text-lg text-gray-500 leading-relaxed font-light max-w-xl">
                    {item.itemDescription}
                  </p>

                  {item.href && (
                    <div className={cn("pt-4 flex", isReversed ? "justify-end" : "justify-start")}>
                      <Link
                        href={item.href}
                        className="group/btn inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all"
                      >
                        Conocer más
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover/btn:border-[var(--puembo-green)] group-hover/btn:bg-[var(--puembo-green)] group-hover/btn:text-white transition-all">
                          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}