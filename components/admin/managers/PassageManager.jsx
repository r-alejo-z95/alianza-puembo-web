'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from 'sonner';
import PassageForm from '@/components/admin/forms/PassageForm';
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { PaginationControls } from "@/components/shared/PaginationControls";

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function PassageManager() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const supabase = createClient();

  const fetchPassages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lom_passages')
      .select('*')
      .order('week_number', { ascending: false })

    if (error) {
      console.error('Error fetching passages:', error);
      toast.error('Error al cargar los pasajes.');
    } else {
      const sortedData = data.sort((a, b) => {
        return daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week);
      });

      const groupedByWeek = sortedData.reduce((acc, passage) => {
        const week = acc.find(w => w.week_number === passage.week_number);
        if (week) {
          week.passages.push(passage);
        } else {
          acc.push({ week_number: passage.week_number, week_start_date: passage.week_start_date, passages: [passage] });
        }
        return acc;
      }, []);
      setWeeks(groupedByWeek);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPassages();
  }, []);

  const totalPages = useMemo(() => Math.ceil(weeks.length / itemsPerPage), [weeks.length, itemsPerPage]);
  const currentWeeks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return weeks.slice(startIndex, endIndex);
  }, [weeks, currentPage, itemsPerPage]);

  const handleSave = async (data) => {
    setLoading(true);

    const passagesToSave = data.passages
      .filter(p => p.passage_reference)
      .map(p => ({
        ...p,
        week_number: data.week_number,
        week_start_date: data.week_start_date,
      }));

    if (selectedWeek) {
      await supabase.from('lom_passages').delete().eq('week_number', selectedWeek.week_number);
    }

    if (passagesToSave.length > 0) {
      const { error } = await supabase.from('lom_passages').insert(passagesToSave);

      if (error) {
        console.error('Error saving passages:', error);
        toast.error('Error al guardar los pasajes.');
      } else {
        toast.success('Pasajes guardados con éxito.');
      }
    } else if (selectedWeek) {
      toast.success('Todos los pasajes de la semana han sido eliminados.');
    }

    setIsFormOpen(false);
    fetchPassages();
  };

  const handleDeleteWeek = async (week_number) => {
    setLoading(true);
    const { error } = await supabase.from('lom_passages').delete().eq('week_number', week_number);
    if (error) {
      console.error('Error deleting week:', error);
      toast.error('Error al eliminar la semana.');
    } else {
      toast.success('Semana eliminada con éxito.');
    }
    fetchPassages();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Semanas Publicadas</CardTitle>
        <Button onClick={() => { setSelectedWeek(null); setIsFormOpen(true); }}>Crear Semana</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando semanas...</p>
        ) : (
          <>
            <Accordion type="single" collapsible className="w-full">
              {currentWeeks.map(week => (
                <AccordionItem value={`week-${week.week_number}`} key={week.week_number}>
                  <AccordionTrigger className="cursor-pointer">Semana {week.week_number}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex justify-between items-start">
                      <ul>
                        {week.passages.map(passage => (
                          <li key={passage.id} className="p-2">
                            <span><strong>{passage.day_of_week}:</strong> {passage.passage_reference}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" aria-label="Editar semana" onClick={() => { setSelectedWeek(week); setIsFormOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" aria-label="Eliminar semana">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente todos los pasajes de la semana.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteWeek(week.week_number)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {totalPages > 1 && (
              <PaginationControls
                hasNextPage={currentPage < totalPages}
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}
      </CardContent>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedWeek ? 'Editar Semana' : 'Crear Semana'}</DialogTitle>
          </DialogHeader>
          <PassageForm
            week={selectedWeek}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}