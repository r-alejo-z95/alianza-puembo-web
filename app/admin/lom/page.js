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
      <div className={adminPageHeaderContainer}>
        <h1 className={adminPageTitle}>
          Gestionar Devocionales y Pasajes (LOM)
        </h1>
        <p className={adminPageDescription}>
          Administra los devocionales de Lee, Ora, Medita y los pasajes de lectura semanal.
        </p>
      </div>
      <Tabs defaultValue="lom" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="cursor-pointer" value="lom">Devocionales</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="passages">Pasajes</TabsTrigger>
        </TabsList>
        <TabsContent value="lom">
          <LomManager />
        </TabsContent>
        <TabsContent value="passages">
          <PassageManager />
        </TabsContent>
      </Tabs>
    </section>
  );
}
