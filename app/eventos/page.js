import { redirect } from "next/navigation";

export const metadata = {
  title: "Eventos",
  description: "Descubre los próximos eventos y actividades de la Iglesia Alianza Puembo.",
};

export default function Eventos() {
  redirect("/");
}
