"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  History,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadReceipt } from "@/lib/actions";
import { addMultipartPayment, getReceiptSignedUrl } from "@/lib/actions/finance";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/image-compression";
import { get } from "react-hook-form";

function findNameInSubmission(data) {
  if (!data) return "Inscrito";
  
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

  return genericFound ? genericFound.value : "Inscrito";
}

export default function TrackingClient({ submission }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const form = submission.forms;
  const payments = submission.form_submission_payments || [];
  
  const totalVerified = payments
    .filter(p => p.status === 'verified')
    .reduce((acc, p) => acc + Number(p.extracted_data?.amount || p.amount_claimed || 0), 0);

  const totalPending = payments
    .filter(p => p.status !== 'verified' && p.status !== 'rejected')
    .reduce((acc, p) => acc + Number(p.extracted_data?.amount || p.amount_claimed || 0), 0);

  // Status config
  const statusConfig = {
    verified: { label: "Verificado", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    pending: { label: "Pendiente de Validación", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    manual_review: { label: "Requiere Revisión", icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    rejected: { label: "Rechazado", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    submitted: { label: "Enviado", icon: Clock, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100" }
  };

  let aggregatedStatus = 'submitted';
  if (payments.length > 0) {
    if (payments.some(p => p.status === 'manual_review')) {
      aggregatedStatus = 'manual_review';
    } else if (payments.some(p => p.status === 'pending')) {
      aggregatedStatus = 'pending';
    } else if (payments.every(p => p.status === 'verified')) {
      aggregatedStatus = 'verified';
    }
  }
  const currentStatus = statusConfig[aggregatedStatus];

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Comprimir la imagen antes de subirla
      const fileToUpload = await compressImage(selectedFile);

      // 1. Subir al storage
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("formSlug", form.slug);

      const uploadRes = await uploadReceipt(formData);
      if (!uploadRes.success) throw new Error(uploadRes.error);

      // 2. Registrar abono
      const paymentRes = await addMultipartPayment({
        submissionId: submission.id,
        accessToken: submission.access_token,
        receiptPath: uploadRes.fullPath,
        amountClaimed: 0
      });

      if (paymentRes.success) {
        toast.success("Comprobante subido correctamente. Nuestro equipo lo validará pronto.");
        setSelectedFile(null);
      } else {
        throw new Error(paymentRes.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Error al subir el comprobante");
    } finally {
      setIsUploading(false);
    }
  };

  const viewReceipt = async (path) => {
    const res = await getReceiptSignedUrl(path);
    if (res.url) {
      window.open(res.url, '_blank');
    } else {
      toast.error("No se pudo obtener el enlace del recibo");
    }
  };

  // Intentar encontrar el nombre del inscrito en los datos del formulario
  const getSubmissionName = () => {
    return findNameInSubmission(submission.data);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 space-y-8">
      {/* Header & Logo */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <Link href="/">
            <Image src="/brand/logo-puembo.png" width={180} height={60} alt="Logo" className="h-12 w-auto mb-4" />
        </Link>
        <h1 className="text-3xl md:text-4xl font-black font-serif text-gray-900 leading-tight">
          Seguimiento de Inscripción
        </h1>
        <p className="text-gray-500 font-medium max-w-lg">
          Consulta el estado de tu registro para <strong>{form?.title}</strong> y gestiona tus comprobantes de pago.
        </p>
      </div>

      {/* Main Status Card */}
      <Card className="overflow-hidden border-none shadow-xl bg-white rounded-[2rem]">
        <div className={cn("p-8 md:p-12 text-center space-y-6", currentStatus.bg)}>
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg bg-white", currentStatus.color)}>
                <currentStatus.icon className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <Badge variant="outline" className={cn("px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px] border-2", currentStatus.color, "border-current bg-white")}>
                    {currentStatus.label}
                </Badge>
                <h2 className="text-2xl font-black text-gray-900">
                    {getSubmissionName()}
                </h2>
                <p className="text-gray-500 text-sm font-medium">
                    Inscripción realizada el {format(new Date(submission.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
            </div>
        </div>
        
        <CardContent className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Seguridad</span>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Este portal es privado. Guarda tu código de seguimiento o el enlace que recibiste por correo para volver a consultar tu estado.
                    </p>
                    <div className="mt-4 p-3 bg-white rounded-xl border border-dashed border-gray-200 text-center">
                        <code className="text-lg font-black tracking-widest text-[var(--puembo-green)]">
                            {submission.access_token}
                        </code>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Resumen de Pago</span>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-bold text-gray-600">Total Abonos ({payments.length})</span>
                        <span className="text-lg font-black text-gray-900">${totalVerified.toFixed(2)}</span>
                    </div>
                    
                    {payments.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Verificado</p>
                                <p className="text-base font-black text-emerald-600">${totalVerified.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Payments History & Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-gray-400" />
                    <h3 className="text-xl font-black font-serif text-gray-900">Historial de Pagos</h3>
                </div>
            </div>

            <div className="space-y-4">
                {payments.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium italic">No se han registrado abonos aún.</p>
                    </div>
                ) : (
                    payments.map((payment, idx) => (
                        <motion.div 
                            key={payment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center",
                                    payment.status === 'verified' ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                                )}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Abono #{idx + 1}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                                        {format(new Date(payment.created_at), "d MMM, HH:mm", { locale: es })}
                                        <span className="ml-2 text-blue-600">(${Number(payment.extracted_data?.amount || payment.amount_claimed || 0).toFixed(2)})</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className={cn(
                                    "rounded-full font-black text-[9px] uppercase tracking-widest",
                                    payment.status === 'verified' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {statusConfig[payment.status]?.label || payment.status}
                                </Badge>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="rounded-full hover:bg-[var(--puembo-green)]/10 hover:text-[var(--puembo-green)]"
                                    onClick={() => viewReceipt(payment.receipt_path)}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-gray-400" />
                <h3 className="text-xl font-black font-serif text-gray-900">Nuevo Abono</h3>
            </div>

            <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">
                        ¿Has realizado un pago adicional? Sube tu comprobante bancario aquí para que lo validemos.
                    </p>
                    
                    {!selectedFile ? (
                        <label className="flex flex-col items-center justify-center w-full aspect-square rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-[var(--puembo-green)] transition-all cursor-pointer group">
                            <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-[var(--puembo-green)]" />
                            </div>
                            <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[var(--puembo-green)]">Seleccionar Archivo</span>
                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isUploading} />
                        </label>
                    ) : (
                        <div className="space-y-4">
                             <div className="p-6 bg-[var(--puembo-green)]/5 rounded-3xl border-2 border-[var(--puembo-green)] text-center">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm text-[var(--puembo-green)]">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{selectedFile.name}</p>
                                <p className="text-[10px] font-black text-[var(--puembo-green)] uppercase mt-1">Listo para subir</p>
                             </div>
                             
                             <div className="flex gap-3">
                                <Button 
                                    className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] bg-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/90"
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
                                </Button>
                                <Button 
                                    variant="ghost"
                                    className="rounded-2xl h-12 text-red-500 hover:text-red-600 hover:bg-red-50 font-black uppercase tracking-widest text-[10px]"
                                    onClick={() => {
                                        setSelectedFile(null);
                                    }}
                                    disabled={isUploading}
                                >
                                    Quitar
                                </Button>
                             </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                <div className="flex gap-4">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                        La validación manual puede tardar hasta 48 horas laborables. Recibirás una notificación cuando tu pago sea verificado.
                    </p>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
}
