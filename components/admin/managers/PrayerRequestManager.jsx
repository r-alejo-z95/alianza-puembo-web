
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PrayerRequestRow } from './table-cells/PrayerRequestRow';

export default function PrayerRequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (requestId) => {
    const { error } = await supabase.from('prayer_requests').delete().eq('id', requestId);
    if (error) {
      console.error('Error deleting prayer request:', error);
      toast.error('Error al eliminar la petición.');
    } else {
      toast.success('Petición eliminada con éxito.');
      fetchRequests();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peticiones Recibidas</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando peticiones...</p>
        ) : (
          <div id='prayer-request-table'>
            {/* Pantallas grandes */}
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Petición</TableHead>
                    <TableHead className="font-bold">Nombre</TableHead>
                    <TableHead className="font-bold">Fecha</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <PrayerRequestRow
                      key={req.id}
                      request={req}
                      onDelete={handleDelete}
                      compact={false}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pantallas pequeñas */}
            <div className="lg:hidden space-y-4">
              <div className="w-full">
                {requests.map((req) => (
                  <PrayerRequestRow
                    key={req.id}
                    request={req}
                    onDelete={handleDelete}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
