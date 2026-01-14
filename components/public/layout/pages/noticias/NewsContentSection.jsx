"use client";

import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import {
  sectionTitle,
  sectionText,
  contentSection,
  notAvailableText,
} from "@/lib/styles";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatLiteralDate, formatLiteralTime } from "@/lib/date-utils";

export function NewsContentSection({ news, totalPages, hasNextPage, page }) {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      {!news || news.length === 0 ? (
        <p className={notAvailableText}>No hay noticias para mostrar.</p>
      ) : (
        <div className="flex flex-col gap-10 md:gap-16 w-full md:w-auto mx-auto">
          {news.map((item) => (
            <div
              id={item.title}
              key={item.id}
              className="flex flex-col items-center text-center"
            >
              {item.image_url && (
                <div
                  className="relative w-full mb-2 md:mb-4"
                  style={{
                    aspectRatio:
                      item.image_w && item.image_h
                        ? `${item.image_w} / ${item.image_h}`
                        : "16 / 9",
                  }}
                >
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
                    className="rounded-lg object-contain"
                    priority
                  />
                </div>
              )}
              <h2 className={cn(sectionTitle, "mb-2")}>{item.title}</h2>
              {item.description && (
                <p className={cn(sectionText, "mb-2 max-w-2xl text-gray-800")}>
                  {item.description}
                </p>
              )}
              <div className="flex flex-col justify-center items-center gap-2">
                <div className="flex flex-col">
                  {item.news_date && (
                    <p className={cn("text-gray-600", sectionText)}>
                      <span className="font-medium">Fecha:</span>{" "}
                      {formatLiteralDate(item.news_date)}
                    </p>
                  )}
                  {item.news_time && (
                    <p className={cn("text-gray-600", sectionText)}>
                      <span className="font-medium">Hora:</span>{" "}
                      {formatLiteralTime(item.news_time)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <PaginationControls
              hasNextPage={hasNextPage}
              totalPages={totalPages}
              basePath="/noticias"
              currentPage={page}
            />
          )}
        </div>
      )}
    </section>
  );
}
