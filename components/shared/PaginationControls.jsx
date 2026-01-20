"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { paginationButton, paginationContainer } from "@/lib/styles";

export function PaginationControls({
  hasNextPage,
  totalPages,
  currentPage,
  setCurrentPage,
  basePath,
  onPageChange,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine the current page based on whether basePath is provided (Next.js router pagination)
  const page = basePath
    ? parseInt(searchParams.get("page") || "1")
    : currentPage;

  const handlePrevious = () => {
    if (onPageChange) {
      onPageChange(page - 1);
    } else if (basePath) {
      router.push(`${basePath}?page=${page - 1}`);
    } else {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleNext = () => {
    if (onPageChange) {
      onPageChange(page + 1);
    } else if (basePath) {
      router.push(`${basePath}?page=${page + 1}`);
    } else {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }
  };

    return (

      <div className="flex items-center justify-center gap-6 py-6">

        <Button

          onClick={handlePrevious}

          disabled={page === 1}

          variant="outline"

          size="icon"

          className={cn(

            "rounded-full w-10 h-10 border-gray-200 transition-all duration-300",

            "hover:bg-[var(--puembo-green)] hover:border-[var(--puembo-green)] hover:text-white",

            "disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-current"

          )}

          aria-label="Anterior"

        >

          <ChevronLeft className="h-5 w-5" />

        </Button>

  

        <div className="flex items-center gap-2 font-sans">

          <span className="text-xl font-bold text-gray-900 leading-none">{page}</span>

          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">/</span>

          <span className="text-sm font-bold text-gray-500 leading-none">{totalPages}</span>

        </div>

  

        <Button

          onClick={handleNext}

          disabled={onPageChange ? page === totalPages : !hasNextPage}

          variant="outline"

          size="icon"

          className={cn(

            "rounded-full w-10 h-10 border-gray-200 transition-all duration-300",

            "hover:bg-[var(--puembo-green)] hover:border-[var(--puembo-green)] hover:text-white",

            "disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-current"

          )}

          aria-label="Siguiente"

        >

          <ChevronRight className="h-5 w-5" />

        </Button>

      </div>

    );

  }

  
