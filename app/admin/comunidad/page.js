"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactManager from "@/components/admin/managers/ContactManager";
import PrayerRequestManager from "@/components/admin/managers/PrayerRequestManager";
import { 
  Mail, 
  HandHelping, 
  Users,
  Inbox
} from "lucide-react";
import { 
  adminPageSection, 
  adminPageHeaderContainer, 
  adminPageTitle, 
  adminPageDescription 
} from "@/lib/styles.ts";
import { cn } from "@/lib/utils.ts";
import { useAdminProfiles } from "@/lib/hooks/useAdminProfiles"; // Para verificar permisos si fuera necesario en cliente o usar guards en server

// Nota: Esta página es "use client" por las Tabs y SearchParams. 
// La verificación de permisos idealmente ocurre en un layout server o vía un hook de autorización.

function ComunidadHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "mensajes";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sincronizar tab activa con URL sin recargar
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.replace(`/admin/comunidad?${params.toString()}`, { scroll: false });
  };

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
            Interacción
          </span>
        </div>
        <h1 className={adminPageTitle}>
          Gestión de <span className="text-[var(--puembo-green)] italic">Comunidad</span>
        </h1>
        <p className={adminPageDescription}>
          Centralice la atención a los usuarios y modere las peticiones de oración desde un solo lugar.
        </p>
      </header>

      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-gray-100 p-1 rounded-full h-14 md:h-16 w-full max-w-md shadow-inner border border-gray-200/50">
              <TabsTrigger 
                value="mensajes" 
                className="flex-1 rounded-full data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-500 font-bold text-[10px] md:text-xs uppercase tracking-widest gap-3"
              >
                <Mail className={cn("w-4 h-4", activeTab === "mensajes" ? "text-[var(--puembo-green)]" : "text-gray-400")} />
                Mensajes
              </TabsTrigger>
              <TabsTrigger 
                value="peticiones" 
                className="flex-1 rounded-full data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-500 font-bold text-[10px] md:text-xs uppercase tracking-widest gap-3"
              >
                <HandHelping className={cn("w-4 h-4", activeTab === "peticiones" ? "text-[var(--puembo-green)]" : "text-gray-400")} />
                Peticiones
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <TabsContent value="mensajes" className="m-0 outline-none">
              <ContactManager />
            </TabsContent>
            <TabsContent value="peticiones" className="m-0 outline-none">
              <PrayerRequestManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </section>
  );
}

export default function ComunidadHubPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 rounded-full border-4 border-gray-100 border-t-[var(--puembo-green)] animate-spin" />
      </div>
    }>
      <ComunidadHubContent />
    </Suspense>
  );
}
