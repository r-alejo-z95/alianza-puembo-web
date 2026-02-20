import { getSubmissionByToken } from "@/lib/data/forms";
import { notFound } from "next/navigation";
import TrackingClient from "./TrackingClient";

export async function generateMetadata({ params }) {
  const { token } = await params;
  const submission = await getSubmissionByToken(token);

  if (!submission) return { title: "Inscripción no encontrada" };

  return {
    title: `Seguimiento: ${submission.forms?.title || 'Inscripción'}`,
    description: "Consulta el estado de tu inscripción y gestiona tus pagos.",
    robots: { index: false, follow: false } // No indexar páginas de seguimiento privadas
  };
}

export default async function TrackingPage({ params }) {
  const { token } = await params;
  const submission = await getSubmissionByToken(token);

  if (!submission) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-24 md:py-36">
      <TrackingClient submission={submission} />
    </main>
  );
}
