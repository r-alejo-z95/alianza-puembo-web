import { redirect } from "next/navigation";

export const metadata = {
  title: "Conócenos",
  description: "Conoce más sobre la Iglesia Alianza Puembo, nuestra historia y nuestra familia.",
};

export default function Conocenos() {
  redirect("/");
}
