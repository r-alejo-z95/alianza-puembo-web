import InscripcionLookupClient from "./InscripcionLookupClient";

export const metadata = {
  title: "Seguimiento de Inscripción | Alianza Puembo",
  description: "Consulta tu inscripción y sube comprobantes adicionales de pago.",
  robots: { index: true, follow: true },
};

export default function InscripcionPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50/50 pt-28 md:pt-32 pb-24">
      <InscripcionLookupClient />
    </main>
  );
}
