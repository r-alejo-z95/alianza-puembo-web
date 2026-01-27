import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: form } = await supabase
    .from("forms")
    .select("title")
    .eq("slug", slug)
    .eq("is_archived", false)
    .single();

  return {
    title: form ? `Analíticas: ${form.title} | Admin Alianza Puembo` : "Analíticas | Admin Alianza Puembo",
    description: form 
      ? `Visualización de datos y tendencias para el formulario "${form.title}".` 
      : "Visualización de datos y tendencias de respuestas.",
  };
}

export default function AnalyticsLayout({ children }) {
  return (
    <section className="animate-in fade-in duration-700">
      {children}
    </section>
  );
}
