import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Grupos Pequeños",
  description: "Únete a nuestros grupos pequeños para crecer en comunidad, estudiar la Biblia y fortalecer tu fe junto a otros miembros de la iglesia.",
  alternates: {
    canonical: "/involucrate/ministerios/cuidado/grupos-pequenos",
  },
};

export default function GruposPequenos() {
  const introSectionData = {
    title: "Conecta, Crece, Comparte",
    description: [
      "Nuestros Grupos Pequeños son el corazón de nuestra comunidad. Son espacios íntimos donde puedes conectar con otros creyentes, estudiar la Palabra de Dios, compartir tus experiencias y recibir apoyo en tu caminar de fe.",
      "Creemos que la vida cristiana se vive mejor en comunidad. Por eso, te invitamos a unirte a un grupo pequeño cerca de ti y experimentar el crecimiento espiritual y la amistad que solo se encuentran en un ambiente de apoyo mutuo.",
    ],
    imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/Gp.avif",
    imageAlt: "Personas en un grupo pequeño",
    imagePosition: "right",
    buttonText: "Encuentra un Grupo Pequeño",
    buttonLink: "https://forms.office.com/Pages/ResponsePage.aspx?id=TmWoelp7PUyMjKoX21uYwVMTAcOtIU5Nr5xM06Zvtd9UNURNTktFVkUwNzY5NDk4RkxNUEwxTUJBSS4u",
    buttonVariant: "green",
  };

  const smallGroupsData = {
    title: "Grupos Pequeños",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/familiar/header.avif",
        href: "/ministerios/gp-familiar",
        itemTitle: "GP Familiares",
        itemDescription: "Creciendo juntos en familia",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/legado/header.avif",
        href: "/ministerios/gp-legado",
        itemTitle: "GP Legado (Varones)",
        itemDescription: "Forjando hombres de valor",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/juntas/header.avif",
        href: "/ministerios/gp-juntas",
        itemTitle: "GP Juntas (Mujeres)",
        itemDescription: "Creciendo en comunidad femenina",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/ministeriales/header.avif",
        href: "/ministerios/gp-ministeriales",
        itemTitle: "GP Ministeriales",
        itemDescription: "Cuidando a los que cuidan",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Grupos Pequeños"
      description="Crece en comunidad y fe a través de nuestros grupos pequeños."
      imageUrl="/involucrate/ministerios/cuidado/grupos-pequenos/header.avif"
      imageAlt="Grupo pequeño"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[{ name: "Cuidado Pastoral", href: "/ministerios/cuidado" }]}
        current="Grupos Pequeños"
        backLink="/ministerios/cuidado" 
        backLabel="Volver a Cuidado Pastoral" 
      />
      <MinistryContentSection {...smallGroupsData} />
    </PublicPageLayout>
  );
}
