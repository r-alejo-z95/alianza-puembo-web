'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { paginationButton, paginationContainer } from "@/lib/styles";

export function PaginationControls({ hasNextPage, totalPages, currentPage, setCurrentPage, basePath }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine the current page based on whether basePath is provided (Next.js router pagination)
  const page = basePath ? parseInt(searchParams.get("page") || "1") : currentPage;

  const handlePrevious = () => {
    if (basePath) {
      router.push(`${basePath}?page=${page - 1}`);
    } else {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }
  };

  const handleNext = () => {
    if (basePath) {
      router.push(`${basePath}?page=${page + 1}`);
    } else {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }
  };

  return (
    <div className={cn(paginationContainer)}>
      <Button
        onClick={handlePrevious}
        disabled={page === 1}
        className={cn(paginationButton)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="text-sm text-gray-600">
        Página {page} de {totalPages}
      </span>
      <Button
        onClick={handleNext}
        disabled={!hasNextPage}
        className={cn(paginationButton)}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
