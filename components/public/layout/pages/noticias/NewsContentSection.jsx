import { cn } from "@/lib/utils";
import { contentSection, notAvailableText } from "@/lib/styles";

export function NewsContentSection() {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <p className={notAvailableText}>No hay noticias para mostrar.</p>
    </section>
  );
}