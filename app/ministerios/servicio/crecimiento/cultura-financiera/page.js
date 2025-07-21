
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Cultura Financiera",
  description: "Principios bíblicos para administrar tus finanzas con sabiduría y propósito en Alianza Puembo. Aprende a manejar tu dinero de forma que honre a Dios.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/crecimiento/cultura-financiera",
  },
};

export default function CulturaFinanciera() {
  const introSectionData = {
    title: "Cultura Financiera: Administrando con Sabiduría",
    description: [
      "El ministerio de Cultura Financiera te equipa con principios bíblicos y herramientas prácticas para administrar tus recursos de manera sabia y que honre a Dios. Creemos que la libertad financiera es posible cuando aplicamos la sabiduría divina a nuestras decisiones económicas.",
      "Aprende a presupuestar, ahorrar, invertir y dar con generosidad, transformando tu relación con el dinero y experimentando la bendición de Dios en tus finanzas.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/crecimiento/cultura-financiera/CulturaFinanciera.jpg",
    imageAlt: "Persona revisando sus finanzas en una computadora",
    imagePosition: "right",
  };

  const programDetails = {
    title: "Lo que aprenderás",
    items: [
      {
        type: "icon",
        iconType: "DollarSign",
        itemTitle: "Presupuesto y Ahorro",
        itemDescription: "Cómo crear un presupuesto efectivo y desarrollar hábitos de ahorro.",
      },
      {
        type: "icon",
        iconType: "PiggyBank",
        itemTitle: "Inversión y Deudas",
        itemDescription: "Principios para invertir sabiamente y estrategias para salir de deudas.",
      },
      {
        type: "icon",
        iconType: "HeartHandshake",
        itemTitle: "Generosidad y Mayordomía",
        itemDescription: "Entender el propósito de Dios para nuestras finanzas y la importancia de dar.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Cultura Financiera"
      description="Administrando tus finanzas con sabiduría y propósito."
      imageUrl="/involucrate/ministerios/servicio/crecimiento/cultura-financiera/CulturaFinanciera.jpg"
      imageAlt="Cultura Financiera"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...programDetails} />
    </PublicPageLayout>
  );
}
