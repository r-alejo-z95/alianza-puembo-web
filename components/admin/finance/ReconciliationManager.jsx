"use client";

import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  parseBankReport, 
  getGlobalTransactions, 
  analyzeFormReceipts 
} from "@/lib/actions/finance";
import { ReconciliationWorkbench } from "./ReconciliationWorkbench";

export function ReconciliationManager({ forms }) {
  const [bankTransactions, setBankTransactions] = useState([]);
  const [isUploadingBank, setIsUploadingBank] = useState(false);
  const [bankFile, setBankFile] = useState(null);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  useEffect(() => { loadGlobalLedger(); }, []);

  useEffect(() => {
    if (selectedFormId) loadFormData();
    else setSubmissions([]);
  }, [selectedFormId]);

  const loadGlobalLedger = async () => {
    const res = await getGlobalTransactions();
    if (res.transactions) setBankTransactions(res.transactions);
  };

  const loadFormData = async () => {
    if (!selectedFormId) return;
    setIsLoadingContext(true);
    try {
      const res = await analyzeFormReceipts(selectedFormId);
      if (res.submissions) setSubmissions(res.submissions);
    } catch (e) { console.error(e); } finally { setIsLoadingContext(false); }
  };

  const handleBankUpload = async () => {
    if (!bankFile) return;
    setIsUploadingBank(true);
    const formData = new FormData();
    formData.append("file", bankFile);
    try {
      const res = await parseBankReport(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Historial actualizado");
        await loadGlobalLedger();
        setBankFile(null);
      }
    } catch (e) { toast.error("Error al procesar"); } finally { setIsUploadingBank(false); }
  };

  const confirmedAmount = submissions
    .filter(s => s.financial_status === 'verified')
    .reduce((acc, curr) => acc + Number(curr.financial_data?.amount || 0), 0);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER CARD: CONSOLIDATED CONFIGURATION */}
      <Card className="border-none shadow-2xl bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* STEP 1: BANK INPUT (LEFT) */}
          <div className="flex-1 p-6 md:p-10 space-y-6 md:space-y-8 bg-gray-50/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-500">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Paso 1: Movimientos Diarios</span>
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 leading-tight">Alimentar Historial</h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-medium">Sincroniza el extracto bancario global.</p>
            </div>

            <div className="space-y-4">
              <div 
                className={cn(
                  "h-24 md:h-32 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all gap-2 px-4 md:px-6",
                  bankFile ? "border-[var(--puembo-green)] bg-[var(--puembo-green)]/5" : "border-gray-200 hover:border-blue-200 hover:bg-white"
                )}
                onClick={() => !bankFile && document.getElementById('bank-file-input').click()}
              >
                {bankFile ? (
                  <div className="flex flex-col items-center gap-1 text-center animate-in zoom-in-95">
                    <FileSpreadsheet className="w-6 h-6 md:w-8 md:h-8 text-[var(--puembo-green)]" />
                    <span className="text-[10px] md:text-xs font-bold text-gray-900 truncate max-w-[150px] md:max-w-[200px]">{bankFile.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setBankFile(null); }} className="text-[9px] font-black uppercase text-red-500 tracking-widest hover:underline">Cambiar</button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 md:w-8 md:h-8 text-gray-200" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Subir Excel o CSV</span>
                  </>
                )}
                <input id="bank-file-input" type="file" className="hidden" onChange={(e) => setBankFile(e.target.files[0])} />
              </div>

              {bankFile && (
                <Button 
                  onClick={handleBankUpload} 
                  disabled={isUploadingBank}
                  variant="green"
                  className="w-full h-12 md:h-14 rounded-full font-bold shadow-lg shadow-[var(--puembo-green)]/20 text-xs uppercase tracking-widest"
                >
                  {isUploadingBank ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Sincronizar
                </Button>
              )}
            </div>
          </div>

          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-100 to-transparent" />

          {/* STEP 2: CONTEXT SELECTOR (RIGHT) */}
          <div className="flex-1 p-6 md:p-10 space-y-6 md:space-y-8 bg-white relative">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--puembo-green)]" />
                <span>Paso 2: Actividad</span>
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 leading-tight">Auditar Registro</h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-medium">Elige el formulario que deseas validar.</p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                <SelectTrigger className="h-14 md:h-16 rounded-xl md:rounded-[1.5rem] border-gray-100 bg-gray-50/50 font-bold focus:ring-8 focus:ring-[var(--puembo-green)]/5 transition-all text-sm md:text-base">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                  {forms.map(f => <SelectItem key={f.id} value={f.id} className="py-3 md:py-4 cursor-pointer rounded-xl font-medium text-xs md:text-base">{f.title}</SelectItem>)}
                </SelectContent>
              </Select>

              {selectedFormId && (
                <div className="grid grid-cols-2 gap-3 md:gap-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-[1.5rem] border border-gray-100">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Inscritos</span>
                    <div className="flex items-center gap-2">
                      <Database className="w-3 h-3 text-gray-400" />
                      <span className="text-sm md:text-lg font-bold text-gray-900">{submissions.length}</span>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 bg-[var(--puembo-green)]/5 rounded-xl md:rounded-[1.5rem] border border-[var(--puembo-green)]/10">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[var(--puembo-green)] block mb-1">Recaudado</span>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3 h-3 text-[var(--puembo-green)]" />
                      <span className="text-sm md:text-lg font-black text-[var(--puembo-green)] font-serif">${confirmedAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </Card>

      <div className="w-full">
        <ReconciliationWorkbench 
          bankTransactions={bankTransactions} 
          submissions={submissions}
          onRefresh={loadFormData}
          isFormSelected={!!selectedFormId}
        />
      </div>

    </div>
  );
}