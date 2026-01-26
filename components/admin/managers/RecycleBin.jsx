"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  RotateCcw,
  X,
  AlertCircle,
  Calendar,
  Newspaper,
  FileText,
  MessageSquare,
  BookOpen,
  Loader2,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

/**
 * Papelera de Reciclaje Universal
 */
export default function RecycleBin({
  open,
  onOpenChange,
  type,
  items = [],
  onRestore,
  onDelete,
  loading,
}) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const getIcon = () => {
    switch (type) {
      case "events":
        return <Calendar className="w-5 h-5" />;
      case "news":
        return <Newspaper className="w-5 h-5" />;
      case "forms":
        return <FileText className="w-5 h-5" />;
      case "prayer":
        return <MessageSquare className="w-5 h-5" />;
      case "lom-posts":
        return <BookOpen className="w-5 h-5" />;
      case "lom-passages":
        return <Calendar className="w-5 h-5" />;
      default:
        return <Trash2 className="w-5 h-5" />;
    }
  };

  const getTypeName = () => {
    switch (type) {
      case "events":
        return "Eventos";
      case "news":
        return "Noticias";
      case "forms":
        return "Formularios";
      case "prayer":
        return "Peticiones de Oración";
      case "lom-posts":
        return "Devocionales LOM";
      case "lom-passages":
        return "Pasajes LOM";
      default:
        return "Elementos";
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const success = await onDelete(confirmDelete.id);
    if (success) setConfirmDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-500 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-2xl font-serif font-bold truncate">
                  Papelera de {getTypeName()}
                </DialogTitle>
                <DialogDescription className="line-clamp-1">
                  Gestiona los elementos eliminados recientemente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-2">
            <ScrollArea className="h-[400px] px-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[300px] gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Cargando Papelera...
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] gap-4 opacity-40">
                  <RotateCcw className="w-12 h-12 text-gray-300" />
                  <p className="text-sm italic text-gray-500">
                    La papelera está vacía
                  </p>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-red-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-red-400 transition-colors shrink-0">
                          {getIcon()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 truncate whitespace-normal">
                            {item.title ||
                              item.passage_reference ||
                              (item.week_number ? `Semana ${item.week_number}` : null) ||
                              item.request_text?.substring(0, 50) ||
                              "Sin título"}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-tight">
                            Eliminado el{" "}
                            {item.archived_at
                              ? format(
                                  new Date(item.archived_at),
                                  "d 'de' MMM, HH:mm",
                                  { locale: es },
                                )
                              : "Recientemente"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-blue-600 hover:bg-blue-50 h-8 px-3"
                          onClick={() => onRestore(item.id)}
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          <span className="hidden sm:inline">Restaurar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          onClick={() => setConfirmDelete(item)}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="p-6 bg-gray-50/30 border-t border-gray-100">
            <Button
              variant="outline"
              className="rounded-full px-8"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent className="max-w-md rounded-[2rem]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center">
              ¿Eliminar definitivamente?
            </DialogTitle>
            <DialogDescription className="text-center">
              Esta acción no se puede deshacer. Se eliminará el registro y sus
              archivos asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-full bg-red-600"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
