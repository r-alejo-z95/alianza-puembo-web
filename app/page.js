import Hero from "@/components/public/homepage/Hero";
import Info from "@/components/public/homepage/Info";
import Grupos from "@/components/public/homepage/Grupos";
import Ubicacion from "@/components/public/homepage/Ubicacion";

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
      <Info />
      <Grupos />
      <Ubicacion />
    </>
  );
}
