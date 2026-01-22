import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { QueCreemosClient } from "./QueCreemosClient";

export const metadata = {
  title: "Qué Creemos",
  description:
    "Nuestra declaración de fe, misión y visión. Conoce los fundamentos bíblicos y las doctrinas centrales de la Alianza Cristiana y Misionera.",
  alternates: {
    canonical: "/conocenos/que-creemos",
  },
};

export default function QueCreemosPage() {
  return (
    <PublicPageLayout
      title="Nuestra Fe y Valores"
      description="Somos una familia de familias."
      imageUrl="/conocenos/que-creemos/Que-creemos.webp"
      imageAlt="Silueta de manos levantadas en adoración"
    >
      <QueCreemosClient />
    </PublicPageLayout>
  );
}
