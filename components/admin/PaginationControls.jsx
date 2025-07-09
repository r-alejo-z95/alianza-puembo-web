"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { paginationButton, paginationContainer } from "@/lib/styles";

export function PaginationControls({ hasNextPage, totalPages, currentPage, setCurrentPage }) {
  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className={cn(paginationContainer)}>
      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={cn(paginationButton)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
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