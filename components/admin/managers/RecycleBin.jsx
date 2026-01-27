"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  RotateCcw,
  Calendar,
  Newspaper,
  FileText,
  MessageSquare,
  BookOpen,
  Loader2,
  Trash,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminEditorPanel } from "@/components/admin/layout/AdminEditorPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Papelera de Reciclaje Universal Refinada
 * Consistente con el estilo editorial del dashboard
 */
export default function RecycleBin({
  open,
  onOpenChange,
  type,
  items = [],
  onRestore,
  onDelete,
  onBulkRestore,
  onBulkDelete,
  onEmptyTrash,
  loading,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Reset selection when opening/closing or changing type
  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
    }
  }, [open, type]);

  const getIcon = () => {
    switch (type) {
      case "events": return <Calendar className="w-5 h-5" />;
      case "news": return <Newspaper className="w-5 h-5" />;
      case "forms": return <FileText className="w-5 h-5" />;
      case "prayer": return <MessageSquare className="w-5 h-5" />;
      case "lom-posts": return <BookOpen className="w-5 h-5" />;
      case "lom-passages": return <Calendar className="w-5 h-5" />;
      default: return <Trash2 className="w-5 h-5" />;
    }
  };

  const getTypeName = () => {
    switch (type) {
      case "events": return "Eventos";
      case "news": return "Noticias";
      case "forms": return "Formularios";
      case "prayer": return "Peticiones";
      case "lom-posts": return "Devocionales";
      case "lom-passages": return "Semanas LOM";
      default: return "Elementos";
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length && items.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const handleSingleDelete = async () => {
    if (!confirmDelete) return;
    const success = await onDelete(confirmDelete.id);
    if (success) {
      setConfirmDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== confirmDelete.id));
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    const success = await onBulkRestore(selectedIds);
    if (success) setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const success = await onBulkDelete(selectedIds);
    if (success) {
      setSelectedIds([]);
      setConfirmBulkDelete(false);
    }
  };

  const handleEmptyTrash = async () => {
    const success = await onEmptyTrash();
    if (success) {
      setConfirmEmpty(false);
      setSelectedIds([]);
    }
  };

  return (
    <>
      <AdminEditorPanel
        open={open}
        onOpenChange={onOpenChange}
        title={
          <>
            Papelera de <br />
            <span className="text-[var(--puembo-green)] italic">
              {getTypeName()}
            </span>
          </>
        }
        description={`Recupera o elimina permanentemente tus archivos (${items.length}).`}
      >
        <div className="flex flex-col h-full bg-white relative">
          {items.length > 0 && (
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-6 border-b border-gray-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all-trash"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="rounded-md border-gray-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                />
                <label
                  htmlFor="select-all-trash"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 cursor-pointer select-none"
                >
                  {selectedIds.length > 0
                    ? `${selectedIds.length} seleccionados`
                    : "Seleccionar todo"}
                </label>
              </div>

              {selectedIds.length > 0 ? (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-full text-blue-600 border-blue-100 hover:bg-blue-50 px-4 font-bold text-[10px] uppercase tracking-widest"
                    onClick={handleBulkRestore}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Restaurar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-full text-red-600 border-red-100 hover:bg-red-50 px-4 font-bold text-[10px] uppercase tracking-widest"
                    onClick={() => setConfirmBulkDelete(true)}
                  >
                    <Trash className="w-3.5 h-3.5 mr-1.5" />
                    Eliminar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 px-4 font-bold text-[10px] uppercase tracking-widest transition-all"
                  onClick={() => setConfirmEmpty(true)}
                >
                  Vaciar Papelera
                </Button>
              )}
            </div>
          )}

          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--puembo-green)]" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Sincronizando Papelera...
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-10 h-10 text-gray-200" />
                </div>
                <p className="text-lg italic text-gray-500 font-serif text-center px-8">
                  La papelera está vacía
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 pb-20">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex items-center gap-4 p-6 transition-all duration-300",
                        isSelected ? "bg-red-50/20" : "hover:bg-gray-50/50"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(item.id)}
                        className="rounded-md border-gray-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                      />

                      <div
                        className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
                        onClick={() => toggleSelect(item.id)}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                            isSelected
                              ? "bg-red-100 text-red-500 scale-110 shadow-lg shadow-red-500/10"
                              : "bg-gray-50 text-gray-400"
                          )}
                        >
                          {getIcon()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 truncate text-base mb-0.5">
                            {item.title ||
                              item.passage_reference ||
                              (item.week_number
                                ? `Semana ${item.week_number}`
                                : null) ||
                              item.request_text?.substring(0, 50) ||
                              "Sin título"}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-[0.1em] font-bold">
                            Eliminado el{" "}
                            {item.archived_at
                              ? format(new Date(item.archived_at), "d 'de' MMM, HH:mm", { locale: es })
                              : "Recientemente"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full text-blue-600 hover:bg-blue-50 h-10 w-10"
                          onClick={(e) => { e.stopPropagation(); onRestore(item.id); }}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full text-red-600 hover:bg-red-50 h-10 w-10"
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(item); }}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AdminEditorPanel>

      {/* Dialogs de Confirmación (estilo editorial) */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-8 animate-in zoom-in-50 duration-300">
            <AlertCircle className="w-10 h-10" />
          </div>
          <DialogTitle className="text-3xl font-serif font-bold text-gray-900 mb-4 text-center leading-tight">
            ¿Eliminar para siempre?
          </DialogTitle>
          <DialogDescription className="text-gray-500 mb-10 text-center text-base leading-relaxed">
            Esta acción es <span className="font-bold text-gray-900">irreversible</span>. Se borrará permanentemente <span className="italic font-medium">"{confirmDelete?.title || "este elemento"}"</span>.
          </DialogDescription>
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="destructive"
              className="rounded-full h-14 font-bold text-xs uppercase tracking-widest bg-red-600 hover:bg-red-700 shadow-xl"
              onClick={handleSingleDelete}
            >
              Confirmar Eliminación
            </Button>
            <Button
              variant="ghost"
              className="rounded-full h-14 font-bold text-xs uppercase tracking-widest text-gray-400"
              onClick={() => setConfirmDelete(null)}
            >
              Mantener archivo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBulkDelete} onOpenChange={() => setConfirmBulkDelete(false)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-8">
            <Trash2 className="w-10 h-10" />
          </div>
          <DialogTitle className="text-3xl font-serif font-bold text-gray-900 mb-4 text-center leading-tight">
            Borrar Selección
          </DialogTitle>
          <DialogDescription className="text-gray-500 mb-10 text-center text-base leading-relaxed">
            Estás a punto de borrar definitivamente <span className="font-bold text-gray-900">{selectedIds.length} elementos</span>. ¿Deseas proceder?
          </DialogDescription>
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="destructive"
              className="rounded-full h-14 font-bold text-xs uppercase tracking-widest bg-red-600"
              onClick={handleBulkDelete}
            >
              Borrar Todo lo Seleccionado
            </Button>
            <Button
              variant="ghost"
              className="rounded-full h-14 font-bold text-xs uppercase tracking-widest text-gray-400"
              onClick={() => setConfirmBulkDelete(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmEmpty} onOpenChange={() => setConfirmEmpty(false)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-8">
            <Trash2 className="w-10 h-10" />
          </div>
          <DialogTitle className="text-3xl font-serif font-bold text-gray-900 mb-4 text-center leading-tight">
            ¿Vaciar Papelera?
          </DialogTitle>
          <DialogDescription className="text-gray-500 mb-10 text-center text-base leading-relaxed">
            Se eliminarán <span className="font-bold text-gray-900">TODOS</span> los elementos de la papelera de forma definitiva. No hay vuelta atrás.
          </DialogDescription>
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="destructive"
              className="rounded-full h-14 font-bold text-xs uppercase tracking-widest bg-red-600"
              onClick={handleEmptyTrash}
            >
              Vaciar Ahora
            </Button>
            <Button
              variant="ghost"
              className="rounded-full h-14 font-bold text-xs uppercase tracking-widest text-gray-400"
              onClick={() => setConfirmEmpty(false)}
            >
              Descartar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
