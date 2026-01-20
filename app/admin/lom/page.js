import LomManager from '@/components/admin/managers/LomManager';
import PassageManager from '@/components/admin/managers/PassageManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles.ts";

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

      <Tabs defaultValue="lom" className="w-full space-y-12">
        <TabsList className="inline-flex h-14 items-center justify-center rounded-full bg-gray-100/50 p-1.5 border border-gray-200 shadow-inner">
          <TabsTrigger 
            className="cursor-pointer rounded-full px-8 py-2.5 text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md" 
            value="lom"
          >
            Devocionales
          </TabsTrigger>
          <TabsTrigger 
            className="cursor-pointer rounded-full px-8 py-2.5 text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md" 
            value="passages"
          >
            Pasajes Semanales
          </TabsTrigger>
        </TabsList>
        
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