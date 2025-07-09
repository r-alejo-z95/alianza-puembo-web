"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { paginationButton, paginationContainer } from "@/lib/styles";

export function PaginationControls({ hasNextPage, totalPages, basePath }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");

  const handlePrevious = () => {
    router.push(`${basePath}?page=${page - 1}`);
  };

  const handleNext = () => {
    router.push(`${basePath}?page=${page + 1}`);
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