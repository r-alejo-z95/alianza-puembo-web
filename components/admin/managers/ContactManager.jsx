"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Search,
  X,
  Mail,
  Trash2,
  CheckCircle2,
  ChevronRight,
  User,
  Calendar,
  Reply,
  Loader2,
  MoreVertical,
  Filter,
  ArrowRight,
  Clock,
  ShieldCheck,
  ChevronDown,
  MailOpen,
  MailQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useContactMessages } from "@/lib/hooks/useContactMessages";
import { AdminEditorPanel } from "../layout/AdminEditorPanel";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import RecycleBin from "./RecycleBin";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { replyToContactMessage } from "@/lib/actions";

export default function ContactManager({ initialMessages = [] }) {
  const {
    messages,
    archivedMessages,
    loading,
    loadingArchived,
    markAsRead,
    archiveMessage,
    restoreMessage,
    deleteMessagePermanently,
    refetchMessages,
    fetchArchivedMessages,
  } = useContactMessages({ initialMessages });

  const [isPanelOpen, setIsFormOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (isRecycleBinOpen) fetchArchivedMessages();
  }, [isRecycleBinOpen, fetchArchivedMessages]);

  const filteredMessages = useMemo(() => {
    let result = [...messages];
    if (searchTerm) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.message.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }
    return result;
  }, [messages, searchTerm, statusFilter]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMessages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  const handleOpenMessage = (msg) => {
    setSelectedMsg(msg);
    setIsFormOpen(true);
    if (msg.status === "unread") {
      markAsRead(msg.id);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const result = await replyToContactMessage(selectedMsg.id, replyText);
      if (result.success) {
        toast.success("Respuesta enviada correctamente");
        setReplyText("");
        setIsFormOpen(false);
        refetchMessages();
      } else {
        toast.error(result.error || "Error al enviar la respuesta");
      }
    } catch (e) {
      toast.error("Error inesperado");
    } finally {
      setIsSendingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "unread":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
            Nuevo
          </Badge>
        );
      case "read":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
            Leído
          </Badge>
        );
      case "replied":
        return (
          <Badge className="bg-[var(--puembo-green)] hover:bg-[hsl(92,45.9%,40%)] text-white rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
            Respondido
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-6 md:p-10 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Mail className="w-3 h-3" /> <span>Inbox Institucional</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">
              Bandeja de Contacto
            </CardTitle>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-5 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all"
            onClick={() => setIsRecycleBinOpen(true)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            <span className="text-xs uppercase tracking-widest">Papelera</span>
          </Button>
        </CardHeader>

        <div className="px-6 py-4 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <Input
                  placeholder="Buscar por nombre, email o mensaje..."
                  className="pl-14 h-14 rounded-full bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative group min-w-[200px]">
                <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-14 pr-10 h-14 rounded-full bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10 appearance-none outline-none cursor-pointer text-gray-700"
                >
                  <option value="all">Todos los estados</option>
                  <option value="unread">Sin leer</option>
                  <option value="read">Leídos</option>
                  <option value="replied">Respondidos</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={5} />
          ) : filteredMessages.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic text-lg font-serif px-8">
                {searchTerm
                  ? "No se encontraron mensajes."
                  : "No hay mensajes de contacto aún."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                      Remitente
                    </TableHead>
                    <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                      Mensaje
                    </TableHead>
                    <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                      Fecha
                    </TableHead>
                    <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                      Estado
                    </TableHead>
                    <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((msg) => (
                    <TableRow
                      key={msg.id}
                      className={cn(
                        "group transition-all duration-300 border-b border-gray-50 cursor-pointer",
                        msg.status === "unread" ? "bg-orange-50/10" : "hover:bg-gray-50/50",
                      )}
                      onClick={() => handleOpenMessage(msg)}
                    >
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 truncate max-w-[180px]">
                            {msg.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[180px]">
                            {msg.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <p className="text-sm text-gray-600 line-clamp-1 max-w-[300px]">
                          {msg.message}
                        </p>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-gray-700">
                            {format(parseISO(msg.created_at), "d MMM", { locale: es })}
                          </span>
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">
                            {format(parseISO(msg.created_at), "HH:mm")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-center">
                        {getStatusBadge(msg.status)}
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveMessage(msg.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="p-12 border-t border-gray-50 bg-gray-50/10">
              <PaginationControls
                hasNextPage={currentPage < totalPages}
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AdminEditorPanel
        open={isPanelOpen}
        onOpenChange={setIsFormOpen}
        title={
          <>
            Detalle de <br />
            <span className="text-[var(--puembo-green)] italic">Mensaje</span>
          </>
        }
      >
        <div className="md:p-12 bg-white pb-20 space-y-12">
          {selectedMsg && (
            <>
              {/* Contenido del Mensaje Original */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                  <div className="h-px w-8 bg-gray-200" />
                  <span>Mensaje Recibido</span>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-8 md:p-10 border border-gray-100 relative overflow-hidden">
                  <Mail className="absolute -right-4 -bottom-4 w-32 h-32 text-gray-100 -rotate-12" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/50 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg leading-tight">{selectedMsg.name}</p>
                          <p className="text-xs text-[var(--puembo-green)] font-medium">{selectedMsg.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {format(parseISO(selectedMsg.created_at), "d MMMM, yyyy", { locale: es })}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {format(parseISO(selectedMsg.created_at), "HH:mm 'hrs'")}</span>
                      </div>
                    </div>
                    <div className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap italic">
                      "{selectedMsg.message}"
                    </div>
                    {selectedMsg.phone && (
                      <div className="pt-4 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Teléfono:</span>
                        <span className="text-gray-900">{selectedMsg.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Área de Respuesta */}
              {selectedMsg.status === "replied" ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                    <div className="h-px w-8 bg-[var(--puembo-green)]" />
                    <span>Tu Respuesta</span>
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 md:p-10 border-2 border-[var(--puembo-green)]/20 shadow-xl shadow-green-500/5">
                    <div className="flex items-center gap-3 mb-6">
                      <AuthorAvatar profile={selectedMsg.replied_by} className="h-8 w-8" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Respondido por {selectedMsg.replied_by?.full_name?.split(' ')[0] || 'Admin'}</span>
                        <span className="text-[9px] text-gray-300 font-medium italic">{format(parseISO(selectedMsg.replied_at), "d 'de' MMMM, HH:mm", { locale: es })}</span>
                      </div>
                    </div>
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedMsg.reply_content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">
                    <div className="h-px w-8 bg-blue-500" />
                    <span>Redactar Respuesta</span>
                  </div>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Escribe aquí tu respuesta para el usuario..."
                      className="min-h-[200px] rounded-[2rem] p-8 border-gray-100 bg-gray-50 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex items-start gap-3 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                      <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-600/80 leading-relaxed font-medium">
                        <strong>Nota Importante:</strong> Esta respuesta se enviará vía Resend. 
                        El usuario recibirá el correo con tu email personal como "Reply-To" y copia a la oficina. 
                        Si el usuario responde, la conversación continuará en tu correo habitual.
                      </p>
                    </div>
                    <Button
                      variant="green"
                      className="w-full rounded-full py-8 font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-500/20 gap-3"
                      disabled={!replyText.trim() || isSendingReply}
                      onClick={handleSendReply}
                    >
                      {isSendingReply ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Reply className="w-5 h-5" />
                      )}
                      {isSendingReply ? "Enviando..." : "Enviar Respuesta Oficial"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </AdminEditorPanel>

      <RecycleBin
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="contact"
        items={archivedMessages}
        onRestore={restoreMessage}
        onDelete={deleteMessagePermanently}
        loading={loadingArchived}
      />
    </div>
  );
}

function AuthorAvatar({ profile, className }) {
  const initials = profile?.full_name
    ? profile.full_name.substring(0, 2).toUpperCase()
    : "A";
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-md shrink-0",
        className,
      )}
    >
      {initials}
    </div>
  );
}
