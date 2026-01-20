"use client";

import { cn } from "@/lib/utils.ts";
import { contentSection, sectionText } from "@/lib/styles";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Quote } from "lucide-react";
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
};

export function MinistryContentSection({ title, items }) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section className="bg-gray-50/50 py-24 md:py-32 overflow-hidden border-t border-gray-100">
      <div className={cn(contentSection, "max-w-7xl mx-auto space-y-20")}>
        {/* Separador Visual Estándar (Igual que en Noticias/LOM) */}
        <div className="flex items-center gap-6 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            {title}
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item, index) => {
            const IconComponent = item.iconType
              ? IconComponents[item.iconType]
              : null;
            const isLink = !!item.href;
            const CardWrapper = isLink ? Link : "div";

            return (
              <motion.div
                key={index}
                {...fadeIn}
                transition={{ delay: (index % 3) * 0.1 }}
              >
                <CardWrapper
                  href={item.href}
                  className={cn(
                    "group flex flex-col h-full bg-white rounded-3xl shadow-md border border-gray-100/50 overflow-hidden transition-all duration-500",
                    isLink &&
                      "hover:shadow-2xl hover:border-[var(--puembo-green)]/20 hover:-translate-y-1"
                  )}
                >
                  {/* Media Area */}
                  <div className="relative">
                    {item.type === "icon" && IconComponent && (
                      <div className="p-10 flex items-center justify-center bg-gray-50 group-hover:bg-[var(--puembo-green)]/5 transition-colors duration-500">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--puembo-green)] border border-gray-100">
                          <IconComponent className="w-10 h-10" />
                        </div>
                      </div>
                    )}
                    {item.type === "image" && item.imageUrl && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt || item.itemTitle}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-8 flex flex-col flex-grow space-y-4">
                    <div className="space-y-4">
                      <div className="h-1 w-12 bg-[var(--puembo-green)]/30 rounded-full" />
                      <h3 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors leading-tight">
                        {item.itemTitle}
                      </h3>
                    </div>

                    <p className="text-gray-500 font-light leading-relaxed flex-grow">
                      {item.itemDescription}
                    </p>

                    {isLink && (
                      <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 group-hover:text-[var(--puembo-green)] transition-colors italic">
                          Explorar más
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--puembo-green)] group-hover:translate-x-1 transition-all" />
                      </div>
                    )}
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
