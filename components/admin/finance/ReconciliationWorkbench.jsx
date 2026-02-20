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
  ArrowRight, 
  Search,
  Receipt,
  Eye,
  X,
  Loader2,
  Banknote,
  Sparkles,
  User,
  CalendarDays,
  ShieldAlert,
  ChevronRight,
  Filter,
  Database,
  ArrowUpDown,
  Coins,
  History,
  CreditCard,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, addDays, subDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { reconcilePayment, getReceiptSignedUrl } from "@/lib/actions/finance";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Advanced name finder: strictly filters out numbers, emails, and meta-data.
 */
function findNameInSubmission(data) {
  if (!data) return null;
  
  const allKeys = Object.keys(data);
  const cleanEntries = allKeys.map(k => ({
    key: k,
    cleanKey: k.toLowerCase().replace(/_/g, ' ').replace(/[^a-z0-9 ]/g, '').trim(),
    value: String(data[k] || '').trim()
  })).filter(e => e.value.length > 2);

  const isLikelyName = (val) => {
    if (!val || val.includes('@') || val.includes('http')) return false;
    const digits = val.replace(/\D/g, '');
    if (digits.length > val.length * 0.5) return false;
    return val.split(' ').length >= 1; 
  };

  const identityPatterns = ["nombre completo", "nombres y apellidos", "nombre del participante", "nombre del inscrito", "participante", "inscrito", "full name"];
  for (const p of identityPatterns) {
    const found = cleanEntries.find(e => (e.cleanKey === p || e.cleanKey.includes(p)) && isLikelyName(e.value));
    if (found) return found.value;
  }

  const genericFound = cleanEntries.find(e => 
    e.cleanKey.includes("nombre") && 
    !["emergencia", "contacto", "padre", "madre", "representante", "cedula", "email", "banco", "oficina"].some(noise => e.cleanKey.includes(noise)) &&
    isLikelyName(e.value)
  );

  return genericFound ? genericFound.value : "No identificado";
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
  const [manualMatch, setManualMatch] = useState(null); // { paymentId, submission }
  const [bankSearch, setBankSearch] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [pageSize, setPageSize] = useState("25");
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [bankStatusFilter, setBankStatusFilter] = useState('all'); 
  const [processingIds, setProcessingIds] = useState(new Set());

  const usedTransactionIds = useMemo(() => {
    const ids = new Set(bankTransactions.filter(bt => bt.is_reconciled).map(bt => bt.id));
    submissions.forEach(sub => {
      if (sub.form_submission_payments) {
        sub.form_submission_payments.forEach(pay => {
          if (pay.status === 'verified' && pay.bank_transaction_id) {
            ids.add(pay.bank_transaction_id);
          }
        });
      }
    });
    return ids;
  }, [bankTransactions, submissions]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleViewReceipt = async (payment, submissionName) => {
    if (!payment.receipt_path) return toast.error("Sin imagen");
    setIsLoadingImage(true);
    try {
      const res = await getReceiptSignedUrl(payment.receipt_path);
      if (res.url) setViewingReceipt({ url: res.url, title: submissionName || 'Comprobante', aiData: payment.extracted_data });
    } catch (e) { toast.error("Error"); } finally { setIsLoadingImage(false); }
  };

  const filteredAndSortedBank = useMemo(() => {
    let list = [...bankTransactions];
    if (bankStatusFilter === 'available') list = list.filter(bt => !bt.is_reconciled);
    else if (bankStatusFilter === 'reconciled') list = list.filter(bt => bt.is_reconciled);

    if (bankSearch) {
      const s = bankSearch.toLowerCase();
      list = list.filter(bt => bt.description?.toLowerCase().includes(s) || bt.amount?.toString().includes(s) || bt.reference?.toLowerCase().includes(s));
    }

    list.sort((a, b) => {
      const aVal = a[sortConfig.key]; const bVal = b[sortConfig.key];
      if (sortConfig.key === 'amount') return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      if (sortConfig.key === 'date') return sortConfig.direction === 'asc' ? new Date(aVal).getTime() - new Date(bVal).getTime() : new Date(bVal).getTime() - new Date(aVal).getTime();
      return sortConfig.direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return list;
  }, [bankTransactions, bankSearch, sortConfig, bankStatusFilter]);

  const stats = useMemo(() => {
    return {
      totalAmount: filteredAndSortedBank.reduce((acc, curr) => acc + curr.amount, 0),
      availableCount: filteredAndSortedBank.filter(bt => !bt.is_reconciled).length,
      reconciledCount: filteredAndSortedBank.filter(bt => bt.is_reconciled).length,
      availableAmount: filteredAndSortedBank.filter(bt => !bt.is_reconciled).reduce((acc, curr) => acc + curr.amount, 0)
    };
  }, [filteredAndSortedBank]);

  // Transformar sumisiones en una lista de abonos para conciliar
  const reconcilablePayments = useMemo(() => {
    const list = [];
    submissions.forEach(sub => {
        const subName = findNameInSubmission(sub.data);
        const payments = sub.form_submission_payments || [];
        
        const subTotalVerified = payments
            .filter(p => p.status === 'verified')
            .reduce((acc, p) => acc + Number(p.extracted_data?.amount || 0), 0);
            
        const subTotalClaimed = payments
            .reduce((acc, p) => acc + Number(p.extracted_data?.amount || 0), 0);

        payments.forEach((pay, pIdx) => {
            const aiData = pay.extracted_data || {};
            const amount = Number(aiData.amount || 0);
            const dateStr = aiData.date;
            const ref = aiData.reference;
            const senderName = aiData.sender_name;

            let match = null;
            let matchType = null;
            let matchPriority = 200;
            const suggestions = [];

            if (pay.status === 'verified' && pay.bank_transaction_id) {
                match = bankTransactions.find(bt => bt.id === pay.bank_transaction_id);
                matchType = 'verified';
                matchPriority = -1;
            } else {
                const availableBankRows = bankTransactions.filter(bt => !usedTransactionIds.has(bt.id));
                availableBankRows.forEach(bt => {
                    let score = 0;
                    const refMatch = ref && bt.reference && String(bt.reference).toLowerCase().includes(String(ref).toLowerCase().trim());
                    const amountMatch = Math.abs(bt.amount - amount) < 0.01;
                    const dateMatch = dateStr && isSameDay(parseISO(bt.date), parseISO(dateStr));
                    const senderMatch = senderName && bt.description?.toLowerCase().includes(senderName.toLowerCase().trim());

                    if (refMatch && amountMatch) score = 100;
                    else if (refMatch) score = 95; 
                    else if (senderMatch && amountMatch && dateMatch) score = 90;
                    else if (amountMatch && dateMatch) score = 85;
                    else if (amountMatch && dateStr && (isSameDay(parseISO(bt.date), addDays(parseISO(dateStr), 1)) || isSameDay(parseISO(bt.date), subDays(parseISO(dateStr), 1)))) score = 60;

                    if (score > 0) suggestions.push({ ...bt, score, matchType: score >= 95 ? 'perfect' : score >= 85 ? 'high' : 'medium' });
                });
                suggestions.sort((a, b) => b.score - a.score);
                match = suggestions[0];
                matchType = match?.matchType;
                matchPriority = match ? (100 - match.score) : 200;
            }

            list.push({
                ...pay,
                submission: sub,
                submissionName: subName,
                paymentIndex: pIdx + 1,
                totalPayments: payments.length,
                subTotalVerified,
                subTotalClaimed,
                match,
                matchType,
                matchPriority,
                suggestions
            });
        });
    });
    return list;
  }, [bankTransactions, submissions, usedTransactionIds]);

  const pendingItems = useMemo(() => reconcilablePayments.filter(p => p.status !== 'verified' && !processingIds.has(p.id)).sort((a, b) => a.matchPriority - b.matchPriority), [reconcilablePayments, processingIds]);
  const verifiedItems = useMemo(() => reconcilablePayments.filter(p => p.status === 'verified'), [reconcilablePayments]);

  const handleVerify = async (paymentId, transactionId) => {
    setProcessingIds(prev => new Set(prev).add(paymentId));
    try {
      const res = await reconcilePayment(paymentId, transactionId);
      if (res.success) { 
        toast.success("Abono conciliado"); 
        await onRefresh(); 
        setManualMatch(null); 
        setModalSearch(""); 
      } else { 
        toast.error("Error al validar"); 
        setProcessingIds(prev => { const next = new Set(prev); next.delete(paymentId); return next; }); 
      }
    } catch (e) { 
        setProcessingIds(prev => { const next = new Set(prev); next.delete(paymentId); return next; }); 
    }
  };

  const renderPaymentItem = (item) => (
    <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 50, scale: 0.95 }}>
      <Card className={cn("border-none shadow-lg overflow-hidden transition-all hover:shadow-xl mb-4 rounded-[1.5rem]", item.status === 'verified' ? "ring-1 ring-[var(--puembo-green)] bg-emerald-50/10" : "bg-white")}>
        <div className="flex flex-col lg:flex-row">
          <div className="flex-[1.2] p-5 md:p-8 space-y-4 border-r border-gray-50 bg-white">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-50 text-blue-600 border-none rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Inscrito</Badge>
                  <Badge variant="outline" className="text-gray-400 border-gray-100 rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Abono {item.paymentIndex}/{item.totalPayments}</Badge>
                  {item.extracted_data?.is_correct_beneficiary === false && (
                    <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 border font-bold text-[8px] gap-1 px-2 py-0 h-4 rounded-full uppercase tracking-wider">
                      <ShieldAlert className="w-3 h-3" /> Beneficiario no coincide
                    </Badge>
                  )}
                </div>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{item.submissionName}</h4>
                
                <div className="pt-1 flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Monto IA: <span className="text-blue-600">${item.subTotalClaimed.toFixed(2)}</span></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Verificado: <span className="text-emerald-600">${item.subTotalVerified.toFixed(2)}</span></span>
                </div>
                
                <div className="pt-3 space-y-2">
                  <div>
                    <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest leading-none mb-1">Titular Pago (según recibo):</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 uppercase tracking-tight">
                      <CreditCard className="w-3.5 h-3.5 text-[var(--puembo-green)]" /> {item.extracted_data?.sender_name || "No identificado"}
                    </span>
                  </div>
                </div>
              </div>
              {item.status === 'verified' && <div className="w-8 h-8 rounded-full bg-[var(--puembo-green)] text-white flex items-center justify-center shadow-md animate-in zoom-in"><CheckCircle2 className="w-5 h-5" /></div>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><span className="text-[8px] font-black uppercase text-gray-400 block mb-0.5">Monto en Recibo</span><span className="text-xl font-black text-gray-900 font-serif">${Number(item.extracted_data?.amount || 0).toFixed(2)}</span></div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><span className="text-[8px] font-black uppercase text-gray-400 block mb-0.5">Fecha Recibo</span><span className="text-xs font-bold text-gray-700">{displayDate(item.extracted_data?.date)}</span></div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><span className="text-[8px] font-black uppercase text-gray-400 block mb-0.5">Abono Creado</span><span className="text-xs font-bold text-gray-700">{displayDate(item.created_at)}</span></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">REF: <span className="text-gray-900">{item.extracted_data?.reference || 'N/A'}</span></div>
              <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-[9px] font-black uppercase tracking-widest gap-1.5 text-[var(--puembo-green)] hover:bg-green-50" onClick={() => handleViewReceipt(item, item.submissionName)}><Eye className="w-3.5 h-3.5" /> Ver Foto</Button>
            </div>
          </div>

          <div className="lg:w-16 flex items-center justify-center py-4 lg:py-0 bg-gray-50/30 relative">
            <div className="h-px w-full bg-gray-100 absolute top-1/2 left-0 -z-10 hidden lg:block" />
            {item.match ? <div className={cn("w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg ring-4 z-10", item.matchType === 'perfect' ? "text-emerald-600 ring-emerald-100" : "text-amber-500 ring-amber-100")}><ArrowRight className="w-5 h-5" /></div> : <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-400 shadow-lg ring-4 ring-orange-100 z-10"><AlertCircle className="w-6 h-6" /></div>}
          </div>

          <div className={cn("flex-1 p-5 md:p-8 space-y-4", item.match ? "bg-emerald-50/5" : "bg-orange-50/5")}>
            {item.match ? (
              <div className="space-y-4">
                <div>
                  {item.matchType === 'perfect' ? (
                    <span className="text-[9px] font-black uppercase text-emerald-600 block mb-1 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Match Perfecto</span>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-amber-600 block mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Sugerencia IA (Por Verificar)</span>
                  )}
                  <h4 className="font-bold text-gray-900 text-base uppercase leading-tight mb-2">{item.match.description}</h4>
                  <div className="flex gap-4"><span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-tighter"><CalendarDays className="w-3.5 h-3.5" /> {displayDate(item.match.date)}</span><span className="flex items-center gap-1 text-[10px] text-[var(--puembo-green)] font-black uppercase tracking-tighter"><Receipt className="w-3.5 h-3.5" /> {item.match.reference || 'N/A'}</span></div>
                </div>
                <p className="text-2xl font-serif font-black text-[var(--puembo-green)]">+ ${item.match.amount.toFixed(2)}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="green" className="flex-1 rounded-full h-10 font-black text-[10px] uppercase tracking-widest shadow-lg" onClick={() => handleVerify(item.id, item.match.id)} disabled={item.status === 'verified'}>{item.status === 'verified' ? '¡Conciliado!' : 'Conciliar con esta'}</Button>
                  {item.status !== 'verified' && <Button onClick={() => setManualMatch(item)} variant="outline" className="flex-1 rounded-full h-10 text-[9px] font-black uppercase tracking-widest gap-2"><Search className="w-3 h-3" /> Buscar otro...</Button>}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center h-full space-y-3 py-2">
                {!item.extracted_data || Object.keys(item.extracted_data).length === 0 ? (
                    <p className="text-xs font-medium text-orange-600 italic">Procesando imagen con IA...</p>
                ) : (
                    <p className="text-xs font-medium text-orange-600 italic">No hay coincidencias automáticas.</p>
                )}
                <Button onClick={() => setManualMatch(item)} variant="outline" className="w-full rounded-full h-10 text-[9px] font-black uppercase tracking-widest border-orange-200 text-orange-600 hover:bg-orange-50"><Search className="w-3.5 h-3.5 mr-2" /> Búsqueda Manual</Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* 1. BANK LEDGER */}
      <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 md:p-8 bg-gray-900 text-white space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[var(--puembo-green)] flex items-center justify-center text-black shadow-lg"><Banknote className="w-6 h-6" /></div>
              <div><CardTitle className="text-xl md:text-2xl font-serif font-bold tracking-tight">Extracto Bancario</CardTitle><p className="text-gray-400 text-[9px] uppercase font-black tracking-[0.3em] mt-0.5">Pool de Ingresos Históricos</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 shrink-0">
                {['all', 'available', 'reconciled'].map(s => (
                  <Button key={s} variant="ghost" size="sm" className={cn("h-7 rounded-full px-3 text-[8px] font-black uppercase tracking-widest transition-all", bankStatusFilter === s ? "bg-white text-black hover:bg-white" : "text-gray-400 hover:text-white")} onClick={() => setBankStatusFilter(s)}>{s === 'all' ? 'Todos' : s === 'available' ? 'Libres' : 'Listos'}</Button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shrink-0"><Filter className="w-3 h-3 text-gray-500" /><Select value={pageSize} onValueChange={setPageSize}><SelectTrigger className="h-5 w-24 bg-transparent border-none text-white font-black text-[9px] p-0 focus:ring-0 uppercase tracking-widest"><SelectValue /></SelectTrigger><SelectContent className="bg-gray-900 text-white border-white/10"><SelectItem value="25">Ver 25</SelectItem><SelectItem value="50">Ver 50</SelectItem><SelectItem value="100">Ver 100</SelectItem><SelectItem value="9999">Ver Todos</SelectItem></SelectContent></Select></div>
              <div className="relative w-full sm:w-64 group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Filtrar movimientos..." className="pl-10 h-10 bg-white/10 border-white/5 text-xs rounded-xl focus:bg-white/20 transition-all text-white placeholder:text-gray-600 focus:ring-0 shadow-inner" value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Visible', val: `$${stats.totalAmount.toFixed(2)}`, icon: Coins, color: 'text-[var(--puembo-green)]' },
              { label: 'Disponible', val: `$${stats.availableAmount.toFixed(2)}`, icon: History, color: 'text-amber-500' },
              { label: 'Libres', val: stats.availableCount, icon: Database, color: 'text-blue-500' },
              { label: 'Conciliados', val: stats.reconciledCount, icon: CheckCircle2, color: 'text-emerald-500' }
            ].map((st, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3 backdrop-blur-sm">
                <div className={cn("p-2 rounded-lg bg-black/40", st.color)}><st.icon className="w-3.5 h-3.5" /></div>
                <div><span className="text-[7px] font-black uppercase text-gray-500 block leading-none mb-1">{st.label}</span><span className="text-sm font-black font-serif block">{st.val}</span></div>
              </div>
            ))}
          </div>
        </CardHeader>
        <div className="max-h-[450px] overflow-y-auto scrollbar-none bg-gray-50/30">
          <Table>
            <TableHeader className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md shadow-sm">
              <TableRow className="border-b border-gray-100">
                <TableHead onClick={() => handleSort('date')} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center cursor-pointer hover:text-gray-900 transition-colors w-[120px]"><div className="flex items-center justify-center gap-1.5">Fecha <ArrowUpDown className="w-2.5 h-2.5" /></div></TableHead>
                <TableHead onClick={() => handleSort('description')} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-gray-900 transition-colors"><div className="flex items-center gap-1.5">Descripción / Origen <ArrowUpDown className="w-2.5 h-2.5" /></div></TableHead>
                <TableHead onClick={() => handleSort('amount')} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right cursor-pointer hover:text-gray-900 transition-colors w-[120px]"><div className="flex items-center justify-end gap-1.5">Monto <ArrowUpDown className="w-2.5 h-2.5" /></div></TableHead>
                <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center w-[120px]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredAndSortedBank.slice(0, parseInt(pageSize)).map((bt) => (
                  <TableRow key={bt.id} className={cn("border-b border-gray-50 transition-all bg-white", bt.is_reconciled ? "opacity-50 grayscale-[0.5]" : "hover:bg-gray-50")}>
                    <TableCell className="px-6 py-3 font-bold text-gray-500 text-[10px] text-center">{format(parseISO(bt.date), "dd/MM/yy")}</TableCell>
                    <TableCell className="px-6 py-3 min-w-[200px]"><div className="flex flex-col"><span className="text-[10px] font-bold text-gray-900 uppercase truncate max-w-[250px] leading-tight">{bt.description}</span><span className="text-[8px] font-black text-emerald-600 font-mono tracking-tighter mt-0.5">REF: {bt.reference || '-'}</span></div></TableCell>
                    <TableCell className="px-6 py-3 text-right font-black text-gray-900 text-sm font-serif tracking-tight">${bt.amount?.toFixed(2)}</TableCell>
                    <TableCell className="px-6 py-3 text-center">{bt.is_reconciled ? <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full text-[8px] font-black px-3 py-0.5">Conciliado</Badge> : <Badge variant="outline" className="text-amber-500 border-amber-200 rounded-full text-[8px] font-black px-3 py-0.5">Libre</Badge>}</TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          {filteredAndSortedBank.length === 0 && <div className="py-20 text-center text-gray-400 italic text-xs">No se encontraron movimientos en el pool bancario.</div>}
        </div>
      </Card>

      {/* 2. AUDIT SECTION */}
      {isFormSelected ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
            <TabsList className="bg-gray-100/80 p-1 rounded-full h-auto self-start border border-gray-200/50 backdrop-blur-sm">
              <TabsTrigger value="pending" className="rounded-full py-2 px-8 font-bold text-[10px] uppercase tracking-widest gap-2">Abonos Pendientes <Badge variant="secondary" className="rounded-full px-2 py-0 h-4 text-[9px] bg-amber-100 text-amber-700 border-none">{pendingItems.length}</Badge></TabsTrigger>
              <TabsTrigger value="verified" className="rounded-full py-2 px-8 font-bold text-[10px] uppercase tracking-widest gap-2">Conciliados <Badge variant="secondary" className="rounded-full px-2 py-0 h-4 text-[9px] bg-emerald-100 text-emerald-700 border-none">{verifiedItems.length}</Badge></TabsTrigger>
            </TabsList>
            <div className="relative group w-full sm:w-80"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-[var(--puembo-green)]" /><Input placeholder="Filtrar por nombre..." className="pl-11 h-11 rounded-full bg-white border-gray-100 text-xs shadow-sm focus:ring-4 focus:ring-green-500/5 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </div>
          <TabsContent value="pending" className="outline-none space-y-4">
            <AnimatePresence mode="popLayout">
              {pendingItems.filter(item => { const s = searchTerm.toLowerCase(); return (item.submissionName || "").toLowerCase().includes(s); }).map(item => renderPaymentItem(item))}
            </AnimatePresence>
            {pendingItems.length === 0 && (<div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-100 shadow-inner"><CheckCircle2 className="w-12 h-12 text-[var(--puembo-green)]/30 mx-auto mb-6" /><h4 className="text-2xl font-serif font-bold text-gray-400">¡Conciliación al Día!</h4><p className="text-gray-300 text-[10px] uppercase tracking-widest font-black mt-2">No hay pagos pendientes por auditar</p></div>)}
          </TabsContent>
          <TabsContent value="verified" className="outline-none space-y-4"><AnimatePresence mode="popLayout">{verifiedItems.map(item => renderPaymentItem(item))}</AnimatePresence></TabsContent>
        </Tabs>
      ) : (
        <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-50 shadow-inner flex flex-col items-center justify-center"><Database className="w-14 h-14 text-gray-200 mb-6" /><h4 className="text-2xl font-serif font-bold text-gray-400">Paso 2: Auditar Actividad</h4><p className="text-gray-300 text-[10px] uppercase tracking-[0.3em] font-black mt-3">Selecciona un formulario financiero arriba para comenzar</p></div>
      )}

      {/* 3. MANUAL AUDIT MODAL */}
      <Dialog open={!!manualMatch} onOpenChange={() => { setManualMatch(null); setModalSearch(""); }}>
        <DialogContent className="max-w-6xl w-[98vw] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[96vh]">
          <div className="bg-gray-900 px-8 py-5 text-white shrink-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                     <Badge className="bg-[var(--puembo-green)] text-black border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full">Auditoría Manual</Badge>
                  </div>
                  <DialogTitle className="text-xl md:text-2xl font-serif font-bold leading-tight truncate">Vincular Movimiento Bancario</DialogTitle>
                </div>
                <div className="text-right shrink-0">
                   <span className="text-[7px] font-black uppercase text-gray-500 block mb-0.5 leading-none tracking-tighter">Monto a Conciliar</span>
                   <span className="text-lg md:text-xl font-black font-serif text-[var(--puembo-green)] leading-none">${Number(manualMatch?.extracted_data?.amount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3 h-3 text-blue-400 shrink-0" />
                    <p className="text-gray-400 text-xs font-medium truncate">
                      Inscrito: <span className="text-white font-bold">{manualMatch?.submissionName}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] font-black uppercase text-gray-500 leading-none tracking-tighter">Comprobante</span>
                    <span className="text-[10px] font-bold text-gray-300 leading-tight">{displayDate(manualMatch?.extracted_data?.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 flex-1 overflow-hidden flex flex-col bg-gray-50/50">
            <div className="relative group shrink-0">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <Input 
                 placeholder="Filtrar movimientos bancarios..." 
                 className="pl-11 h-11 rounded-lg bg-white border-gray-100 shadow-sm focus:ring-8 focus:ring-green-500/5 text-sm font-medium transition-all" 
                 value={modalSearch} 
                 onChange={(e) => setModalSearch(e.target.value)} 
               />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-none space-y-6">
              {/* SMART SUGGESTIONS */}
              {manualMatch?.suggestions?.length > 0 && !modalSearch && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--puembo-green)] px-1"><Zap className="w-3 h-3 fill-current animate-pulse" /> Sugerencias Inteligentes</div>
                  <div className="grid grid-cols-1 gap-2">
                    {manualMatch.suggestions.map(bt => (
                      <motion.div key={`sug-${bt.id}`} whileHover={{ x: 3 }} className="p-3.5 rounded-xl border-2 border-[var(--puembo-green)]/20 bg-green-50/30 flex items-center justify-between gap-4 cursor-pointer hover:bg-green-50 transition-all shadow-sm" onClick={() => handleVerify(manualMatch.id, bt.id)}>
                        <div className="flex gap-4 items-center min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[var(--puembo-green)] text-black flex items-center justify-center shrink-0 shadow-sm"><Sparkles className="w-4 h-4" /></div>
                          <div className="min-w-0 flex flex-col">
                            <span className="font-bold text-gray-900 text-[10px] md:text-[11px] block uppercase leading-tight break-words">{bt.description}</span>
                            <div className="flex gap-3 text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1"><span>{displayDate(bt.date)}</span><span>REF: {bt.reference || '-'}</span></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-lg font-black text-gray-900 font-serif">${bt.amount.toFixed(2)}</span>
                          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0"><ChevronRight className="w-4 h-4" /></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ALL MOVEMENTS */}
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Banco Completo</div>
                <div className="grid grid-cols-1 gap-2">
                  {bankTransactions.filter(bt => !usedTransactionIds.has(bt.id) && (!modalSearch || bt.description?.toLowerCase().includes(modalSearch.toLowerCase()) || bt.reference?.toLowerCase().includes(modalSearch.toLowerCase()) || bt.amount?.toString().includes(modalSearch))).map((bt) => (
                    <motion.div key={bt.id} whileHover={{ x: 3 }} className="p-3.5 rounded-xl border border-gray-100 bg-white flex items-center justify-between gap-4 cursor-pointer hover:border-gray-900 hover:shadow-sm transition-all group" onClick={() => handleVerify(manualMatch.id, bt.id)}>
                       <div className="flex gap-4 items-center min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center shrink-0 transition-colors"><Banknote className="w-4 h-4" /></div>
                          <div className="min-w-0 flex flex-col">
                            <span className="font-bold text-gray-900 text-[10px] md:text-[11px] block uppercase leading-tight break-words">{bt.description}</span>
                            <div className="flex gap-3 text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1"><span>{displayDate(bt.date)}</span><span>REF: {bt.reference || '-'}</span></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-lg font-black text-gray-900 font-serif">${bt.amount.toFixed(2)}</span>
                          <div className="w-7 h-7 rounded-full bg-gray-50 text-gray-300 group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center shrink-0"><ChevronRight className="w-4 h-4" /></div>
                        </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="py-3 px-8 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hidden sm:block italic">Haz clic en un movimiento para confirmar la vinculación.</p>
             <Button variant="ghost" onClick={() => { setManualMatch(null); setModalSearch(""); }} className="rounded-full px-8 h-10 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all ml-auto">Cancelar Búsqueda</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. RECEIPT VIEWER */}
      <Dialog open={!!viewingReceipt} onOpenChange={() => setViewingReceipt(null)}>
        <DialogContent className="max-w-4xl w-[95vw] rounded-[2rem] p-6 md:p-8 overflow-hidden border-none shadow-2xl bg-black/95 flex flex-col h-[90vh]">
          <DialogTitle className="sr-only">Visor de Comprobante</DialogTitle>
          <div className="absolute top-6 right-6 z-50"><Button variant="ghost" size="icon" onClick={() => setViewingReceipt(null)} className="rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12 transition-all"><X className="w-6 h-6" /></Button></div>
          <div className="flex flex-col flex-1 overflow-hidden">
            {viewingReceipt && (
              <div className="space-y-6 w-full text-center flex flex-col h-full">
                <div className="space-y-2 shrink-0 pt-8">
                  <h4 className="text-white font-serif font-bold text-2xl md:text-3xl">{viewingReceipt.title}</h4>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    <Badge variant="secondary" className="bg-white/10 text-white border-none uppercase tracking-[0.2em] text-[9px] font-black px-4 py-1.5 rounded-full backdrop-blur-md">Beneficiario: {viewingReceipt.aiData?.beneficiary_name || 'Iglesia Alianza Puembo'}</Badge>
                    <Badge variant="secondary" className="bg-white/10 text-white border-none uppercase tracking-[0.2em] text-[9px] font-black px-4 py-1.5 rounded-full backdrop-blur-md font-mono">Cuenta: {viewingReceipt.aiData?.beneficiary_account || '***'}</Badge>
                  </div>
                </div>
                <div className="flex-1 min-h-0 w-full relative flex items-center justify-center p-4 bg-white/5 rounded-3xl border border-white/10">
                  <img src={viewingReceipt.url} alt="Recibo bancario" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
