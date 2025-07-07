
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

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
          <div className="overflow-x-auto">
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
                  <TableRow key={req.id}>
                    <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{req.request_text}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top-start" className="max-w-3xs wrap-break-word">
                            <p>{req.request_text}</p>
                          </TooltipContent>
                        </Tooltip>
                       </TooltipProvider>
                    </TableCell>
                    <TableCell className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{req.name || 'N/A'}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top-start" className="max-w-3xs wrap-break-word">
                            <p>{req.name || 'N/A'}</p>
                          </TooltipContent>
                        </Tooltip>
                       </TooltipProvider>
                    </TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {req.is_public && <Badge variant="outline">Pública</Badge>}
                        {req.is_anonymous && <Badge variant="secondary">Anónima</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Eliminar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La petición será eliminada permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(req.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
