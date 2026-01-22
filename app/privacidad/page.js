import { PrivacidadClient } from "./PrivacidadClient";

export const metadata = {
  title: "Política de Privacidad",
  description: "Conoce cómo tratamos tus datos personales en Iglesia Alianza Puembo.",
  alternates: {
    canonical: "/privacidad",
  },
};

export default function PrivacidadPage() {
  return <PrivacidadClient />;
}
