import Hero from "@/components/public/homepage/Hero";
import Info from "@/components/public/homepage/Info";
import Grupos from "@/components/public/homepage/Grupos";
import Ubicacion from "@/components/public/homepage/Ubicacion";
import { getYouTubeChannelStatus } from "@/lib/youtube";
import { getCachedSettings } from "@/lib/data/settings";

export const metadata = {
  title: "Alianza Puembo - Una Familia de Familias",
  description: "Somos una comunidad cristiana en Puembo, Ecuador. Ofrecemos reuniones, grupos de crecimiento, y recursos para fortalecer tu fe. ¡Visítanos!",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [youtubeStatus, settings] = await Promise.all([
    getYouTubeChannelStatus(),
    getCachedSettings(),
  ]);

  return (
    <>
      <Hero 
        youtubeStatus={youtubeStatus} 
        announcementBar={{
          enabled: settings?.announcement_enabled,
          text: settings?.announcement_text,
          link: settings?.announcement_link
        }} 
      />
      <Info />
      <Grupos />
      <Ubicacion youtubeStatus={youtubeStatus} />
    </>
  );
}