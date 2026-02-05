"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  Search,
  Building2,
  Receipt,
  Eye,
  X,
  FileDown,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Banknote,
  Sparkles,
  User,
  CalendarDays,
  ShieldAlert,
  ChevronRight,
  Filter,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, addDays, subDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { updateFinancialStatus, getReceiptSignedUrl } from "@/lib/actions/finance";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function findNameInSubmission(data) {
  if (!data) return null;
  const nameKeys = ["nombre", "nombre completo", "full name", "name", "nombre y apellido", "nombres"];
  for (const key of Object.keys(data)) {
    if (nameKeys.some(nk => key.toLowerCase().includes(nk))) return data[key];
  }
  return null;
}

function displayDate(dateStr) {
  if (!dateStr) return 'No detectada';
  try {
    return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es });
  } catch (e) { return dateStr; }
}

export function ReconciliationWorkbench({ 
  bankTransactions = [], 
  submissions = [], 
  onRefresh,
  isFormSelected = false
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [manualSearchId, setManualSearchId] = useState(null); 
  const [bankSearch, setBankSearch] = useState("");
  const [pageSize, setPageSize] = useState("25");
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  // Track items being reconciled for optimistic UI
  const [processingIds, setProcessingIds] = useState(new Set());

  const usedTransactionIds = useMemo(() => {
    return new Set(bankTransactions.filter(bt => bt.is_reconciled).map(bt => bt.id));
  }, [bankTransactions]);

  const reconciliationData = useMemo(() => {
    return submissions.map(sub => {
      const aiData = sub.financial_data || {};
      const amount = Number(aiData.amount);
      const dateStr = aiData.date;
      const ref = aiData.reference;

      if (sub.financial_status === 'verified' && sub.bank_transaction_id) {
        const match = bankTransactions.find(bt => bt.id === sub.bank_transaction_id);
        return { 
          ...sub, 
          match, 
          matchType: 'verified',
          matchPriority: -1,
          submissionName: findNameInSubmission(sub.data)
        };
      }

      const availableBankRows = bankTransactions.filter(bt => !usedTransactionIds.has(bt.id));
      const suggestions = [];

      if (ref) {
        const perfect = availableBankRows.find(bt => bt.reference && bt.reference.toLowerCase() === String(ref).toLowerCase());
        if (perfect) suggestions.push({ ...perfect, matchType: 'perfect', confidence: 100 });
      }

      if (dateStr && suggestions.length === 0) {
        const exactDateMatches = availableBankRows.filter(bt => {
          const amountMatch = Math.abs(bt.amount - amount) < 0.01;
          return amountMatch && isSameDay(parseISO(bt.date), parseISO(dateStr));
        });
        exactDateMatches.forEach(m => suggestions.push({ ...m, matchType: 'high', confidence: 90 }));
      }

      if (dateStr && suggestions.length === 0) {
        const fuzzyMatches = availableBankRows.filter(bt => {
          const amountMatch = Math.abs(bt.amount - amount) < 0.01;
          const receiptDate = parseISO(dateStr);
          const bankDate = parseISO(bt.date);
          return amountMatch && (isSameDay(bankDate, addDays(receiptDate, 1)) || isSameDay(bankDate, subDays(receiptDate, 1)));
        });
        fuzzyMatches.forEach(m => suggestions.push({ ...m, matchType: 'medium', confidence: 70 }));
      }

      let matchPriority = 3;
      const topMatch = suggestions[0];
      if (topMatch?.matchType === 'perfect') matchPriority = 0;
      else if (topMatch?.matchType === 'high') matchPriority = 1;
      else if (topMatch?.matchType === 'medium') matchPriority = 2;

      return { ...sub, suggestions, match: topMatch, matchType: topMatch?.matchType, matchPriority, submissionName: findNameInSubmission(sub.data) };
    });
  }, [bankTransactions, submissions, usedTransactionIds]);

  const pendingItems = useMemo(() => {
    return reconciliationData
      .filter(d => d.financial_status !== 'verified' && !processingIds.has(d.id))
      .sort((a, b) => a.matchPriority - b.matchPriority);
  }, [reconciliationData, processingIds]);

  const verifiedItems = useMemo(() => reconciliationData.filter(d => d.financial_status === 'verified'), [reconciliationData]);

  const handleVerify = async (subId, transactionId) => {
    // Start optimistic processing
    setProcessingIds(prev => new Set(prev).add(subId));
    
    try {
      const res = await updateFinancialStatus(subId, "verified", `Conciliado el ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, transactionId);
      if (res.success) {
        toast.success("Movimiento verificado");
        await onRefresh();
        setManualSearchId(null);
      } else {
        toast.error("Error al validar");
        setProcessingIds(prev => {
          const next = new Set(prev);
          next.delete(subId);
          return next;
        });
      }
    } catch (e) {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(subId);
        return next;
      });
    }
  };

  const handleViewReceipt = async (item) => {
    let path = null;
    Object.values(item.data || {}).forEach((val) => { if (val?.financial_receipt_path) path = val.financial_receipt_path; });
    if (!path) return toast.error("Sin imagen");
    setIsLoadingImage(true);
    try {
      const res = await getReceiptSignedUrl(path);
      if (res.url) setViewingReceipt({ url: res.url, title: item.submissionName || 'Comprobante', aiData: item.financial_data });
    } catch (e) { toast.error("Error"); } finally { setIsLoadingImage(false); }
  };

  const filteredBankTransactions = useMemo(() => {
    let list = bankTransactions;
    if (bankSearch) {
      const s = bankSearch.toLowerCase();
      list = list.filter(bt => bt.description?.toLowerCase().includes(s) || bt.amount?.toString().includes(s) || bt.reference?.toLowerCase().includes(s));
    }
    return list.slice(0, parseInt(pageSize));
  }, [bankTransactions, bankSearch, pageSize]);

  const selectedManualSub = useMemo(() => submissions.find(s => s.id === manualSearchId), [submissions, manualSearchId]);

  const renderItem = (item) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "circOut" }}
    >
      <Card className={cn("border-none shadow-xl overflow-hidden transition-all hover:shadow-2xl mb-6 rounded-[2rem] md:rounded-[2.5rem]", item.financial_status === 'verified' ? "ring-2 ring-[var(--puembo-green)] bg-emerald-50/20" : "bg-white", item.financial_data?.is_correct_beneficiary === false && "ring-2 ring-red-500 bg-red-50/10")}>
        <div className="flex flex-col lg:flex-row">
          <div className="flex-[1.2] p-6 md:p-10 space-y-6 md:space-y-8 border-r border-gray-50 bg-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge className="bg-amber-50 text-amber-600 border-none rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-widest">Datos del Comprobante</Badge>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{item.submissionName || "Inscrito Anónimo"}</h4>
                <div className="space-y-1.5 pt-1">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide"><User className="w-3.5 h-3.5 text-[var(--puembo-green)]" /> Nombre en Foto: <span className="text-gray-900 font-black">{item.financial_data?.sender_name || "Desconocido"}</span></span>
                  {item.financial_data?.is_correct_beneficiary === false && <Badge variant="destructive" className="rounded-full text-[8px] gap-1.5 px-3 py-1 animate-pulse border-none"><ShieldAlert className="w-3.5 h-3.5" /> Beneficiario Incorrecto</Badge>}
                </div>
              </div>
              {item.financial_status === 'verified' && <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--puembo-green)] text-white flex items-center justify-center shadow-lg animate-in zoom-in"><CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" /></div>}
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-gray-50/80 rounded-[1.5rem] p-4 md:p-5 border border-gray-100 shadow-sm"><span className="text-[9px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Monto</span><span className="text-2xl md:text-3xl font-black text-gray-900 font-serif tracking-tight">${Number(item.financial_data?.amount || 0).toFixed(2)}</span></div>
              <div className="bg-gray-50/80 rounded-[1.5rem] p-4 md:p-5 border border-gray-100 shadow-sm"><span className="text-[9px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Fecha</span><span className="text-sm md:text-base font-bold text-gray-700">{displayDate(item.financial_data?.date)}</span></div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100"><Receipt className="w-3.5 h-3.5 text-emerald-600" /> Referencia: <span className="text-gray-900 font-bold ml-1">{item.financial_data?.reference || 'N/A'}</span></div>
              <Button variant="ghost" size="sm" className="h-10 rounded-full px-5 text-[10px] font-black uppercase tracking-widest gap-2 text-[var(--puembo-green)] hover:bg-green-50 transition-all" onClick={() => handleViewReceipt(item)}><Eye className="w-4 h-4" /> Ver Imagen</Button>
            </div>
          </div>
          <div className="lg:w-24 flex items-center justify-center py-6 lg:py-0 bg-gray-50/30 relative">
            <div className="h-px w-full bg-gray-100 absolute top-1/2 left-0 -z-10 hidden lg:block" />
            {item.match ? <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-2xl ring-8 z-10 animate-in zoom-in", item.matchType === 'perfect' ? "text-[var(--puembo-green)] ring-[var(--puembo-green)]/10" : "text-amber-500 ring-amber-500/10")}><ArrowRight className="w-7 h-7 md:w-8 md:h-8" /></div> : <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center text-orange-400 shadow-2xl ring-8 ring-orange-500/10 z-10"><AlertCircle className="w-8 h-8" /></div>}
          </div>
          <div className={cn("flex-1 p-6 md:p-10 space-y-6 md:space-y-8 transition-colors", item.match ? "bg-emerald-50/10" : "bg-orange-50/5")}>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Movimiento Bancario</span>{item.suggestions?.length > 1 && <Badge variant="outline" className="rounded-full text-[9px] font-bold border-amber-200 text-amber-600 bg-white px-3 py-1">{item.suggestions.length} Sugerencias</Badge>}</div>
              {item.match ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3"><h4 className="font-bold text-gray-900 text-lg md:text-xl leading-snug flex-1 uppercase tracking-tight">{item.match.description}</h4>{item.matchType === 'perfect' && <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-sm"><Sparkles className="w-3 h-3" /> Match Perfecto</Badge>}</div>
                    <div className="grid grid-cols-1 gap-2.5"><div className="flex items-center gap-2.5 text-[11px] text-gray-500"><div className="p-1.5 rounded-lg bg-gray-100"><CalendarDays className="w-3.5 h-3.5" /></div><span className="font-bold uppercase tracking-tight">Efectivizado el:</span><span className="text-gray-900 font-bold">{displayDate(item.match.date)}</span></div><div className="flex items-center gap-2.5 text-[11px] text-gray-500"><div className="p-1.5 rounded-lg bg-emerald-100/50"><Receipt className="w-3.5 h-3.5 text-emerald-600" /></div><span className="font-bold uppercase tracking-tight">Ref Banco:</span><span className="text-[var(--puembo-green)] font-black tracking-widest">{item.match.reference || 'N/A'}</span></div></div>
                    <p className="text-3xl md:text-4xl font-serif font-black text-[var(--puembo-green)] pt-2 tracking-tighter">+ ${item.match.amount.toFixed(2)}</p>
                  </div>
                  <div className="pt-6 border-t border-emerald-100/50 flex gap-4">
                    <Button 
                      size="lg" 
                      variant="green" 
                      className="flex-1 rounded-full h-12 md:h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20 transition-all hover:-translate-y-0.5" 
                      onClick={() => handleVerify(item.id, item.match.id)} 
                      disabled={item.financial_status === 'verified'}
                    >
                      {item.financial_status === 'verified' ? '¡Validado!' : 'Validar Ingreso'}
                    </Button>
                    {item.financial_status !== 'verified' && (
                      <Button onClick={() => setManualSearchId(item.id)} variant="outline" className="h-12 w-12 md:h-14 md:w-14 rounded-full border-gray-200 hover:bg-gray-50 transition-all"><ChevronRight className="w-6 h-6 text-gray-400" /></Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-4"><div className="p-6 bg-white rounded-[2rem] border border-orange-100 shadow-sm flex items-start gap-4"><AlertCircle className="w-6 h-6 text-orange-400 shrink-0" /><p className="text-sm font-medium text-orange-600 italic leading-relaxed">No se ha podido localizar un movimiento que coincida con este comprobante en los movimientos bancarios.</p></div><Button onClick={() => setManualSearchId(item.id)} className="w-full rounded-full h-16 bg-gray-900 text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:-translate-y-0.5"><Search className="w-4 h-4 mr-2" /> Búsqueda Manual</Button></div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-12">
      {/* 1. MASTER BANK LEDGER */}
      <Card className="border-none shadow-2xl bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-6 md:p-12 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gray-900 text-white">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-[var(--puembo-green)] flex items-center justify-center text-black shadow-lg shadow-green-500/20"><Banknote className="w-7 h-7 md:w-8 md:h-8" /></div>
            <div><CardTitle className="text-xl md:text-3xl font-serif font-bold tracking-tight">Movimientos Bancarios</CardTitle><p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.4em] mt-1">Historial Consolidado de Ingresos</p></div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 shrink-0"><Filter className="w-3.5 h-3.5 text-gray-50" /><Select value={pageSize} onValueChange={setPageSize}><SelectTrigger className="h-8 w-20 bg-transparent border-none text-white font-black text-xs p-0 focus:ring-0"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl bg-gray-900 text-white border-white/10"><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem><SelectItem value="250">250</SelectItem><SelectItem value="500">500</SelectItem></SelectContent></Select></div>
            <div className="relative w-full md:w-80 group"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-[var(--puembo-green)] transition-colors" /><Input placeholder="Filtrar movimientos..." className="pl-12 h-14 bg-white/10 border-white/5 text-sm rounded-2xl focus:bg-white/20 transition-all text-white placeholder:text-gray-600 focus:ring-0 shadow-inner" value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} /></div>
          </div>
        </CardHeader>
        <div className="max-h-[380px] overflow-y-auto scrollbar-none bg-gray-50/50">
          <Table>
            <TableHeader className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md shadow-sm">
              <TableRow className="border-b border-gray-100">
                <TableHead className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center w-[120px]">Fecha</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Descripción / Origen</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Referencia</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Monto</TableHead>
                <TableHead className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center w-[150px]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredBankTransactions.map((bt) => {
                  const isUsed = bt.is_reconciled;
                  return (
                    <TableRow key={bt.id} className={cn("border-b border-gray-50 transition-all bg-white", isUsed ? "bg-emerald-50/20 opacity-50" : "hover:bg-gray-50")}>
                      <TableCell className="px-10 py-5 font-bold text-gray-500 text-xs text-center whitespace-nowrap">{format(parseISO(bt.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="px-8 py-5 text-xs font-bold text-gray-900 uppercase truncate max-w-sm tracking-tight">{bt.description}</TableCell>
                      <TableCell className="px-8 py-5 text-[11px] font-black text-[var(--puembo-green)] tracking-wider font-mono bg-gray-50/30">{bt.reference || '-'}</TableCell>
                      <TableCell className="px-8 py-5 text-right font-black text-gray-900 text-lg font-serif tracking-tighter">${bt.amount?.toFixed(2)}</TableCell>
                      <TableCell className="px-10 py-5 text-center">
                        {isUsed ? <Badge className="bg-[var(--puembo-green)] text-white border-none rounded-full text-[9px] font-black uppercase px-5 py-2 shadow-md">Conciliado</Badge> : <Badge variant="outline" className="text-gray-300 border-gray-200 rounded-full text-[9px] font-black uppercase px-5 py-2">Disponible</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 2. AUDIT AREA WITH ANIMATED LIST */}
      {isFormSelected ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-2">
            <TabsList className="bg-gray-100/80 p-1.5 rounded-full h-auto border border-gray-200/50 shadow-inner backdrop-blur-sm self-start">
              <TabsTrigger value="pending" className="rounded-full py-4 px-12 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 gap-4">Pendientes <span className={cn("rounded-full px-3 py-1 text-[10px] font-black transition-colors duration-500", activeTab === "pending" ? "bg-[var(--puembo-green)] text-black" : "bg-gray-200 text-gray-500")}>{pendingItems.length}</span></TabsTrigger>
              <TabsTrigger value="verified" className="rounded-full py-4 px-12 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 gap-4">Conciliados <span className={cn("rounded-full px-3 py-1 text-[10px] font-black transition-colors duration-500", activeTab === "verified" ? "bg-[var(--puembo-green)] text-black" : "bg-gray-200 text-gray-500")}>{verifiedItems.length}</span></TabsTrigger>
            </TabsList>
            <div className="relative group min-w-full lg:min-w-[450px]"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-all duration-500" /><Input placeholder="Buscar inscrito..." className="pl-16 h-16 rounded-[2rem] bg-white border-gray-100 shadow-xl focus:ring-8 focus:ring-[var(--puembo-green)]/5 transition-all duration-500 text-sm font-medium placeholder:text-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </div>
          
          <TabsContent value="pending" className="outline-none">
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {pendingItems
                  .filter(item => { const s = searchTerm.toLowerCase(); return (item.submissionName || "").toLowerCase().includes(s) || (item.financial_data?.sender_name || "").toLowerCase().includes(s); })
                  .map(item => renderItem(item))}
              </AnimatePresence>
              {pendingItems.length === 0 && (
                <div className="py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100 shadow-inner">
                  <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm"><CheckCircle2 className="w-12 h-12 text-[var(--puembo-green)]/40" /></div>
                  <h4 className="text-3xl font-serif font-bold text-gray-400">¡Conciliación al Día!</h4>
                  <p className="text-gray-300 text-[11px] uppercase tracking-[0.4em] font-black mt-4">Todo el presupuesto ha sido conciliado exitosamente</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="verified" className="outline-none">
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {verifiedItems.map(item => renderItem(item))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100 shadow-inner"><div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm"><Database className="w-12 h-12 text-gray-300" /></div><h4 className="text-3xl font-serif font-bold text-gray-400">Selecciona una Actividad</h4><p className="text-gray-300 text-[11px] uppercase tracking-[0.4em] font-black mt-4">Para comenzar a cruzar con los movimientos bancarios</p></div>
      )}

      {/* MODALS REMAIN THE SAME BUT WITH SMOOTH ENTRY */}
      <Dialog open={!!manualSearchId} onOpenChange={() => setManualSearchId(null)}>
        <DialogContent className="max-w-3xl w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
          <div className="bg-gray-900 p-10 text-white shrink-0"><DialogHeader><Badge className="bg-[var(--puembo-green)] text-black border-none font-black text-[9px] uppercase tracking-[0.3em] mb-3 w-fit">Auditoría Manual</Badge><DialogTitle className="text-3xl font-serif font-bold leading-tight tracking-tight">Vincular Movimiento</DialogTitle><p className="text-gray-400 text-sm mt-2 font-medium">Asociando pago de <strong>{selectedManualSub?.submissionName || 'Inscrito'}</strong>.</p></DialogHeader></div>
          <div className="p-10 space-y-8 flex-1 overflow-hidden flex flex-col bg-white"><div className="relative group shrink-0"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Buscar..." className="pl-14 h-16 rounded-[1.5rem] bg-gray-50 border-gray-100 focus:bg-white shadow-inner text-base font-medium" value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} /></div><div className="flex-1 overflow-y-auto space-y-3 pr-3 scrollbar-thin">{bankTransactions.filter(bt => { const s = bankSearch.toLowerCase(); return bt.description?.toLowerCase().includes(s) || bt.amount?.toString().includes(s) || bt.reference?.toLowerCase().includes(s); }).map((bt) => (<div key={bt.id} className={cn("p-5 rounded-[1.5rem] border transition-all flex items-center justify-between gap-6", bt.is_reconciled ? "opacity-40 border-emerald-100 bg-emerald-50/10 cursor-not-allowed" : "border-gray-100 hover:border-[var(--puembo-green)] hover:bg-green-50/30 shadow-sm cursor-pointer hover:-translate-y-0.5")} onClick={() => !bt.is_reconciled && handleVerify(manualSearchId, bt.id)}><div className="flex flex-col min-w-0"><span className="font-bold text-gray-900 text-base truncate uppercase tracking-tight">{bt.description}</span><span className="text-[11px] text-gray-400 font-bold uppercase mt-1">{displayDate(bt.date)} • Ref: {bt.reference || 'N/A'}</span></div><div className="flex items-center gap-6 shrink-0"><span className="text-2xl font-black text-gray-900 font-serif">${bt.amount?.toFixed(2)}</span><ChevronRight className="w-6 h-6 text-gray-300" /></div></div>))}</div></div>
          <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0"><Button variant="ghost" onClick={() => setManualSearchId(null)} className="rounded-full px-10 h-14 font-black text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900">Cancelar</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingReceipt} onOpenChange={() => setViewingReceipt(null)}>
        <DialogContent className="max-w-4xl w-[95vw] rounded-[3.5rem] p-6 md:p-10 overflow-hidden border-none shadow-2xl bg-black/95 flex flex-col h-[90vh]">
          <DialogHeader className="sr-only"><DialogTitle>Visor de Comprobante</DialogTitle></DialogHeader>
          <div className="absolute top-8 right-8 z-50"><Button variant="ghost" size="icon" onClick={() => setViewingReceipt(null)} className="rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12"><X className="w-7 h-7" /></Button></div>
          <div className="flex flex-col flex-1 overflow-hidden">{viewingReceipt && (<div className="space-y-8 w-full text-center flex flex-col h-full"><div className="space-y-3 shrink-0"><h4 className="text-white font-serif font-bold text-3xl">{viewingReceipt.title}</h4><div className="flex flex-wrap justify-center gap-3 mt-2"><Badge variant="secondary" className="bg-white/10 text-white border-none uppercase tracking-[0.2em] text-[9px] font-black px-4 py-1.5 rounded-full backdrop-blur-md">Beneficiario: {viewingReceipt.aiData?.beneficiary_name || 'Alianza Puembo'}</Badge><Badge variant="secondary" className="bg-white/10 text-white border-none uppercase tracking-[0.2em] text-[9px] font-black px-4 py-1.5 rounded-full backdrop-blur-md font-mono">Cuenta: {viewingReceipt.aiData?.beneficiary_account || '***'}</Badge></div></div><div className="flex-1 min-h-0 w-full relative flex items-center justify-center p-4 bg-white/5 rounded-[2.5rem] border border-white/10"><img src={viewingReceipt.url} alt="Comprobante" className="max-w-full max-h-full object-contain" /></div></div>)}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}