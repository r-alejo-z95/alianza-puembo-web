'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { useScreenSize } from '@/lib/hooks/useScreenSize';

export function PrayerWallSection({ requests }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const { isSm, isMd, isLg } = useScreenSize();

  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    if (isSm) {
      setItemsPerPage(4);
    } else if (isMd || isLg) {
      setItemsPerPage(6);
    }
  }, [isSm, isMd, isLg]);

  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  const onPageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="grid place-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-x-4">
        {currentRequests.map((req) => (
          <div key={req.id} className="text-gray-800 border-r-4 min-h-20 w-3xs max-w-xs border-(--puembo-green) pb-4 px-2">
            <div className="pt-2">
              <p className="text-muted-foreground wrap-break-word">{req.request_text}</p>
            </div>
            <div className="flex justify-between mt-4">
              <span className="text-sm text-gray-500">
                {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }, { timeZone: 'America/Guayaquil' })}
              </span>
              <div className="flex items-center gap-2">
                {!req.is_anonymous && req.name && <Badge variant="outline" className="whitespace-normal">{req.name}</Badge>}
                {req.is_anonymous && <Badge variant="secondary">Anónimo</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}