"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactManager from "@/components/admin/managers/ContactManager";
import PrayerRequestManager from "@/components/admin/managers/PrayerRequestManager";
import { 
  Mail, 
  HandHelping
} from "lucide-react";
import { cn } from "@/lib/utils.ts";

export default function ComunidadHubClient({ initialMessages = [], initialRequests = [] }) {
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
    <div className="max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-gray-100 p-1 rounded-full h-12 md:h-14 w-full max-w-md shadow-inner border border-gray-200/50">
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
            <ContactManager initialMessages={initialMessages} />
          </TabsContent>
          <TabsContent value="peticiones" className="m-0 outline-none">
            <PrayerRequestManager initialRequests={initialRequests} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
