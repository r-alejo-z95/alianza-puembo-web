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
  Loader2,
  X,
  ZoomOut,
  ZoomIn,
  RotateCcw,
  RotateCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { uploadReceipt } from "@/lib/actions";
import { addMultipartPayment, getTrackingReceiptSignedUrl } from "@/lib/actions/finance";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/image-compression";
import { getSubmissionBalanceSummary } from "@/lib/finance/submission-balance.mjs";
import {
  getActiveTrackingPayments,
  getSubmissionTrackingPayments,
  getTrackingPaymentAmount,
} from "@/lib/finance/manual-payment.mjs";
import { getPublicPaymentUploadErrorMessage } from "@/lib/finance/public-payment-errors.mjs";

import { findNameInSubmission } from "@/lib/form-utils";

function getReceiptKind(path) {
  const value = String(path || "").toLowerCase();
  if (value.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|webp|gif|avif|heic|heif)$/.test(value)) return "image";
  return "file";
}

export default function TrackingClient({ submission }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [receiptZoom, setReceiptZoom] = useState(1);
  const [receiptRotation, setReceiptRotation] = useState(0);

  const form = submission.forms;
  const paymentSource = submission.payment_group?.form_submission_payments?.length
    ? {
        ...submission,
        form_submission_payments: submission.payment_group.form_submission_payments,
      }
    : submission;
  const payments = getSubmissionTrackingPayments(paymentSource);
  const sortedPayments = [...payments].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return aTime - bTime;
  });
  const activePayments = getActiveTrackingPayments(sortedPayments);
  
  const paymentAmount = getTrackingPaymentAmount;

  const totalAmount = Number(form?.total_amount || 0);
  const balanceSummary = getSubmissionBalanceSummary({
    submission: {
      ...submission,
      form_submission_payments: sortedPayments,
    },
    totalAmount,
  });
  const totalVerified = balanceSummary.verifiedAmount;
  const totalSubmitted = balanceSummary.submittedAmount;
  const remainingBalance = totalAmount > 0 ? balanceSummary.remainingBalance : null;
  const canUploadAdditionalPayment = remainingBalance === null || remainingBalance > 0;

  // Status config
  const statusConfig = {
    verified: { label: "Verificado", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    pending: { label: "Pendiente de Validación", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    manual_review: { label: "Requiere Revisión", icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    rejected: { label: "Rechazado", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    submitted: { label: "Enviado", icon: Clock, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100" }
  };

  let aggregatedStatus = 'submitted';
  if (activePayments.length > 0) {
    if (activePayments.some(p => p.status === 'manual_review')) {
      aggregatedStatus = 'manual_review';
    } else if (activePayments.some(p => p.status === 'pending')) {
      aggregatedStatus = 'pending';
    } else if (activePayments.every(p => p.status === 'verified')) {
      aggregatedStatus = 'verified';
    }
  } else if (sortedPayments.some(p => p.status === 'rejected')) {
    aggregatedStatus = 'rejected';
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
    setUploadResult(null);
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
        setUploadResult({
          status: "success",
          title: "Comprobante recibido",
          message: "Nuestro equipo validará este abono y actualizará tu estado de pago.",
        });
        setSelectedFile(null);
      } else {
        throw new Error(paymentRes.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        status: "error",
        title: "No pudimos subir el comprobante",
        message: getPublicPaymentUploadErrorMessage(error.message),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const viewReceipt = async (payment, index) => {
    if (!payment?.receipt_path) {
      toast.error("Este abono no tiene comprobante disponible");
      return;
    }

    const title = `Abono #${index + 1}`;
    const kind = getReceiptKind(payment.receipt_path);
    const aiData = payment.extracted_data || {};
    setReceiptZoom(1);
    setReceiptRotation(0);
    setViewingReceipt({
      title,
      kind,
      aiData,
      isLoading: true,
      error: null,
      url: null,
    });

    const res = await getTrackingReceiptSignedUrl({
      submissionId: submission.id,
      accessToken: submission.access_token,
      receiptPath: payment.receipt_path,
    });

    if (res.url) {
      setViewingReceipt({
        title,
        kind,
        aiData,
        isLoading: false,
        error: null,
        url: res.url,
      });
    } else {
      const message = res.error || "No se pudo obtener el enlace del comprobante";
      setViewingReceipt({
        title,
        kind,
        aiData,
        isLoading: false,
        error: message,
        url: null,
      });
      toast.error(message);
    }
  };

  // Intentar encontrar el nombre del inscrito en los datos del formulario
  const getSubmissionName = () => {
    return findNameInSubmission(submission);
  };

  return (
    <>
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
                <Badge variant="outline" className={cn("max-w-full whitespace-normal px-3 py-1 rounded-full text-center font-black uppercase tracking-[0.12em] text-[10px] leading-tight border-2 sm:px-4 sm:tracking-widest sm:whitespace-nowrap", currentStatus.color, "border-current bg-white")}>
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
                        <code className="block max-w-full break-all text-sm md:text-lg font-black tracking-widest text-[var(--puembo-green)]">
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
                        <span className="text-sm font-bold text-gray-600">Total Abonos ({activePayments.length})</span>
                        <span className="text-lg font-black text-gray-900">${totalSubmitted.toFixed(2)}</span>
                    </div>
                    
                    {activePayments.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Entregado</p>
                                <p className="text-base font-black text-blue-600">${totalSubmitted.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Verificado</p>
                                <p className="text-base font-black text-emerald-600">${totalVerified.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                    {balanceSummary.needsExpectedAmount ? (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Grupo de pago</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">Finanzas definirá el total esperado del grupo.</p>
                        </div>
                    ) : remainingBalance !== null && (
                        <div className="p-4 bg-[var(--puembo-green)]/5 rounded-2xl border border-[var(--puembo-green)]/10 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--puembo-green)]">Saldo pendiente</p>
                            <p className="text-lg font-black text-gray-900">${remainingBalance.toFixed(2)}</p>
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
                {sortedPayments.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium italic">No se han registrado abonos aún.</p>
                    </div>
                ) : (
                    sortedPayments.map((payment, idx) => {
                        const paymentStatus = payment.status === "rejected" || payment.manual_disposition ? "rejected" : payment.status;
                        const isRejected = paymentStatus === "rejected";
                        const discardReason = payment.manual_disposition === "duplicado"
                          ? "Comprobante duplicado"
                          : "Comprobante incorrecto";

                        return (
                            <motion.div
                                key={payment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex w-full min-w-0 items-center gap-4 sm:w-auto">
                                    <div className={cn(
                                        "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center",
                                        isRejected
                                          ? "bg-red-50 text-red-600"
                                          : paymentStatus === 'verified'
                                            ? "bg-green-50 text-green-600"
                                            : "bg-gray-50 text-gray-400"
                                    )}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900">Abono #{idx + 1}</p>
                                        {payment.extracted_data?.label ? (
                                          <p className="max-w-full truncate text-[10px] font-medium text-gray-500">
                                            {payment.extracted_data.label}
                                          </p>
                                        ) : null}
                                        <p className="break-words text-[10px] text-gray-400 uppercase font-black tracking-wider">
                                            {format(new Date(payment.created_at), "d MMM, HH:mm", { locale: es })}
                                            {isRejected ? (
                                              <span className="ml-0 inline-block text-red-600 sm:ml-2">No contabilizado</span>
                                            ) : (
                                              <span className="ml-0 inline-block text-blue-600 sm:ml-2">(${paymentAmount(payment).toFixed(2)})</span>
                                            )}
                                        </p>
                                        {isRejected ? (
                                          <p className="mt-1 max-w-md break-words text-[10px] font-medium leading-relaxed text-red-600 normal-case">
                                            {discardReason}
                                            {payment.manual_disposition_notes ? `: ${payment.manual_disposition_notes}` : ""}
                                          </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4">
                                    <Badge variant="secondary" className={cn(
                                        "max-w-[calc(100%-3rem)] whitespace-normal rounded-full text-center font-black text-[9px] uppercase tracking-widest leading-tight sm:max-w-none sm:whitespace-nowrap",
                                        isRejected
                                          ? "bg-red-100 text-red-700"
                                          : paymentStatus === 'verified'
                                            ? "bg-green-100 text-green-700"
                                            : "bg-amber-100 text-amber-700"
                                    )}>
                                        {statusConfig[paymentStatus]?.label || paymentStatus}
                                    </Badge>
                                    {payment.receipt_path ? (
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="shrink-0 hover:bg-[var(--puembo-green)]/10 hover:text-[var(--puembo-green)] rounded-full"
                                          onClick={() => viewReceipt(payment, idx)}
                                          aria-label={`Ver comprobante de abono ${idx + 1}`}
                                      >
                                          <ChevronRight className="w-5 h-5" />
                                      </Button>
                                    ) : null}
                                </div>
                            </motion.div>
                        );
                    })
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

                    {uploadResult ? (
                        <div className={cn(
                            "rounded-2xl border p-4",
                            uploadResult.status === "success"
                                ? "bg-[var(--puembo-green)]/5 border-[var(--puembo-green)]/20 text-gray-700"
                                : "bg-red-50 border-red-100 text-red-700"
                        )}>
                            <p className="text-sm font-black">{uploadResult.title}</p>
                            <p className="text-xs leading-relaxed font-medium mt-1">{uploadResult.message}</p>
                        </div>
                    ) : null}
                    
                    {!canUploadAdditionalPayment ? (
                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                            <p className="text-sm font-black text-gray-900">El total ya está cubierto</p>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                No necesitas subir otro abono para esta inscripción.
                            </p>
                        </div>
                    ) : !selectedFile ? (
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
    <Dialog
      open={!!viewingReceipt}
      onOpenChange={(open) => {
        if (!open) setViewingReceipt(null);
      }}
    >
      <DialogContent
        hideClose
        overlayClassName="z-[120] bg-black/80 backdrop-blur-sm"
        className="z-[130] max-w-5xl w-[92vw] h-[82vh] rounded-[1.5rem] p-0 overflow-hidden border-none shadow-2xl bg-black/95 flex flex-col"
      >
        <DialogTitle className="sr-only">Visor de comprobante</DialogTitle>
        {viewingReceipt && (
          <>
            <div className="h-16 px-4 md:px-6 border-b border-white/10 bg-black/80 text-white flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-lg md:text-xl truncate">{viewingReceipt.title}</h4>
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/45 truncate">
                  {viewingReceipt.aiData?.date || "Sin fecha"} · ${Number(viewingReceipt.aiData?.amount || 0).toFixed(2)} · {viewingReceipt.aiData?.reference || "Sin referencia"}
                </p>
              </div>
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                {viewingReceipt.kind === "image" && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => setReceiptZoom((value) => Math.max(0.5, Number((value - 0.25).toFixed(2))))} className="rounded-full bg-white/10 hover:bg-white/20 text-white h-8 w-8 md:h-10 md:w-10"><ZoomOut className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setReceiptZoom((value) => Math.min(4, Number((value + 0.25).toFixed(2))))} className="rounded-full bg-white/10 hover:bg-white/20 text-white h-8 w-8 md:h-10 md:w-10"><ZoomIn className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setReceiptZoom(1); setReceiptRotation(0); }} className="rounded-full bg-white/10 hover:bg-white/20 text-white h-8 w-8 md:h-10 md:w-10"><RotateCcw className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setReceiptRotation((value) => (value + 90) % 360)} className="rounded-full bg-white/10 hover:bg-white/20 text-white h-8 w-8 md:h-10 md:w-10"><RotateCw className="w-4 h-4" /></Button>
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={() => setViewingReceipt(null)} className="rounded-full bg-white/10 hover:bg-white/20 text-white h-8 w-8 md:h-10 md:w-10"><X className="w-5 h-5" /></Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 w-full overflow-auto bg-neutral-950">
              <div className="min-h-full min-w-full flex items-center justify-center p-4 md:p-8">
                {viewingReceipt.isLoading ? (
                  <div className="flex flex-col items-center justify-center text-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-8 py-10">
                    <Loader2 className="w-10 h-10 animate-spin text-[var(--puembo-green)]" />
                    <div className="space-y-1">
                      <p className="text-white font-serif text-2xl font-bold">Preparando comprobante</p>
                      <p className="text-white/45 text-[10px] font-black uppercase tracking-widest">
                        Estamos firmando el archivo para abrirlo de forma segura
                      </p>
                    </div>
                  </div>
                ) : viewingReceipt.error ? (
                  <div className="flex flex-col items-center justify-center text-center gap-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-8 py-10">
                    <AlertCircle className="w-10 h-10 text-red-300" />
                    <p className="text-sm font-bold text-red-100">{viewingReceipt.error}</p>
                  </div>
                ) : viewingReceipt.kind === "pdf" ? (
                  <iframe
                    src={viewingReceipt.url}
                    title="Comprobante bancario"
                    className="w-full h-[calc(82vh-6rem)] rounded-lg bg-white"
                  />
                ) : viewingReceipt.kind === "image" ? (
                  <img
                    src={viewingReceipt.url}
                    alt="Recibo bancario"
                    className="max-w-none object-contain shadow-2xl rounded-lg transition-transform duration-200 origin-center"
                    style={{
                      width: `${receiptZoom * 100}%`,
                      transform: `rotate(${receiptRotation}deg)`,
                    }}
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <FileText className="mx-auto h-8 w-8 text-white/60" />
                    <p className="text-white font-medium">
                      No se puede previsualizar este archivo aquí.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
