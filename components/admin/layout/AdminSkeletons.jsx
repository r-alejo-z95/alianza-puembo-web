"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * TableSkeleton
 * Imita una fila de tabla en desktop.
 */
export function TableSkeleton({ columns = 5 }) {
  return (
    <TableRow className="hover:bg-transparent border-b border-gray-50">
      <TableCell className="px-8 py-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-2 w-2 rounded-full shrink-0" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
        </div>
      </TableCell>
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <TableCell key={i} className="px-8 py-6">
          <div className="flex justify-center">
            <Skeleton className="h-4 w-24" />
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}

/**
 * CardSkeleton
 * Imita la tarjeta compacta móvil de la Etapa 2.
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-5 w-[90%]" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[60%]" />
      </div>

      <div className="flex gap-4 pt-1">
        <Skeleton className="h-2 w-20" />
        <Skeleton className="h-2 w-20" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * ManagerSkeleton
 * Maneja la visualización responsiva de skeletons.
 */
export function ManagerSkeleton({ rows = 5, columns = 5 }) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table className="w-full">
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableSkeleton key={i} columns={columns} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden p-6 space-y-6">
        {Array.from({ length: rows }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
