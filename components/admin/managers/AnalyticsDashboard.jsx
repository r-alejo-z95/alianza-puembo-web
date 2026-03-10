"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowLeft,
  FileText,
  Clock,
  Filter,
  PieChart as PieIcon,
  User,
  Inbox,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Download,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  ZoomIn,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { subDays, subHours, format } from "date-fns";
import { formatInEcuador, getNowInEcuador } from "@/lib/date-utils";
import { cn } from "@/lib/utils.ts";
import { syncFormToSheets, getFileSignedUrl } from "@/lib/actions";
import { findNameInSubmission } from "@/lib/form-utils";

// ------------------------------------------------------------------
// FileDisplay — cached signed URL + modal viewer
// ------------------------------------------------------------------
function FileDisplay({ val, urlCache }) {
  const [resolvedUrl, setResolvedUrl] = useState(
    () => urlCache?.get(val?.financial_receipt_path) ?? null
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isImage = /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(val?.name ?? "");

  useEffect(() => {
    if (resolvedUrl || !val?.financial_receipt_path) return;
    setLoading(true);
    getFileSignedUrl(val.financial_receipt_path).then((res) => {
      if (res.url) {
        setResolvedUrl(res.url);
        urlCache?.set(val.financial_receipt_path, res.url);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="w-32 h-20 bg-gray-100 rounded-2xl animate-pulse" />;
  }

  if (resolvedUrl && isImage) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="group relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={resolvedUrl}
            alt={val.name}
            className="max-h-32 max-w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all duration-200">
            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
            <DialogTitle className="sr-only">{val.name}</DialogTitle>
            <img
              src={resolvedUrl}
              alt={val.name}
              className="w-full max-h-[85vh] object-contain bg-gray-50"
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (resolvedUrl) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 w-fit hover:bg-emerald-100/50 transition-all"
        >
          <FileText className="w-5 h-5 text-[var(--puembo-green)] shrink-0" />
          <span className="text-sm font-bold text-emerald-900 truncate max-w-[200px]">
            {val.name}
          </span>
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm rounded-[2rem] border-none shadow-2xl">
            <DialogTitle className="sr-only">{val.name}</DialogTitle>
            <div className="flex flex-col items-center gap-6 p-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center">
                <FileText className="w-8 h-8 text-[var(--puembo-green)]" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">{val.name}</p>
                <p className="text-xs text-gray-400 mt-1">Comprobante financiero</p>
              </div>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--puembo-green)] transition-colors"
              >
                Abrir documento
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 w-fit">
      <FileText className="w-4 h-4 text-gray-300 shrink-0" />
      <span className="text-sm text-gray-400 italic truncate max-w-[200px]">
        {val?.name || "Archivo adjunto"}
      </span>
    </div>
  );
}

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------
const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

const FIELD_TYPE_LABELS = {
  text: "Texto",
  textarea: "Párrafo",
  number: "Número",
  email: "Correo",
  date: "Fecha",
  radio: "Opción Única",
  checkbox: "Casillas",
  file: "Archivo",
  image: "Imagen",
  select: "Selección",
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white px-4 py-2 rounded-xl shadow-2xl text-[10px] font-black uppercase tracking-widest">
        <p className="mb-1 opacity-60">{label}</p>
        <p className="text-[var(--puembo-green)]">{payload[0].value} respuestas</p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-black text-white px-4 py-2 rounded-xl shadow-2xl text-[10px] font-black uppercase tracking-widest">
        <p className="mb-1 opacity-60">{name}</p>
        <p className="text-[var(--puembo-green)]">{value} respuestas</p>
      </div>
    );
  }
  return null;
};

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
export default function AnalyticsDashboard({ form, submissions: allSubmissions }) {
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [sheetSyncState, setSheetSyncState] = useState("idle");
  const [syncAdded, setSyncAdded] = useState(0);

  // Shared URL cache — signed URLs are valid 1h, no need to re-fetch on re-render
  const urlCacheRef = useRef(new Map());

  // 1. Period filter — always ascending (oldest first = #1)
  const filteredSubmissions = useMemo(() => {
    const nowUtc = new Date();
    let result;
    switch (dateFilter) {
      case "today": {
        const todayStr = formatInEcuador(nowUtc, "yyyy-MM-dd");
        result = allSubmissions.filter(
          (s) => formatInEcuador(s.created_at, "yyyy-MM-dd") === todayStr
        );
        break;
      }
      case "7days":
        result = allSubmissions.filter(
          (s) => new Date(s.created_at) >= subDays(nowUtc, 7)
        );
        break;
      case "30days":
        result = allSubmissions.filter(
          (s) => new Date(s.created_at) >= subDays(nowUtc, 30)
        );
        break;
      default:
        result = allSubmissions;
    }
    return [...result].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [allSubmissions, dateFilter]);

  // 2. Search
  const searchedSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return filteredSubmissions;
    const q = searchQuery.toLowerCase();
    return filteredSubmissions.filter((s) =>
      Object.values(s.data ?? {}).some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [filteredSubmissions, searchQuery]);

  const totalSubmissions = filteredSubmissions.length;

  const last24Hours = useMemo(() => {
    const cutoff = subHours(new Date(), 24);
    return allSubmissions.filter((s) => new Date(s.created_at) > cutoff).length;
  }, [allSubmissions]);

  const lastSubmissionDate = useMemo(() => {
    if (!allSubmissions.length) return null;
    return [...allSubmissions].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0].created_at;
  }, [allSubmissions]);

  // 3. Activity chart data
  const activityData = useMemo(() => {
    const nowEcuador = getNowInEcuador();
    if (dateFilter === "today") {
      return Array.from({ length: 24 }, (_, i) => ({
        date: i.toString().padStart(2, "0") + ":00",
        cantidad: allSubmissions.filter((s) => {
          const sDate = formatInEcuador(s.created_at, "yyyy-MM-dd");
          const sHour = parseInt(formatInEcuador(s.created_at, "H"));
          return sDate === format(nowEcuador, "yyyy-MM-dd") && sHour === i;
        }).length,
      }));
    }
    const rangeSize = dateFilter === "30days" ? 30 : dateFilter === "7days" ? 7 : 14;
    return Array.from({ length: rangeSize }, (_, i) =>
      format(subDays(nowEcuador, i), "yyyy-MM-dd")
    )
      .reverse()
      .map((day) => ({
        date: formatInEcuador(new Date(day + "T12:00:00"), "d MMM"),
        cantidad: allSubmissions.filter(
          (s) => formatInEcuador(s.created_at, "yyyy-MM-dd") === day
        ).length,
      }));
  }, [allSubmissions, dateFilter]);

  // 4. Helpers
  const isValueEmpty = (val) => {
    if (val === undefined || val === null || val === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    if (typeof val === "object" && val !== null) {
      if (val._type === "file") return !val.name;
      if (Object.keys(val).length === 0) return true;
      return Object.values(val).every(
        (v) => v === "" || v === null || v === undefined || v === false
      );
    }
    return false;
  };

  const getFieldStats = (fieldLabel) => {
    const counts = {};
    let respondedCount = 0;
    filteredSubmissions.forEach((s) => {
      const val = s.data[fieldLabel];
      if (isValueEmpty(val)) return;
      respondedCount++;
      if (Array.isArray(val)) {
        val.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
      } else if (typeof val === "object" && val._type === "file") {
        counts["Archivos Recibidos"] = (counts["Archivos Recibidos"] || 0) + 1;
      } else {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return {
      data: Object.entries(counts).map(([name, value]) => ({ name, value })),
      respondedCount,
    };
  };

  // 5. Actions
  async function handleOpenSheet() {
    if (!form.google_sheet_url) return;
    setSheetSyncState("syncing");
    try {
      const result = await syncFormToSheets(form.id);
      if (result.error) {
        setSheetSyncState("error");
      } else {
        setSyncAdded(result.added ?? 0);
        setSheetSyncState("done");
        window.open(form.google_sheet_url, "_blank");
      }
    } catch {
      setSheetSyncState("error");
    }
  }

  function exportToCSV() {
    const dataFields = (form.form_fields ?? []).filter(
      (f) => f.type !== "section_header" && f.type !== "separator" && f.type !== "section"
    );
    const headers = ["Timestamp", ...dataFields.map((f) => f.label)];
    const rows = filteredSubmissions.map((s) => [
      formatInEcuador(s.created_at, "dd/MM/yyyy HH:mm"),
      ...dataFields.map((f) => {
        const v = s.data[f.label];
        if (Array.isArray(v)) return v.join(", ");
        if (typeof v === "object" && v) return v.name || v.url || "";
        return String(v ?? "");
      }),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.slug}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700 max-w-7xl mx-auto px-4">

      {/* ── Header ── */}
      <div className="space-y-6 pt-2">
        <Link
          href="/admin/formularios"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Inventario de Formularios
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-[var(--puembo-green)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                Analíticas
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight leading-none">
              {form.title}
            </h1>
            <Link
              href={`/formularios/${form.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[var(--puembo-green)] transition-colors font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              Ver formulario público
            </Link>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {filteredSubmissions.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 h-10 px-5 rounded-full border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[var(--puembo-green)] hover:border-[var(--puembo-green)]/40 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            )}

            {/* Sheet button — compact, in header */}
            {form.google_sheet_id && (
              <button
                onClick={handleOpenSheet}
                disabled={sheetSyncState === "syncing"}
                className="flex items-center gap-2 h-10 px-5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--puembo-green)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {sheetSyncState === "syncing" ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : sheetSyncState === "done" ? (
                  <CheckCircle className="w-3.5 h-3.5 text-[var(--puembo-green)]" />
                ) : sheetSyncState === "error" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                {sheetSyncState === "syncing"
                  ? "Sincronizando..."
                  : sheetSyncState === "done"
                  ? syncAdded === 0 ? "Sheet al día" : `+${syncAdded} añadidas`
                  : sheetSyncState === "error"
                  ? "Error al sincronizar"
                  : "Abrir Sheet"}
              </button>
            )}

            {/* Period filter */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-lg shadow-gray-200/20">
              <Filter className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] border-none bg-transparent shadow-none focus:ring-0 font-black text-[10px] uppercase tracking-[0.15em] h-auto p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-black text-white">
                  {[
                    { value: "all", label: "Todo el histórico" },
                    { value: "today", label: "Hoy" },
                    { value: "7days", label: "Últimos 7 días" },
                    { value: "30days", label: "Últimos 30 días" },
                  ].map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="rounded-xl focus:bg-[var(--puembo-green)] focus:text-white"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Sync status line — only when relevant */}
        {form.google_sheet_id && sheetSyncState === "idle" && form.last_synced_at && (
          <p className="text-[10px] text-gray-400 font-medium">
            Sheet sincronizado:{" "}
            <span className="font-black">{formatInEcuador(form.last_synced_at, "d MMM, HH:mm")}</span>
          </p>
        )}
      </div>

      {/* ── KPI Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Respuestas", value: totalSubmissions, icon: Inbox, color: "#10b981", borderColor: "border-emerald-400" },
          { label: "Actividad 24h", value: last24Hours, icon: Activity, color: "#3b82f6", borderColor: "border-blue-400" },
          { label: "Estado", value: form.enabled ? "Activo" : "Cerrado", icon: TrendingUp, color: form.enabled ? "#10b981" : "#94a3b8", borderColor: form.enabled ? "border-emerald-400" : "border-gray-300" },
          { label: "Último registro", value: lastSubmissionDate ? formatInEcuador(lastSubmissionDate, "d MMM") : "—", icon: CalendarDays, color: "#8b5cf6", borderColor: "border-purple-400" },
        ].map((kpi, i) => (
          <div
            key={i}
            className={cn(
              "bg-white rounded-[1.5rem] px-5 py-4 border-l-4 border border-gray-100 shadow-lg shadow-gray-200/20 flex items-center justify-between gap-3",
              kpi.borderColor
            )}
          >
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">
                {kpi.label}
              </p>
              <p className="text-xl font-bold text-gray-900 leading-tight truncate">
                {kpi.value}
              </p>
            </div>
            <kpi.icon
              className="w-5 h-5 shrink-0 opacity-20"
              style={{ color: kpi.color }}
            />
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="bg-white border border-gray-100 shadow-lg shadow-gray-200/20 p-1.5 rounded-full h-auto">
            <TabsTrigger
              value="summary"
              className="rounded-full px-6 md:px-8 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300 gap-2"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger
              value="individual"
              className="rounded-full px-6 md:px-8 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300 gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Respuestas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ──────────────────────────────────────── */}
        {/* TAB: RESUMEN */}
        {/* ──────────────────────────────────────── */}
        <TabsContent value="summary" className="space-y-8 focus-visible:outline-none">

          {/* Activity chart */}
          <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="px-8 md:px-10 pt-8 pb-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-px w-6 bg-[var(--puembo-green)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                  Actividad
                </span>
              </div>
              <CardTitle className="text-2xl font-serif font-bold text-gray-900 leading-none">
                {dateFilter === "today" ? "Flujo por horas" : "Frecuencia de registros"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pt-6 pb-8 h-[280px] md:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="puemboGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--puembo-green)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--puembo-green)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 20px 40px -12px rgb(0 0 0 / 0.12)" }} />
                  <Area type="monotone" dataKey="cantidad" stroke="var(--puembo-green)" strokeWidth={2.5} fill="url(#puemboGradient)" activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Per-field charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {form.form_fields
              .filter((f) => f.type !== "section" && f.type !== "section_header" && f.type !== "separator")
              .map((field) => {
                const { data: stats, respondedCount } = getFieldStats(field.label);
                const fieldType = field.field_type || field.type;
                const isChartable = ["radio", "select", "checkbox"].includes(fieldType);
                const responseRate = totalSubmissions > 0
                  ? Math.round((respondedCount / totalSubmissions) * 100)
                  : 0;

                return (
                  <Card key={field.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                    <CardHeader className="px-8 pt-7 pb-5 border-b border-gray-50">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="px-3 py-1 rounded-full bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
                          {FIELD_TYPE_LABELS[fieldType] || fieldType}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                          {respondedCount}/{totalSubmissions}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-serif font-bold text-gray-900 leading-snug">
                        {field.label}
                      </CardTitle>
                      {/* Response rate bar */}
                      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--puembo-green)] rounded-full transition-all duration-700"
                          style={{ width: `${responseRate}%` }}
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="px-8 py-7 flex-grow">
                      {isChartable && stats.length > 0 ? (
                        <div className="space-y-6">
                          <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              {fieldType === "checkbox" ? (
                                <BarChart data={stats.sort((a, b) => a.value - b.value)} layout="vertical">
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold", fill: "#64748b" }} width={80} />
                                  <RechartsTooltip cursor={{ fill: "transparent" }} content={<CustomBarTooltip />} />
                                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
                                    {stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                  </Bar>
                                </BarChart>
                              ) : (
                                <PieChart>
                                  <Pie data={stats} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                    {stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                  </Pie>
                                  <RechartsTooltip content={<CustomPieTooltip />} />
                                </PieChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                            {stats.map((stat, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] py-1">
                                <div className="flex items-center gap-2 min-w-0 max-w-[65%]">
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                  <span className="text-gray-600 font-medium truncate">{stat.name}</span>
                                </div>
                                <span className="font-black text-gray-800 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 whitespace-nowrap">
                                  {stat.value} · {((stat.value / respondedCount) * 100).toFixed(0)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : respondedCount === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                          <Inbox className="w-8 h-8 text-gray-100" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                            Sin respuestas en este periodo
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                          {filteredSubmissions.map((s, idx) => {
                            const val = s.data[field.label];
                            const empty = isValueEmpty(val);
                            return (
                              <div key={idx} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                                <span className="text-[9px] font-black text-gray-300 mt-0.5 w-4 shrink-0 text-right">
                                  {idx + 1}
                                </span>
                                {empty ? (
                                  <span className="text-gray-300 italic text-xs">No proporcionado</span>
                                ) : typeof val === "object" && val._type === "file" ? (
                                  <FileDisplay val={val} urlCache={urlCacheRef.current} />
                                ) : (
                                  <p className="text-sm text-gray-700 leading-relaxed">{String(val)}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        {/* ──────────────────────────────────────── */}
        {/* TAB: RESPUESTAS INDIVIDUALES */}
        {/* ──────────────────────────────────────── */}
        <TabsContent value="individual" className="space-y-6 focus-visible:outline-none">
          {totalSubmissions === 0 ? (
            <div className="py-32 flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-gray-200" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Sin respuestas todavía
                </p>
                <p className="text-xs text-gray-300">Comparte el formulario para empezar a recibir datos</p>
              </div>
              <Link
                href={`/formularios/${form.slug}`}
                target="_blank"
                className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[var(--puembo-green)] hover:border-[var(--puembo-green)]/40 transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                Abrir formulario
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setExpandedId(null); }}
                  placeholder="Buscar por nombre, correo u otro dato..."
                  className="w-full h-13 py-3.5 pl-12 pr-12 rounded-[2rem] border border-gray-100 bg-white shadow-lg shadow-gray-200/10 text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--puembo-green)]/20 focus:border-[var(--puembo-green)]/30 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setExpandedId(null); }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Search result count */}
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {searchQuery
                    ? searchedSubmissions.length === 0
                      ? "Sin resultados"
                      : `${searchedSubmissions.length} resultado${searchedSubmissions.length !== 1 ? "s" : ""}`
                    : `${filteredSubmissions.length} respuesta${filteredSubmissions.length !== 1 ? "s" : ""}`}
                </p>
                {dateFilter !== "all" && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                    Filtrando por periodo
                  </span>
                )}
              </div>

              {/* Cards */}
              {searchedSubmissions.length === 0 && searchQuery ? (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                  <Search className="w-10 h-10 text-gray-100" />
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                    Sin resultados para "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {searchedSubmissions.map((s, idx) => {
                    const name = findNameInSubmission(s.data);
                    const isExpanded = expandedId === s.id;
                    const cardNumber = idx + 1;

                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "bg-white rounded-[2rem] border overflow-hidden transition-all duration-200",
                          isExpanded
                            ? "border-[var(--puembo-green)]/25 shadow-xl shadow-emerald-500/5"
                            : "border-gray-100 shadow-md shadow-gray-200/20 hover:border-gray-200 hover:shadow-lg"
                        )}
                      >
                        {/* Card header */}
                        <button
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5 text-left"
                          onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Number badge */}
                            <span className="text-[9px] font-black text-gray-300 w-6 text-right shrink-0">
                              #{cardNumber}
                            </span>
                            <div
                              className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                isExpanded
                                  ? "bg-[var(--puembo-green)] text-white"
                                  : "bg-gray-50 text-gray-300"
                              )}
                            >
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={cn(
                                "text-sm truncate font-bold text-gray-900",
                              )}>
                                {name}
                              </p>
                              <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatInEcuador(s.created_at, "d MMM yyyy · HH:mm")}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-gray-300 transition-transform duration-300 shrink-0",
                              isExpanded && "rotate-180 text-[var(--puembo-green)]"
                            )}
                          />
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="border-t border-gray-50 px-5 md:px-8 py-6 space-y-0 animate-in slide-in-from-top-1 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                              {form.form_fields.map((field) => {
                                const fieldType = field.field_type || field.type;

                                if (fieldType === "section" || fieldType === "section_header") {
                                  return (
                                    <div key={field.id} className="md:col-span-2 flex items-center gap-4 py-2 mt-2">
                                      <div className="h-px flex-1 bg-gray-100" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)] shrink-0">
                                        {field.label}
                                      </span>
                                      <div className="h-px flex-1 bg-gray-100" />
                                    </div>
                                  );
                                }

                                const val = s.data[field.label];
                                const empty = isValueEmpty(val);
                                const isFile =
                                  typeof val === "object" && val !== null && val._type === "file";

                                return (
                                  <div key={field.id} className="space-y-1.5 group">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-[var(--puembo-green)] transition-colors">
                                      {field.label}
                                    </p>
                                    <div className="min-h-[1.25rem]">
                                      {empty ? (
                                        <span className="text-gray-200 italic text-sm">
                                          No proporcionado
                                        </span>
                                      ) : isFile ? (
                                        <FileDisplay val={val} urlCache={urlCacheRef.current} />
                                      ) : Array.isArray(val) ? (
                                        <div className="flex flex-wrap gap-1.5">
                                          {val.map((v, i) => (
                                            <span
                                              key={i}
                                              className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-600"
                                            >
                                              {v}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                          {String(val)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
