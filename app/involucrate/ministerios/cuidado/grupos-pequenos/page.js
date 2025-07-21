import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

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
    imageUrl: "/involucrate/ministerios/gp/small-group-intro.jpg",
    imageAlt: "Personas en un grupo pequeño",
    imagePosition: "right",
    buttonText: "Encuentra un Grupo Pequeño",
    buttonLink: "https://forms.office.com/Pages/ResponsePage.aspx?id=TmWoelp7PUyMjKoX21uYwVMTAcOtIU5Nr5xM06Zvtd9UNURNTktFVkUwNzY5NDk4RkxNUEwxTUJBSS4u",
    buttonVariant: "green",
  };

  const benefitsData = {
    title: "Beneficios de unirte a un Grupo Pequeño",
    items: [
      {
        type: "icon",
        iconType: 'CheckCircle',
        itemTitle: "Crecimiento Espiritual",
        itemDescription: "Estudia la Biblia en un ambiente íntimo y aplica sus verdades a tu vida diaria.",
      },
      {
        type: "icon",
        iconType: 'CheckCircle',
        itemTitle: "Comunidad y Amistad",
        itemDescription: "Construye relaciones profundas y duraderas con personas que comparten tu fe.",
      },
      {
        type: "icon",
        iconType: 'CheckCircle',
        itemTitle: "Apoyo y Oración",
        itemDescription: "Encuentra un espacio seguro para compartir tus cargas y recibir apoyo en oración.",
      },
      {
        type: "icon",
        iconType: 'CheckCircle',
        itemTitle: "Servicio y Misión",
        itemDescription: "Descubre oportunidades para servir a tu comunidad y extender el Reino de Dios.",
      },
      {
        type: "icon",
        iconType: 'CheckCircle',
        itemTitle: "Discipulado Personalizado",
        itemDescription: "Recibe mentoría y guía en tu desarrollo espiritual de la mano de líderes experimentados.",
      },
      {
        type: "icon",
        iconType: 'CheckCircle',
        itemTitle: "Impacto en tu Entorno",
        itemDescription: "Sé parte de la transformación de tu comunidad, llevando el amor y la esperanza de Cristo a quienes te rodean.",
      },
    ],
  };

  const smallGroupsData = {
    title: "Grupos Pequeños",
    items: [
      {
        type: "link",
        href: "/involucrate/ministerios/cuidado/grupos-pequenos/familiar",
        itemTitle: "GP Familiares",
        itemDescription: "Creciendo juntos en familia",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/cuidado/grupos-pequenos/legado",
        itemTitle: "GP Legado (Varones)",
        itemDescription: "Forjando hombres de valor",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/cuidado/grupos-pequenos/juntas",
        itemTitle: "GP Juntas (Mujeres)",
        itemDescription: "Creciendo en comunidad femenina",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/cuidado/grupos-pequenos/ministeriales",
        itemTitle: "GP Ministeriales",
        itemDescription: "Cuidando a los que cuidan",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Grupos Pequeños"
      description="Crece en comunidad y fe a través de nuestros grupos pequeños."
      imageUrl="/involucrate/ministerios/gp/Gp.jpg"
      imageAlt="Grupo pequeño"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...smallGroupsData} />
    </PublicPageLayout>
  );
}
