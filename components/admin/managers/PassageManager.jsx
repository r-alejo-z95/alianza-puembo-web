'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from 'sonner';
import PassageForm from '@/components/admin/forms/PassageForm';
import { Edit, Trash2, Loader2, Plus, Calendar, BookOpen, User } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ecuadorToUTC } from '@/lib/date-utils';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { cn } from "@/lib/utils.ts";

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
      .select('*, profiles(full_name, email)')
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
          acc.push({ 
            week_number: passage.week_number, 
            week_start_date: passage.week_start_date, 
            passages: [passage],
            profiles: passage.profiles
          });
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
    const { data: { user } } = await supabase.auth.getUser();

    const passagesToSave = data.passages
      .filter(p => p.passage_reference)
      .map(p => ({
        ...p,
        week_number: data.week_number,
        week_start_date: data.week_start_date, // 👈 Literal DATE string YYYY-MM-DD
        user_id: user?.id,
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
    <div className="space-y-8">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Ciclo de Lectura</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">Pasajes Semanales</CardTitle>
          </div>
          <Button
            variant="green"
            className="rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
            onClick={() => {
              setSelectedWeek(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Programar Semana
          </Button>
        </CardHeader>
        
        <CardContent className="p-8 md:p-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)] opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Cargando Lecturas</p>
            </div>
          ) : weeks.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-gray-100 mx-auto" />
              <p className="text-gray-400 font-light italic">No hay pasajes programados todavía.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {currentWeeks.map(week => (
                  <AccordionItem 
                    value={`week-${week.week_number}`} 
                    key={week.week_number}
                    className="border border-gray-100 rounded-[2rem] px-6 px-8 transition-all hover:border-[var(--puembo-green)]/20"
                  >
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex items-center gap-6 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-data-[state=open]:bg-[var(--puembo-green)] group-data-[state=open]:text-white transition-colors">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-serif font-bold text-gray-900">Semana {week.week_number}</p>
                          <div className="flex items-center gap-2">
                            <AuthorAvatar profile={week.profiles} className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Programado por {week.profiles?.full_name?.split(' ')[0] || 'Admin'}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-8 pt-2">
                      <div className="bg-gray-50/50 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-end gap-8 border border-gray-100/50">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full">
                          {week.passages.map(passage => (
                            <li key={passage.id} className="flex flex-col gap-1 group">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)]">{passage.day_of_week}</span>
                              <span className="text-base font-bold text-gray-700 group-hover:text-black transition-colors whitespace-normal break-words">{passage.passage_reference}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-3 shrink-0 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setSelectedWeek(week); setIsFormOpen(true); }}
                            className="rounded-xl flex-1 md:flex-none border-gray-200 text-[var(--puembo-green)] md:text-black hover:bg-[var(--puembo-green)]/10 md:hover:text-[var(--puembo-green)] transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="rounded-xl flex-1 md:flex-none text-red-500 md:text-black hover:bg-red-50 md:hover:text-red-500 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
                              <AlertDialogHeader className="space-y-4">
                                <AlertDialogTitle className="text-2xl font-serif font-bold text-gray-900">¿Eliminar esta semana?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-500 font-light leading-relaxed">
                                  Esta acción borrará todos los pasajes asociados a la semana {week.week_number}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="pt-6">
                                <AlertDialogCancel className="rounded-full border-gray-100">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteWeek(week.week_number)} className="rounded-full bg-red-500 hover:bg-red-600">Eliminar todo</AlertDialogAction>
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
                <div className="pt-8 border-t border-gray-50">
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto border-none rounded-[3rem] shadow-2xl p-0">
          <div className="bg-black p-8 md:p-12">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">Configuración</span>
              </div>
              <DialogTitle className="text-4xl font-serif font-bold text-white leading-tight">
                Lecturas de <br />
                <span className="text-[var(--puembo-green)] italic">la Semana</span>
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 md:p-12 bg-white">
            <PassageForm
              week={selectedWeek}
              onSave={handleSave}
              onCancel={() => setIsFormOpen(false)}
              loading={loading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
