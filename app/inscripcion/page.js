import { Suspense } from "react";
import InscriptionPortal from "@/components/public/inscriptions/InscriptionPortal";
import { getPubliclyListedForms } from "@/lib/data/forms";
import { preparePublicFormListings } from "@/lib/forms/public-portal.mjs";

export const metadata = {
  title: "Inscripciones | Alianza Puembo",
  description:
    "Encuentra formularios abiertos y consulta de forma privada el estado de tu inscripción.",
  robots: { index: true, follow: true },
};

export default async function InscripcionPage() {
  const forms = await getPubliclyListedForms();
  const { catalogForms, lookupForms } = preparePublicFormListings(forms);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f3] pb-24 pt-24 md:pt-28">
      <Suspense
        fallback={
          <div className="mx-auto min-h-[24rem] max-w-7xl px-6" />
        }
      >
        <InscriptionPortal
          catalogForms={catalogForms}
          lookupForms={lookupForms}
        />
      </Suspense>
    </main>
  );
}
