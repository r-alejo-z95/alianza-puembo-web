'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  sectionPx,
} from "@/lib/styles.ts";
import { cn } from "@/lib/utils.ts";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, ChevronRight } from 'lucide-react';

export default function Grupos() {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/involucrate/ministerios/cuidado/grupos-pequenos');
  };

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex flex-col overflow-hidden bg-black">
      <Image
        src="/homepage/Group-section.webp"
        alt="Grupos Pequeños en Alianza Puembo"
        fill
        sizes="100vw"
        className="object-cover object-center scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      <div
        className={cn(
          sectionPx,
          "relative z-10 w-full h-full flex items-center"
        )}
      >
        <div className="max-w-2xl space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-[var(--puembo-green)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
                Vida en Comunidad
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight">
              Grupos <br />
              <span className="italic text-[var(--puembo-green)] font-medium">Pequeños</span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-200/90 font-light leading-relaxed max-w-lg">
              No fuimos creados para caminar solos. Encuentra un espacio donde puedas ser tú mismo, 
              compartir la vida y crecer en tu relación con Dios.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button 
              variant="green" 
              className="rounded-full px-7 py-3.5 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 h-auto shadow-lg shadow-[var(--puembo-green)]/20 group"
              onClick={handleButtonClick}
            >
              Encuentra tu lugar
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 hidden md:block">
        <div className="flex items-center gap-6">
          <div className="h-px w-24 bg-white/20" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            GP Alianza Puembo
          </span>
        </div>
      </div>
    </section>
  );
}