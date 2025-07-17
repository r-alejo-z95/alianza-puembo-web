import dynamic from 'next/dynamic';
import Hero from "@/components/public/homepage/Hero";

const HomepageSections = dynamic(() => import("@/components/public/homepage/HomepageSections"), { ssr: false });

export const metadata = {
  title: "Alianza Puembo - Una Familia de Familias", // Overwrites the default in layout
  description: "Somos una comunidad cristiana en Puembo, Ecuador. Ofrecemos reuniones, grupos de crecimiento, y recursos para fortalecer tu fe. ¡Visítanos!",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <HomepageSections />
    </>
  );
}
