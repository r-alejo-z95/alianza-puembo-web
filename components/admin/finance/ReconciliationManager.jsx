"use client";

import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Loader2, 
  Banknote, 
  Sparkles, 
  Database,
  Tags,
  CheckCircle2,
  ArrowRight,
  Search,
  Wallet,
  ArrowUpRight,
  ShieldAlert,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getRevenueContribution } from "@/lib/finance/status";
import { 
  initBankReport,
  processBankChunk,
  finalizeBankReport,
  getGlobalTransactions, 
  analyzeFormReceipts 
} from "@/lib/actions/finance";
import { ReconciliationWorkbench } from "./ReconciliationWorkbench";

export function ReconciliationManager({ forms = [], bankAccounts = [] }) {
  const [bankTransactions, setBankTransactions] = useState([]);
  const [allBankTransactions, setAllBankTransactions] = useState([]);
  const [isUploadingBank, setIsUploadingBank] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [bankFile, setBankFile] = useState(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [discardedItems, setDiscardedItems] = useState([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const sortedBankAccounts = useMemo(
    () => [...bankAccounts].sort((a, b) => (a.bank_name || "").localeCompare(b.bank_name || "")),
    [bankAccounts],
  );

  const sortedForms = useMemo(
    () => [...forms].sort((a, b) => (a.title || "").localeCompare(b.title || "")),
    [forms],
  );

  const selectedBankAccount = useMemo(
    () => sortedBankAccounts.find((account) => account.id === selectedBankAccountId) || sortedBankAccounts[0] || null,
    [sortedBankAccounts, selectedBankAccountId],
  );

  const selectedForm = useMemo(
    () => sortedForms.find((form) => form.id === selectedFormId) || null,
    [sortedForms, selectedFormId],
  );

  const selectedDestinationAccount = useMemo(
    () =>
      selectedForm?.destination_account_id
        ? sortedBankAccounts.find((account) => account.id === selectedForm.destination_account_id) || null
        : null,
    [sortedBankAccounts, selectedForm],
  );

  useEffect(() => {
    loadGlobalLedger(selectedBankAccountId);
  }, [selectedBankAccountId]);

  useEffect(() => {
    loadAllBankLedger();
  }, []);

  useEffect(() => {
    if (!selectedBankAccountId && sortedBankAccounts.length > 0) {
      setSelectedBankAccountId(sortedBankAccounts[0].id);
    }
  }, [selectedBankAccountId, sortedBankAccounts]);

  useEffect(() => {
    if (selectedFormId) loadFormData();
    else {
      setSubmissions([]);
      setDiscardedItems([]);
    }
  }, [selectedFormId]);

  const loadGlobalLedger = async (accountId = selectedBankAccountId) => {
    const res = await getGlobalTransactions(accountId || null);
    if (res.transactions) setBankTransactions(res.transactions);
  };

  const loadAllBankLedger = async () => {
    const res = await getGlobalTransactions(null);
    if (res.transactions) setAllBankTransactions(res.transactions);
  };

  const loadFormData = async () => {
    if (!selectedFormId) return;
    setIsLoadingContext(true);
    try {
      const res = await analyzeFormReceipts(selectedFormId);
      if (res.submissions) setSubmissions(res.submissions);
      setDiscardedItems(res.discardedItems || []);
      await Promise.all([loadGlobalLedger(selectedBankAccountId), loadAllBankLedger()]);
    } catch (e) { console.error(e); } finally { setIsLoadingContext(false); }
  };

  const handleBankUpload = async () => {
    if (!bankFile) return;
    
    setIsUploadingBank(true);
    setUploadProgress(2);
    setUploadStatus("Leyendo archivo...");

    try {
      // 1. Read file on client to get chunks
      const buffer = await bankFile.arrayBuffer();
      const isCSV = bankFile.name.toLowerCase().endsWith('.csv');
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true, raw: isCSV });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const cleanRows = rawData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== "" && cell !== undefined));
      if (cleanRows.length < 2) throw new Error("Archivo sin datos legibles");

      const headers = cleanRows[0];
      const dataRows = cleanRows.slice(1);
      
      // 2. Initialize report
      setUploadStatus("Iniciando auditoría...");
      const reportLabel = selectedBankAccount
        ? `${selectedBankAccount.bank_name}${selectedBankAccount.account_number ? ` - ${selectedBankAccount.account_number}` : ""} · ${bankFile.name}`
        : bankFile.name;
      const { reportId, error: initErr } = await initBankReport(reportLabel, selectedBankAccount);
      if (initErr) throw new Error(initErr);

      // 3. Process in chunks
      const CHUNK_SIZE = 30; // Small chunks for better progress visibility
      const totalChunks = Math.ceil(dataRows.length / CHUNK_SIZE);
      
      for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
        const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
        const progress = Math.round((chunkIndex / totalChunks) * 90);
        
        setUploadProgress(progress);
        setUploadStatus(`Analizando bloque ${chunkIndex} de ${totalChunks}...`);
        
        const chunk = dataRows.slice(i, i + CHUNK_SIZE);
        const { success, error: chunkErr } = await processBankChunk(reportId, chunk, headers, selectedBankAccount);
        
        if (!success) console.warn(`Error en bloque ${chunkIndex}:`, chunkErr);
      }

      // 4. Finalize
      setUploadProgress(100);
      setUploadStatus("Sincronización completa");
      await finalizeBankReport();
      
      toast.success("Historial actualizado correctamente");
      await Promise.all([loadGlobalLedger(selectedBankAccountId), loadAllBankLedger()]);
      setBankFile(null);
      
      // Small delay to let the user see 100%
      setTimeout(() => setIsUploadingBank(false), 1000);

    } catch (e) { 
      toast.error(e.message || "Error al procesar"); 
      setIsUploadingBank(false);
    }
  };

  const confirmedAmount = submissions.reduce(
    (acc, sub) => acc + getRevenueContribution(sub),
    0,
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      
      {/* UPLOAD PROGRESS MODAL (BLOCKING) */}
      <Dialog open={isUploadingBank} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-[2rem] p-8 overflow-hidden" hideClose>
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <div 
              className="h-full bg-[var(--puembo-green)] transition-all duration-500" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="space-y-6 text-center pt-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--puembo-green)]/20 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-gray-50">
                  <Loader2 className="w-10 h-10 text-[var(--puembo-green)] animate-spin" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <DialogHeader>
                <DialogTitle className="text-xl font-serif font-bold text-gray-900 text-center">
                  {uploadStatus}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 font-medium px-4 text-center">
                  Estamos usando <span className="text-[var(--puembo-green)] font-bold italic underline decoration-2 underline-offset-4">Inteligencia Artificial</span> para auditar cada movimiento.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Progreso</span>
                <span className="text-sm font-black text-[var(--puembo-green)]">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-3" />
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3 text-left">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Importante</p>
                <p className="text-[10px] leading-relaxed text-amber-700 font-medium">
                  Por favor, <span className="font-bold">no cierres esta ventana</span> ni recargues la página. Interrumpir el proceso podría generar registros incompletos.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-xl bg-white rounded-[1.5rem] overflow-hidden">
        <div className="p-4 md:p-5 grid grid-cols-1 xl:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Cuenta bancaria</span>
            <Select value={selectedBankAccountId} onValueChange={setSelectedBankAccountId} disabled={sortedBankAccounts.length === 0}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50 font-bold text-xs">
                <SelectValue placeholder={sortedBankAccounts.length > 0 ? "Selecciona una cuenta" : "No hay cuentas activas"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                {sortedBankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id} className="py-3 cursor-pointer rounded-xl font-medium text-xs">
                    {account.bank_name}{account.account_number ? ` · ${account.account_number}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Formulario a conciliar</span>
            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50 font-bold text-xs">
                <SelectValue placeholder="Selecciona un formulario" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                {sortedForms.map(f => <SelectItem key={f.id} value={f.id} className="py-3 cursor-pointer rounded-xl font-medium text-xs">{f.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row xl:flex-col gap-2">
            <button
              type="button"
              className={cn(
                "h-11 min-w-52 rounded-xl border border-dashed px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                bankFile ? "border-[var(--puembo-green)] bg-[var(--puembo-green)]/5 text-[var(--puembo-green)]" : "border-gray-200 text-gray-400 hover:bg-gray-50"
              )}
              onClick={() => !bankFile && document.getElementById('bank-file-input').click()}
            >
              {bankFile ? <FileSpreadsheet className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
              <span className="truncate max-w-40">{bankFile ? bankFile.name : "Subir extracto"}</span>
              <input id="bank-file-input" type="file" className="hidden" onChange={(e) => setBankFile(e.target.files[0])} />
            </button>
            {bankFile && (
              <Button 
                onClick={handleBankUpload} 
                disabled={isUploadingBank || !selectedBankAccount}
                variant="green"
                className="h-11 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2"
              >
                {isUploadingBank ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                Sincronizar
              </Button>
            )}
          </div>
        </div>

        {selectedFormId && (
          <div className="border-t border-gray-100 px-4 md:px-5 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/50">
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Inscritos</span>
              <p className="text-lg font-black text-gray-900">{submissions.length}</p>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Pendientes</span>
              <p className="text-lg font-black text-amber-600">{submissions.reduce((acc, sub) => acc + (sub.form_submission_payments || []).filter((p) => p.status !== "verified" && !p.manual_disposition).length, 0)}</p>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Movimientos libres</span>
              <p className="text-lg font-black text-blue-600">{bankTransactions.filter((bt) => !bt.is_reconciled).length}</p>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Recaudado</span>
              <p className="text-lg font-black text-[var(--puembo-green)] font-serif">${confirmedAmount.toFixed(2)}</p>
            </div>
          </div>
        )}
      </Card>

      <div className="w-full">
      <ReconciliationWorkbench 
        bankTransactions={bankTransactions} 
        submissions={submissions}
        discardedItems={discardedItems}
        onRefresh={loadFormData}
        isFormSelected={!!selectedFormId}
        selectedFormId={selectedFormId}
        selectedFormTitle={selectedForm?.title || ""}
        selectedBankAccount={selectedBankAccount}
        bankAccounts={sortedBankAccounts}
        bankTransactionsForExport={allBankTransactions}
        selectedDestinationAccount={selectedDestinationAccount}
      />
      </div>

    </div>
  );
}
