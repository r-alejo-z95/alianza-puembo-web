"use client";

import { notAvailableDevotional, sectionTitle } from "@/lib/styles";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatInEcuador } from "@/lib/date-utils";

export function LomDevotionalsList({
  titleSearchTerm,
  dateSearchTerm,
  currentPosts,
  totalPages,
  currentPage,
  setCurrentPage,
  onPostClick,
}) {
  return (
    <div className="md:col-span-2">
      <h2 className={`${sectionTitle} mb-4`}>
        {titleSearchTerm || dateSearchTerm
          ? "Resultados de la Búsqueda"
          : "Últimos Devocionales"}
      </h2>
      <div className="space-y-4">
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => onPostClick(post.slug)}
            >
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-gray-500">
                {formatInEcuador(post.publication_date)}
              </p>
            </div>
          ))
        ) : (
          <p className={notAvailableDevotional}>
            No se encontraron devocionales.
          </p>
        )}
      </div>
      {totalPages > 1 && (
        <PaginationControls
          hasNextPage={currentPage < totalPages}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}
