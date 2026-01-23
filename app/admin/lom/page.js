import LomManager from '@/components/admin/managers/LomManager';
import PassageManager from '@/components/admin/managers/PassageManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles.ts";
import { BookOpen, Calendar } from 'lucide-react';

export const metadata = {
  title: "Gestionar LOM",
  description: "Administra los devocionales de Lee, Ora, Medita y los pasajes de lectura semanal.",
  robots: {
    index: false,
    follow: false
  },
};

export default function LomPage() {
  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">Editorial LOM</span>
        </div>
        <h1 className={adminPageTitle}>
          Gestión de <span className="text-[var(--puembo-green)] italic">Lee, Ora, Medita</span>
        </h1>
        <p className={adminPageDescription}>
          Cura y publica los devocionales diarios y los pasajes de lectura semanal que alimentan la vida espiritual de nuestra comunidad.
        </p>
      </header>

      <Tabs defaultValue="lom" className="w-full">
        <div className="flex justify-center mb-16 md:mb-20">
          <TabsList className="bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50 backdrop-blur-sm h-auto flex-nowrap justify-center max-w-full">
            <TabsTrigger 
              className="rounded-full px-6 md:px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-500 shrink-0" 
              value="lom"
            >
              <BookOpen className="w-3.5 h-3.5 md:mr-2" />
              <span className="hidden md:inline">Devocionales Diarios</span>
              <span className="md:hidden">Devocionales</span>
            </TabsTrigger>
            <TabsTrigger 
              className="rounded-full px-6 md:px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-500 shrink-0" 
              value="passages"
            >
              <Calendar className="w-3.5 h-3.5 md:mr-2" />
              <span className="hidden md:inline">Pasajes Semanales</span>
              <span className="md:hidden">Pasajes</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="lom" className="mt-0 focus-visible:outline-none">
          <LomManager />
        </TabsContent>
        <TabsContent value="passages" className="mt-0 focus-visible:outline-none">
          <PassageManager />
        </TabsContent>
      </Tabs>
    </section>
  );
}