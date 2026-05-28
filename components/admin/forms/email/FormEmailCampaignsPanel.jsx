"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FileUp,
  Loader2,
  Mail,
  Paperclip,
  PanelRightOpen,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminEditorPanel } from "@/components/admin/layout/AdminEditorPanel";
import RichTextEditor from "@/components/admin/forms/RichTextEditor";
import { formatInEcuador } from "@/lib/date-utils";
import { findNameInSubmission } from "@/lib/form-utils";
import { cn } from "@/lib/utils";
import {
  cancelScheduledFormEmailCampaign,
  deleteFormEmailCampaignAttachment,
  renderFormEmailCampaignPreview,
  saveFormEmailCampaign,
  saveFormEmailCampaignExclusions,
  scheduleFormEmailCampaign,
  sendFormEmailCampaignNow,
  sendFormEmailCampaignTest,
  uploadFormEmailCampaignAttachment,
} from "@/lib/actions/form-email-campaigns";

const EMPTY_BODY =
  "<p>Hola {{nombre}},</p><p>Te escribimos sobre {{formulario}}.</p>";

const BASE_VARIABLE_CHIPS = [
  "{{nombre}}",
  "{{formulario}}",
  "{{fecha_registro}}",
];

const FINANCIAL_VARIABLE_CHIPS = [
  "{{link_seguimiento}}",
  "{{estado_pago}}",
  "{{monto_pagado}}",
  "{{saldo_pendiente}}",
];

function buildDraft(campaign = null) {
  return {
    id: campaign?.id || null,
    name: campaign?.name || "",
    subject: campaign?.subject || "",
    bodyHtml: campaign?.body_html || EMPTY_BODY,
    scheduledAt: toDatetimeLocalValue(campaign?.scheduled_at),
  };
}

function toDatetimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function statusLabel(status) {
  return {
    draft: "Borrador",
    scheduled: "Programada",
    sending: "Enviando",
    sent: "Enviada",
    partial: "Parcial",
    failed: "Fallida",
    cancelled: "Cancelada",
  }[status] || "Borrador";
}

function statusClasses(status) {
  return {
    draft: "bg-gray-100 text-gray-500",
    scheduled: "bg-sky-50 text-sky-600 border-sky-100",
    sending: "bg-amber-50 text-amber-600 border-amber-100",
    sent: "bg-emerald-50 text-emerald-600 border-emerald-100",
    partial: "bg-orange-50 text-orange-600 border-orange-100",
    failed: "bg-red-50 text-red-600 border-red-100",
    cancelled: "bg-gray-100 text-gray-400",
  }[status] || "bg-gray-100 text-gray-500";
}

function deliveryEvents(campaign) {
  return [...(campaign?.form_email_delivery_events || [])].sort(
    (a, b) =>
      new Date(b.sent_at || b.attempted_at || 0).getTime() -
      new Date(a.sent_at || a.attempted_at || 0).getTime(),
  );
}

function countDeliveries(campaign, status) {
  return deliveryEvents(campaign).filter((event) => event.status === status).length;
}

