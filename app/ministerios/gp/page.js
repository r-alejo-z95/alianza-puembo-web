import { SmallGroupsBenefitsSection } from "@/components/public/layout/pages/ministerios/gp/SmallGroupsBenefitsSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Grupos Pequeños",
  description: "Únete a nuestros grupos pequeños para crecer en comunidad, estudiar la Biblia y fortalecer tu fe junto a otros miembros de la iglesia.",
  alternates: {
    canonical: "/ministerios/gp",
  },
};

export default function GruposPequenos() {
  const introSectionData = {
    title: "Conecta, Crece, Comparte",
    description: [
      "Nuestros Grupos Pequeños son el corazón de nuestra comunidad. Son espacios íntimos donde puedes conectar con otros creyentes, estudiar la Palabra de Dios, compartir tus experiencias y recibir apoyo en tu caminar de fe.",
      "Creemos que la vida cristiana se vive mejor en comunidad. Por eso, te invitamos a unirte a un grupo pequeño cerca de ti y experimentar el crecimiento espiritual y la amistad que solo se encuentran en un ambiente de apoyo mutuo.",
    ],
    imageUrl: "/ministerios/gp/small-group-intro.jpg",
    imageAlt: "Personas en un grupo pequeño",
    imagePosition: "right",
    buttonText: "Encuentra un Grupo Pequeño",
    buttonLink: "https://forms.office.com/Pages/ResponsePage.aspx?id=TmWoelp7PUyMjKoX21uYwVMTAcOtIU5Nr5xM06Zvtd9UNURNTktFVkUwNzY5NDk4RkxNUEwxTUJBSS4u",
    buttonVariant: "green",
  };

  return (
    <PublicPageLayout
      title="Grupos Pequeños"
      description="Crece en comunidad y fe a través de nuestros grupos pequeños."
      imageUrl="/ministerios/gp/Gp.jpg"
      imageAlt="Grupo pequeño"
      introSectionData={introSectionData}
    >
      <SmallGroupsBenefitsSection />
    </PublicPageLayout>
  );
}
