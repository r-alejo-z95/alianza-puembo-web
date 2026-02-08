
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Cuidado Pastoral",
  description: "En Alianza Puembo somos una familia de familias. En Cuidado Pastoral brindamos el apoyo y el acompañamiento necesario para un crecimiento espiritual saludable.",
  alternates: {
    canonical: "/involucrate/ministerios/cuidado",
  },
};

export default function CuidadoPastoral() {
  const introSectionData = {
    title: "Cuidado Pastoral: Una Familia que Cuida",
    description: [
      "Creemos que somos una familia de familias; damos por gracia lo que recibimos al servir, pero también necesitamos ser cuidados para un crecimiento espiritual saludable.",
      "En Alianza Puembo, nuestro Cuidado Pastoral está diseñado para que te sientas visto, amado y acompañado en cada etapa de tu vida. Queremos caminar junto a ti, brindándote espacios de comunidad y apoyo genuino.",
    ],
    imageUrl: "/involucrate/ministerios/cuidado/Cuidado.avif",
    imageAlt: "Personas conversando en comunidad",
    imagePosition: "right",
  };

  const careMinistriesData = {
    title: "Nuestros Espacios de Cuidado",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/header.avif",
        href: "/ministerios/grupos-pequenos",
        itemTitle: "Grupos Pequeños",
        itemDescription: "Comunidad auténtica y crecimiento relacional.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/jovenes/Header.avif",
        href: "/ministerios/jovenes",
        itemTitle: "Jóvenes",
        itemDescription: "Acompañando a la nueva generación en su fe.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/puembo-kids/header.avif",
        href: "/ministerios/puembo-kids",
        itemTitle: "Puembo Kids",
        itemDescription: "Sembrando el amor de Dios en el corazón de los niños.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Cuidado Pastoral"
      description="Creemos que somos una familia de familias."
      imageUrl="/involucrate/ministerios/cuidado/header.avif"
      imageAlt="Cuidado Pastoral"
      introSectionData={introSectionData}
    >
      <MinistryNavigation current="Cuidado Pastoral" />
      <MinistryContentSection {...careMinistriesData} />
    </PublicPageLayout>
  );
}