function lastDeliveryForSubmission(campaign, submissionId) {
  return deliveryEvents(campaign).find((event) => event.submission_id === submissionId);
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function getSubmissionEmail(submission) {
  return String(submission?.notification_email || "").trim();
}

function getDeliveryTone(status) {
  return {
    sent: "text-emerald-600 bg-emerald-50",
    failed: "text-red-600 bg-red-50",
    skipped: "text-gray-500 bg-gray-100",
  }[status] || "text-gray-500 bg-gray-100";
}

export default function FormEmailCampaignsPanel({
  form,
  submissions = [],
  campaigns = [],
  canManageEmails = false,
}) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const firstCampaign = campaigns[0] || null;
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    firstCampaign?.id || null,
  );
  const [draft, setDraft] = useState(() => buildDraft(firstCampaign));
  const [excludedIds, setExcludedIds] = useState(() =>
    (firstCampaign?.form_email_campaign_exclusions || []).map(
      (row) => row.submission_id,
    ),
  );
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [busyKey, setBusyKey] = useState(null);
  const [campaignDrawerOpen, setCampaignDrawerOpen] = useState(false);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId],
  );

  const attachments = selectedCampaign?.form_email_campaign_attachments || [];
  const selectedEvents = deliveryEvents(selectedCampaign);
  const excludedSet = useMemo(() => new Set(excludedIds), [excludedIds]);
  const deliveryTotals = useMemo(
    () =>
      campaigns.reduce(
        (totals, campaign) => ({
          sent: totals.sent + countDeliveries(campaign, "sent"),
          failed: totals.failed + countDeliveries(campaign, "failed"),
          skipped: totals.skipped + countDeliveries(campaign, "skipped"),
        }),
        { sent: 0, failed: 0, skipped: 0 },
      ),
    [campaigns],
  );
  const scheduledCount = campaigns.filter(
    (campaign) => campaign.status === "scheduled",
  ).length;
  const variableChips = useMemo(
    () =>
      form?.is_financial
        ? [...BASE_VARIABLE_CHIPS, ...FINANCIAL_VARIABLE_CHIPS]
        : BASE_VARIABLE_CHIPS,
    [form?.is_financial],
  );

  const visibleSubmissions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return submissions;

    return submissions.filter((submission) => {
      const name = findNameInSubmission(submission).toLowerCase();
      const email = getSubmissionEmail(submission).toLowerCase();
      return name.includes(normalized) || email.includes(normalized);
    });
  }, [query, submissions]);

  const selectedRecipientCount = submissions.filter(
    (submission) =>
      getSubmissionEmail(submission) && !excludedSet.has(submission.id),
  ).length;

  const updateDraft = (patch) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const refresh = () => {
    router.refresh();
  };

  const startNewCampaign = () => {
    setSelectedCampaignId(null);
    setDraft(buildDraft(null));
    setExcludedIds([]);
    setPreview(null);
    setCampaignDrawerOpen(false);
  };

  const editCampaign = (campaign) => {
    setSelectedCampaignId(campaign.id);
    setDraft(buildDraft(campaign));
    setExcludedIds(
      (campaign.form_email_campaign_exclusions || []).map(
        (row) => row.submission_id,
      ),
    );
    setPreview(null);
    setCampaignDrawerOpen(false);
  };

  const saveDraftAndExclusions = async ({ silent = false } = {}) => {
    const result = await saveFormEmailCampaign({
      formId: form.id,
      campaignId: draft.id,
      name: draft.name,
      subject: draft.subject,
      bodyHtml: draft.bodyHtml,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    const campaignId = result?.campaign?.id || draft.id;
    if (!campaignId) {
      throw new Error("No se pudo guardar la campaña.");
    }

    const exclusionsResult = await saveFormEmailCampaignExclusions({
      formId: form.id,
      campaignId,
      excludedSubmissionIds: excludedIds,
    });

    if (exclusionsResult?.error) {
      throw new Error(exclusionsResult.error);
    }

    if (result?.campaign) {
      setSelectedCampaignId(result.campaign.id);
      setDraft(buildDraft(result.campaign));
    }

    if (!silent) toast.success("Campaña guardada");
    refresh();
    return campaignId;
  };

  const handleSave = async () => {
    setBusyKey("save");
    try {
      await saveDraftAndExclusions();
    } catch (error) {
      toast.error(error?.message || "No se pudo guardar la campaña.");
    } finally {
      setBusyKey(null);
    }
  };

  const handlePreview = async () => {
    setBusyKey("preview");
    try {
      const result = await renderFormEmailCampaignPreview({
        formId: form.id,
        campaignId: draft.id,
        subject: draft.subject,
        bodyHtml: draft.bodyHtml,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      setPreview(result.preview);
    } finally {
      setBusyKey(null);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error("Escribe el correo de prueba.");
      return;
    }

    setBusyKey("test");
    try {
      const result = await sendFormEmailCampaignTest({
        formId: form.id,
        email: testEmail.trim(),
        subject: draft.subject,
        bodyHtml: draft.bodyHtml,
      });

      result?.error ? toast.error(result.error) : toast.success("Prueba enviada");
    } finally {
      setBusyKey(null);
    }
  };

  const handleSendNow = async () => {
    setBusyKey("send");
    try {
      const campaignId = await saveDraftAndExclusions({ silent: true });
      const result = await sendFormEmailCampaignNow({
        formId: form.id,
        campaignId,
      });

      if (result?.error) toast.error(result.error);
      else {
        toast.success("Envío iniciado");
        refresh();
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo enviar la campaña.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleSchedule = async () => {
    setBusyKey("schedule");
    try {
      const campaignId = await saveDraftAndExclusions({ silent: true });
      const result = await scheduleFormEmailCampaign({
        formId: form.id,
        campaignId,
        scheduledAt: draft.scheduledAt,
      });

      if (result?.error) toast.error(result.error);
      else {
        toast.success("Campaña programada");
        refresh();
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo programar la campaña.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleCancelSchedule = async () => {
    if (!draft.id) return;

    setBusyKey("cancel");
    try {
      const result = await cancelScheduledFormEmailCampaign({
        formId: form.id,
        campaignId: draft.id,
      });

      if (result?.error) toast.error(result.error);
      else {
        toast.success("Programación cancelada");
        refresh();
      }
    } finally {
      setBusyKey(null);
    }
  };

  const handleAttachmentUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusyKey("attachment");
    try {
      const campaignId = draft.id || (await saveDraftAndExclusions({ silent: true }));
      const formData = new FormData();
      formData.append("formId", form.id);
      formData.append("campaignId", campaignId);
      formData.append("file", file);

      const result = await uploadFormEmailCampaignAttachment(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Adjunto subido");
        refresh();
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo subir el adjunto.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    setBusyKey(`delete-attachment:${attachmentId}`);
    try {
      const result = await deleteFormEmailCampaignAttachment({
        formId: form.id,
        attachmentId,
      });

      if (result?.error) toast.error(result.error);
      else {
        toast.success("Adjunto eliminado");
        refresh();
      }
    } finally {
      setBusyKey(null);
    }
  };

  const metricCards = [
    { label: "Campañas", value: campaigns.length, icon: Mail },
    { label: "Programadas", value: scheduledCount, icon: CalendarClock },
    { label: "Enviados", value: deliveryTotals.sent, icon: CheckCircle2 },
    { label: "Fallidos", value: deliveryTotals.failed, icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      {!canManageEmails ? (
        <div className="rounded-[1.75rem] border border-amber-100 bg-amber-50/60 px-5 py-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              Vista de historial
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Puedes revisar campañas, destinatarios y entregas. Solo el creador
              del formulario o un super admin puede enviar, programar o editar.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="bg-white rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-200/20 px-5 py-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">
                {metric.value}
              </p>
            </div>
            <metric.icon className="w-5 h-5 text-[var(--puembo-green)] opacity-45 shrink-0" />
          </div>
        ))}
      </div>

      <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--puembo-green)]">
              Correos / Campañas
            </p>
            <h3 className="font-serif text-2xl font-bold text-gray-900 leading-tight">
              {selectedCampaign?.name || "Nueva campaña de correo"}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Administra el contenido, destinatarios, adjuntos, pruebas y envíos programados desde un solo editor.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCampaignDrawerOpen(true)}
              className="cursor-pointer rounded-full h-11 px-5 text-[10px] font-black uppercase tracking-widest"
            >
              <PanelRightOpen className="w-4 h-4 mr-2" />
              Campañas
            </Button>
            {canManageEmails ? (
              <Button
                type="button"
                onClick={startNewCampaign}
                className="cursor-pointer rounded-full h-11 px-5 text-[10px] font-black uppercase tracking-widest bg-black hover:bg-[var(--puembo-green)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 min-w-0">
          <Card className="border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="px-6 md:px-8 py-6 border-b border-gray-50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--puembo-green)]">
                    Editor
                  </p>
                  <CardTitle className="text-2xl font-serif font-bold text-gray-900">
                    Campaña de correo
                  </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedCampaign?.sent_at ? (
                    <span className="rounded-full bg-gray-50 border border-gray-100 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Último envío {formatInEcuador(selectedCampaign.sent_at, "d MMM · HH:mm")}
                    </span>
                  ) : null}
                  {selectedCampaign ? (
                    <span
                      className={cn(
                        "rounded-full border px-4 py-2 text-[9px] font-black uppercase tracking-widest",
                        statusClasses(selectedCampaign.status),
                      )}
                    >
                      {statusLabel(selectedCampaign.status)}
                    </span>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8 space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Nombre interno
                  </span>
                  <Input
                    disabled={!canManageEmails}
                    value={draft.name}
                    onChange={(event) => updateDraft({ name: event.target.value })}
                    placeholder="Ej. Recordatorio final"
                    className="h-12 rounded-2xl bg-gray-50/50 border-gray-100"
                  />
                </label>
                <label className="space-y-2 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Asunto
                  </span>
                  <Input
                    disabled={!canManageEmails}
                    value={draft.subject}
                    onChange={(event) => updateDraft({ subject: event.target.value })}
                    placeholder="Ej. Faltan 3 días para el evento"
                    className="h-12 rounded-2xl bg-gray-50/50 border-gray-100"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Contenido modificable
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variableChips.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() =>
                          updateDraft({
                            bodyHtml: `${draft.bodyHtml || ""}<span>${variable}</span>`,
                          })
                        }
                        disabled={!canManageEmails}
                        className="cursor-pointer rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-[9px] font-black text-gray-500 hover:border-[var(--puembo-green)]/30 hover:text-[var(--puembo-green)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                {canManageEmails ? (
                  <RichTextEditor
                    content={draft.bodyHtml}
                    onChange={(html) => updateDraft({ bodyHtml: html })}
                    placeholder="Escribe el correo para los inscritos..."
                  />
                ) : (
                  <div
                    className="min-h-[260px] rounded-[2rem] border border-gray-100 bg-gray-50/60 p-6 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: draft.bodyHtml || "" }}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] gap-6">
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Destinatarios
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {selectedRecipientCount} de {submissions.length}
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar por nombre o correo..."
                      className="pl-11 h-11 rounded-2xl bg-gray-50/60 border-gray-100"
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto rounded-2xl border border-gray-100 divide-y divide-gray-50">
                    {visibleSubmissions.length === 0 ? (
                      <div className="px-4 py-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-300">
                        Sin destinatarios
                      </div>
                    ) : (
                      visibleSubmissions.map((submission) => {
                        const checked = !excludedSet.has(submission.id);
                        const lastEvent = lastDeliveryForSubmission(
                          selectedCampaign,
                          submission.id,
                        );
                        const email = getSubmissionEmail(submission);

                        return (
                          <label
                            key={submission.id}
                            className="cursor-pointer flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <Checkbox
                              checked={checked}
                              disabled={!canManageEmails || !email}
                              onCheckedChange={(value) => {
                                setExcludedIds((current) =>
                                  value
                                    ? current.filter((id) => id !== submission.id)
                                    : [...new Set([...current, submission.id])],
                                );
                              }}
                              className="mt-1"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate">
                                    {findNameInSubmission(submission)}
                                  </p>
                                  <p className="text-[10px] text-gray-400 truncate">
                                    {email || "Sin correo"}
                                  </p>
                                </div>
                                {lastEvent ? (
                                  <span
                                    className={cn(
                                      "shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-widest",
                                      getDeliveryTone(lastEvent.status),
                                    )}
                                  >
                                    {lastEvent.status === "sent"
                                      ? "Recibido"
                                      : lastEvent.status}
                                  </span>
                                ) : null}
                              </div>
                              {lastEvent ? (
                                <p className="mt-1 text-[9px] font-medium text-gray-400">
                                  Último intento:{" "}
                                  {formatInEcuador(
                                    lastEvent.sent_at || lastEvent.attempted_at,
                                    "d MMM yyyy · HH:mm",
                                  )}
                                </p>
                              ) : null}
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-5 min-w-0">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Adjuntos
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!canManageEmails || busyKey === "attachment"}
                      className="cursor-pointer w-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 px-4 py-8 text-center hover:border-[var(--puembo-green)]/30 hover:bg-emerald-50/30 transition-all disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      {busyKey === "attachment" ? (
                        <Loader2 className="w-7 h-7 text-[var(--puembo-green)] animate-spin" />
                      ) : (
                        <FileUp className="w-7 h-7 text-[var(--puembo-green)]" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {busyKey === "attachment"
                          ? "Subiendo adjunto..."
                          : "Subir PDF, imagen o documento"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Máximo 10MB por archivo. Si es nuevo, se guarda automáticamente.
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentUpload}
                    />

                    <div className="space-y-2">
                      {attachments.length === 0 ? (
                        <div className="rounded-2xl border border-gray-100 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">
                          Sin adjuntos
                        </div>
                      ) : (
                        attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex items-center gap-3">
                              <Paperclip className="w-4 h-4 text-[var(--puembo-green)] shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">
                                  {attachment.filename}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {formatBytes(attachment.size_bytes)}
                                </p>
                              </div>
                            </div>
                            {canManageEmails ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                                disabled={busyKey === `delete-attachment:${attachment.id}`}
                                className="cursor-pointer h-8 w-8 rounded-full border border-red-100 text-red-400 hover:bg-red-50 inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Eliminar adjunto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Prueba
                    </span>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        disabled={!canManageEmails}
                        value={testEmail}
                        onChange={(event) => setTestEmail(event.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="h-11 rounded-2xl bg-gray-50/60 border-gray-100"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendTest}
                        disabled={!canManageEmails || busyKey === "test"}
                        className="cursor-pointer h-11 rounded-full px-4 text-[9px] font-black uppercase tracking-widest"
                      >
                        {busyKey === "test" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Fecha y hora programada
                    </span>
                    <Input
                      type="datetime-local"
                      disabled={!canManageEmails}
                      value={draft.scheduledAt}
                      onChange={(event) =>
                        updateDraft({ scheduledAt: event.target.value })
                      }
                      className="h-12 rounded-2xl bg-gray-50/60 border-gray-100"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-3 justify-between border-t border-gray-50 pt-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={busyKey === "preview"}
                    className="cursor-pointer rounded-full h-12 px-6 text-[10px] font-black uppercase tracking-widest"
                  >
                    {busyKey === "preview" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    {busyKey === "preview" ? "Generando..." : "Previsualizar"}
                  </Button>
                  {selectedCampaign?.status === "scheduled" && canManageEmails ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelSchedule}
                      disabled={busyKey === "cancel"}
                      className="cursor-pointer rounded-full h-12 px-6 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600"
                    >
                      Cancelar programación
                    </Button>
                  ) : null}
                </div>

                {canManageEmails ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSave}
                      disabled={busyKey === "save"}
                      className="cursor-pointer rounded-full h-12 px-6 text-[10px] font-black uppercase tracking-widest"
                    >
                      {busyKey === "save" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      {busyKey === "save" ? "Guardando..." : "Guardar borrador"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSchedule}
                      disabled={busyKey === "schedule"}
                      className="cursor-pointer rounded-full h-12 px-6 text-[10px] font-black uppercase tracking-widest"
                    >
                      {busyKey === "schedule" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CalendarClock className="w-4 h-4 mr-2" />
                      )}
                      {busyKey === "schedule" ? "Programando..." : "Programar"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSendNow}
                      disabled={busyKey === "send"}
                      className="cursor-pointer rounded-full h-12 px-6 text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-[var(--puembo-green)]"
                    >
                      {busyKey === "send" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {busyKey === "send" ? "Enviando..." : "Enviar ahora"}
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="px-6 md:px-8 py-5 border-b border-gray-50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--puembo-green)]">
                    Historial
                  </p>
                  <CardTitle className="text-xl font-serif font-bold text-gray-900">
                    Últimas entregas
                  </CardTitle>
                </div>
                <span className="rounded-full bg-gray-50 border border-gray-100 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  {selectedEvents.length} eventos
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              {selectedEvents.length === 0 ? (
                <div className="py-14 rounded-[1.5rem] border-2 border-dashed border-gray-100 text-center">
                  <Clock className="w-7 h-7 mx-auto text-gray-200 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                    Sin entregas registradas
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-80 rounded-[1.5rem] border border-gray-100">
                  <div className="divide-y divide-gray-50">
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {event.email}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {formatInEcuador(
                              event.sent_at || event.attempted_at,
                              "d MMM yyyy · HH:mm",
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.error_message ? (
                            <span className="text-[10px] text-gray-400 truncate max-w-[220px]">
                              {event.error_message}
                            </span>
                          ) : null}
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest",
                              getDeliveryTone(event.status),
                            )}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
      </div>

      <AdminEditorPanel
        open={campaignDrawerOpen}
        onOpenChange={setCampaignDrawerOpen}
        title="Campañas de correo"
        description="Escoge una campaña existente o crea una nueva para editarla en el panel principal."
        className="sm:max-w-md"
      >
        <div className="p-4 md:p-5 space-y-4">
          {canManageEmails ? (
            <Button
              type="button"
              onClick={startNewCampaign}
              className="cursor-pointer w-full rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest bg-black hover:bg-[var(--puembo-green)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo
            </Button>
          ) : null}

          {campaigns.length === 0 ? (
            <div className="py-16 px-5 text-center rounded-[1.5rem] border-2 border-dashed border-gray-200 bg-white">
              <Mail className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                No hay campañas creadas
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => editCampaign(campaign)}
                  className={cn(
                    "cursor-pointer w-full rounded-2xl border bg-white px-4 py-3 text-left transition-all",
                    selectedCampaign?.id === campaign.id
                      ? "border-[var(--puembo-green)]/40 shadow-sm"
                      : "border-gray-100 hover:bg-gray-50 hover:border-gray-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">
                        {campaign.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {campaign.subject}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-widest",
                        statusClasses(campaign.status),
                      )}
                    >
                      {statusLabel(campaign.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-300">
                    <span>{countDeliveries(campaign, "sent")} enviados</span>
                    <span>{countDeliveries(campaign, "failed")} fallidos</span>
                    {campaign.scheduled_at ? (
                      <span>{formatInEcuador(campaign.scheduled_at, "d MMM · HH:mm")}</span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </AdminEditorPanel>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="w-[min(96vw,1040px)] max-w-none rounded-[2rem] border-none shadow-2xl">
          <DialogTitle className="font-serif text-2xl text-gray-900">
            Previsualizar correo
          </DialogTitle>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Asunto
            </p>
            <p className="font-bold text-gray-900">{preview?.subject}</p>
          </div>
          <iframe
            title="Previsualización del correo"
            srcDoc={preview?.html || preview?.bodyHtml || ""}
            className="h-[68vh] w-full rounded-2xl border border-gray-100 bg-white"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
