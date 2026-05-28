import { getFormByShortCode } from "@/lib/data/forms";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  title: "Formulario",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FormShortLinkPage({ params }) {
  const { shortCode } = await params;
  const form = await getFormByShortCode(shortCode);

  if (!form?.slug) {
    notFound();
  }

  if (form.is_internal) {
    redirect(`/admin/staff/proceso/${form.slug}`);
  }

  redirect(`/formularios/${form.slug}`);
}
