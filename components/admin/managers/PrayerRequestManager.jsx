'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PrayerRequestRow } from './table-cells/PrayerRequestRow';
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Loader2, ListFilter, HandHelping } from 'lucide-react';
import { cn } from "@/lib/utils.ts";

export default function PrayerRequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

  const supabase = createClient();

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prayer requests:', error);
      toast.error('Error al cargar las peticiones.');
    } else {
      setRequests(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setLoading(true);
    const { error } = await supabase
      .from('prayer_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error(`Error updating status for request ${id}:`, error);
      toast.error('Error al actualizar el estado.');
    } else {
      toast.success(`Petición ${newStatus === 'approved' ? 'aprobada' : 'rechazada'} con éxito.`);
      fetchRequests();
    }
  };

  const handleDelete = async (requestId) => {
    const { error } = await supabase.from('prayer_requests').delete().eq('id', requestId);
    if (error) {
      console.error('Error deleting prayer request:', error);
      toast.error('Error al eliminar la petición.');
    } else {
      toast.success('Petición eliminada.');
      fetchRequests();
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
        <CardHeader className="p-8 md:p-12 border-b border-gray-50 bg-gray-50/30 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <ListFilter className="w-3 h-3" />
              <span>Moderación de Muro</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">Peticiones Recibidas</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)] opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Cargando Peticiones</p>
            </div>
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
    </div>
  );
}
