import { createClient } from "@/lib/supabase/server";
import FormClient, { ErrorState } from "./FormClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("title, description, image_url")
    .eq("slug", slug)
    .eq("is_archived", false)
    .single();

  if (!form) return { title: "Formulario no encontrado" };

  // Limpiamos el HTML de la descripción para el texto de SEO
  const cleanDescription = form.description?.replace(/<[^>]*>?/gm, "").substring(0, 160);

  return {
    title: form.title,
    description: cleanDescription || `Completa el formulario ${form.title} en Alianza Puembo.`,
    openGraph: {
      title: form.title,
      description: cleanDescription,
      images: form.image_url ? [form.image_url] : ["/brand/logo-puembo.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: form.title,
      description: cleanDescription,
      images: form.image_url ? [form.image_url] : ["/brand/logo-puembo.png"],
    }
  };
}

export default async function PublicFormPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: form, error } = await supabase
    .from("forms")
    .select("*, form_fields(*)")
    .eq("slug", slug)
    .eq("is_archived", false)
    .single();

  if (error || !form) {
    return <ErrorState type="not_found" />;
  }

  if (form.is_internal) {
    return <ErrorState type="not_found" />;
  }

  if (!form.enabled) {
    return <FormClient form={form} errorType="inactive" />;
  }

  if (form.form_fields) {
    form.form_fields.sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
    );
  }

  return <FormClient form={form} />;
}