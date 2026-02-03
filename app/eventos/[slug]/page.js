import { getEventBySlug } from "@/lib/data/events";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { notFound } from "next/navigation";
import {
  formatInEcuador,
  getNowInEcuador,
  formatEventFrequency,
} from "@/lib/date-utils";
import { Calendar, Clock, MapPin, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { contentSection, sectionText, sectionTitle } from "@/lib/styles";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) return { title: "Evento no encontrado" };

  return {
    title: event.title,
    description:
      event.description || `Súmate a ${event.title} en Alianza Puembo.`,
  };
}

export default async function EventPage({ params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const now = getNowInEcuador();
  const registrationOpen = true;

  const dateDisplay = event.is_recurring
    ? formatEventFrequency(event.start_time, event.recurrence_pattern)
    : formatInEcuador(event.start_time, "EEEE d 'de' MMMM, yyyy");

  return (
    <PublicPageLayout
      title={event.title}
      description={dateDisplay}
      imageUrl={event.poster_url || "/eventos/Eventos.jpg"}
      imageAlt={event.title}
    >
      <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24")}>
        <div className="max-w-4xl mx-auto w-full space-y-12">
          {/* Back Button */}
          <Link
            href="/eventos/proximos-eventos"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[var(--puembo-green)] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver a eventos
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-8">
              {event.description && (
                <div className="space-y-6">
                  <h2
                    className={cn(
                      sectionTitle,
                      "text-3xl md:text-4xl text-gray-900",
                    )}
                  >
                    Sobre el Evento
                  </h2>
                  <div className="h-1.5 w-20 bg-[var(--puembo-green)] rounded-full" />
                  <p
                    className={cn(
                      sectionText,
                      "text-lg text-gray-700 whitespace-pre-wrap leading-relaxed",
                    )}
                  >
                    {event.description}
                  </p>
                </div>
              )}

              {/* Mobile Only Poster */}
              <div className="md:hidden">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={event.poster_url || "/eventos/Eventos.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl text-[var(--puembo-green)]">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    {event.is_recurring ? (
                      <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        {dateDisplay}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Fecha
                        </p>
                        <p className="text-gray-600">{dateDisplay}</p>
                      </>
                    )}
                  </div>
                </div>

                {!(event.is_multi_day || event.all_day) && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-[var(--puembo-green)]">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Hora
                      </p>
                      <p className="text-gray-600">
                        {formatInEcuador(event.start_time, "HH:mm")}
                      </p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-[var(--puembo-green)]">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Lugar
                      </p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Actions / Sticky Poster */}
            <div className="space-y-8">
              <div className="hidden md:block sticky top-28 space-y-8">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                  <Image
                    src={event.poster_url || "/eventos/Eventos.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {event.registration_link && (
                  <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900">
                      ¿Quieres participar?
                    </h3>
                    {registrationOpen ? (
                      event.registration_link.startsWith("/") ? (
                        <Link href={event.registration_link} className="block">
                          <Button
                            variant="green"
                            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-green-200"
                          >
                            Registrarse Ahora
                          </Button>
                        </Link>
                      ) : (
                        <a
                          href={event.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            variant="green"
                            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-green-200"
                          >
                            Registrarse Ahora
                          </Button>
                        </a>
                      )
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-sm text-gray-500 font-medium">
                          Inscripciones cerradas
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Registration */}
              <div className="md:hidden pt-4">
                {event.registration_link &&
                  (registrationOpen ? (
                    event.registration_link.startsWith("/") ? (
                      <Link href={event.registration_link} className="block">
                        <Button
                          variant="green"
                          className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-green-200"
                        >
                          Registrarse Ahora
                        </Button>
                      </Link>
                    ) : (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button
                          variant="green"
                          className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-green-200"
                        >
                          Registrarse Ahora
                        </Button>
                      </a>
                    )
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full h-14 rounded-xl text-gray-400"
                    >
                      Inscripciones Cerradas
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
