"use client";

import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import {
  sectionTitle,
  sectionText,
  contentSection,
  notAvailableText,
} from "@/lib/styles";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { subDays } from "date-fns";
import { formatInEcuador, getNowInEcuador } from "@/lib/date-utils";

export function UpcomingEventsContentSection({
  paginatedEvents,
  totalPages,
  hasNextPage,
  page,
}) {
  const now = getNowInEcuador();

  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      {paginatedEvents.length === 0 ? (
        <p className={notAvailableText}>No hay eventos próximamente.</p>
      ) : (
        <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-8">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-12 md:gap-y-16">
            {paginatedEvents.map((event) => (
              <div
                id={event.title}
                key={event.id}
                className="flex flex-col items-center text-center w-full md:w-[calc(50%-2rem)]"
              >
                {event.poster_url && (
                  <div
                    className="relative w-full mb-2 md:mb-4"
                    style={{
                      aspectRatio:
                        event.poster_w && event.poster_h
                          ? `${event.poster_w} / ${event.poster_h}`
                          : "16 / 9",
                    }}
                  >
                    <Image
                      src={event.poster_url}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
                      className="rounded-lg object-contain"
                      priority
                    />
                  </div>
                )}
                <h2 className={cn(sectionTitle, "mb-2")}>{event.title}</h2>
                {event.description && (
                  <p
                    className={cn(sectionText, "mb-2 max-w-2xl text-gray-800")}
                  >
                    {event.description}
                  </p>
                )}
                <div className="flex flex-col justify-center items-center gap-2">
                  <div className="flex flex-col">
                    <p className={cn("text-gray-600", sectionText)}>
                      <span className="font-medium">Fecha:</span>{" "}
                      {formatInEcuador(event.start_time)}
                    </p>
                    {event.is_multi_day || event.all_day ? null : (
                      <p className={cn("text-gray-600", sectionText)}>
                        <span className="font-medium">Hora:</span>{" "}
                        {formatInEcuador(event.start_time, "HH:mm")}
                      </p>
                    )}
                    {event.location && (
                      <p className={cn("text-gray-600", sectionText)}>
                        <span className="font-medium">Lugar:</span>{" "}
                        {event.location}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    {event.registration_link ? (
                      now < subDays(new Date(event.start_time), 7) ? (
                        <a
                          href={event.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="green">Regístrate</Button>
                        </a>
                      ) : (
                        <Button disabled variant="green">
                          Ya no se aceptan registros
                        </Button>
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center">
              <PaginationControls
                hasNextPage={hasNextPage}
                totalPages={totalPages}
                basePath="/eventos/proximos-eventos"
                currentPage={page}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
