import { TerminosClient } from "./TerminosClient";

export const metadata = {
  title: "Términos de Servicio",
  description: "Condiciones de uso del sitio web de la Iglesia Alianza Puembo.",
  alternates: {
    canonical: "/terminos",
  },
};

export default function TerminosPage() {
  return <TerminosClient />;
}
