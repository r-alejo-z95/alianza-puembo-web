'use client';

import { useState, useEffect, useMemo } from 'react';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PrayerRequestRow } from './table-cells/PrayerRequestRow';
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Loader2, ListFilter, HandHelping, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils.ts";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import { usePrayerRequests } from '@/lib/hooks/usePrayerRequests';
import RecycleBin from './RecycleBin';

export default function PrayerRequestManager() {
  const {
    requests,
    archivedRequests,
    loading,
    loadingArchived,
    updateStatus,
    archiveRequest,
    restoreRequest,
    permanentlyDeleteRequest,
    fetchArchivedRequests
  } = usePrayerRequests();

  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

  // Cargar archivados cuando se abre la papelera
  useEffect(() => {
    if (isRecycleBinOpen) {
      fetchArchivedRequests();
    }
  }, [isRecycleBinOpen, fetchArchivedRequests]);

  const handleStatusChange = async (id, newStatus) => {
    await updateStatus(id, newStatus);
  };

  const handleDelete = async (requestId) => {
    const success = await archiveRequest(requestId);
    if (success) {
      const newTotalPages = Math.ceil((requests.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  };

  const totalPages = useMemo(() => Math.ceil(requests.length / itemsPerPage), [requests.length, itemsPerPage]);
  const currentRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return requests.slice(startIndex, endIndex);
  }, [requests, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 md:p-12 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <ListFilter className="w-3 h-3" />
              <span>Moderación de Muro</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">Peticiones Recibidas</CardTitle>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-6 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
            onClick={() => setIsRecycleBinOpen(true)}
          >
            <Trash2 className="w-5 h-5 lg:mr-2" />
            <span className="hidden lg:inline">Papelera</span>
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={6} />
          ) : requests.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <HandHelping className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic">No hay peticiones de oración registradas.</p>
            </div>
          ) : (
            <div id='prayer-request-table'>
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 w-1/3">Petición</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Remitente</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Fecha</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Privacidad</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Estado</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRequests.map((req) => (
                      <PrayerRequestRow
                        key={req.id}
                        request={req}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        compact={false}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="lg:hidden p-6 space-y-6">
                {currentRequests.map((req) => (
                  <PrayerRequestRow
                    key={req.id}
                    request={req}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    compact={true}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="p-8 border-t border-gray-50">
                  <PaginationControls
                    hasNextPage={currentPage < totalPages}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <RecycleBin 
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="prayer"
        items={archivedRequests}
        onRestore={restoreRequest}
        onDelete={permanentlyDeleteRequest}
        loading={loadingArchived}
      />
    </div>
  );
}