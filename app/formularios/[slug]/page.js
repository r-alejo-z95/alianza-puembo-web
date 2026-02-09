import { getFormBySlug } from "@/lib/data/forms";
import FormClient, { ErrorState } from "./FormClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);

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
  const form = await getFormBySlug(slug);

  if (!form) {
    return <ErrorState type="not_found" />;
  }

  if (form.is_internal) {
    return <ErrorState type="not_found" />;
  }

  if (!form.enabled) {
    return <FormClient form={form} errorType="inactive" />;
  }

  // Fields are already sorted in getFormBySlug, but just in case or if client relies on it being array
  // getFormBySlug returns form_fields sorted.

  return <FormClient form={form} />;
}