"use client";

import { useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  User,
  Inbox,
  TrendingUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { subDays, subHours, format } from "date-fns";
import { formatInEcuador, getNowInEcuador } from "@/lib/date-utils";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { cn } from "@/lib/utils.ts";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

const FIELD_TYPE_LABELS = {
  text: "Texto Corto",
  textarea: "Párrafo",
  number: "Número",
  email: "Correo Electrónico",
  date: "Fecha",
  radio: "Opción Única",
  checkbox: "Casillas",
  file: "Archivo",
  image: "Imagen",
};

// Custom Tooltip para BarChart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white px-4 py-2 rounded-xl shadow-2xl border-none text-[10px] font-black uppercase tracking-widest">
        <p className="mb-1 opacity-60">{label}</p>
        <p className="text-[var(--puembo-green)]">
          {payload[0].value} respuestas
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip para PieChart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-black text-white px-4 py-2 rounded-xl shadow-2xl border-none text-[10px] font-black uppercase tracking-widest">
        <p className="mb-1 opacity-60">{name}</p>
        <p className="text-[var(--puembo-green)]">{value} respuestas</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard({
  form,
  submissions: allSubmissions,
}) {
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("summary");
  const [individualIndex, setIndividualIndex] = useState(0);
  const { isSm } = useScreenSize();

  // 1. Filtrar los datos según el periodo seleccionado (Ecuador Time Safe)
  const filteredSubmissions = useMemo(() => {
    const nowUtc = new Date();
    switch (dateFilter) {
      case "today": {
        const todayStr = formatInEcuador(nowUtc, "yyyy-MM-dd");
        return allSubmissions.filter(
          (s) => formatInEcuador(s.created_at, "yyyy-MM-dd") === todayStr
        );
      }
      case "7days": {
        const sevenDaysAgo = subDays(nowUtc, 7);
        return allSubmissions.filter(
          (s) => new Date(s.created_at) >= sevenDaysAgo
        );
      }
      case "30days": {
        const thirtyDaysAgo = subDays(nowUtc, 30);
        return allSubmissions.filter(
          (s) => new Date(s.created_at) >= thirtyDaysAgo
        );
      }
      default:
        return allSubmissions;
    }
  }, [allSubmissions, dateFilter]);

  const totalSubmissions = filteredSubmissions.length;

  const last24Hours = useMemo(() => {
    const nowUtc = new Date();
    const twentyFourHoursAgo = subHours(nowUtc, 24);
    return allSubmissions.filter(
      (s) => new Date(s.created_at) > twentyFourHoursAgo
    ).length;
  }, [allSubmissions]);

  // 2. Procesar datos para gráfico de actividad
  const activityData = useMemo(() => {
    const nowEcuador = getNowInEcuador();
    if (dateFilter === "today") {
      return Array.from({ length: 24 }, (_, i) => {
        const hourStr = i.toString().padStart(2, "0") + ":00";
        const count = allSubmissions.filter((s) => {
          const sDate = formatInEcuador(s.created_at, "yyyy-MM-dd");
          const sHour = parseInt(formatInEcuador(s.created_at, "H"));
          return sDate === format(nowEcuador, "yyyy-MM-dd") && sHour === i;
        }).length;
        return { date: hourStr, cantidad: count };
      });
    }
    const rangeSize =
      dateFilter === "30days" ? 30 : dateFilter === "7days" ? 7 : 14;
    const days = Array.from({ length: rangeSize }, (_, i) =>
      format(subDays(nowEcuador, i), "yyyy-MM-dd")
    ).reverse();
    return days.map((day) => ({
      date: formatInEcuador(new Date(day + "T12:00:00"), "d MMM"),
      cantidad: allSubmissions.filter(
        (s) => formatInEcuador(s.created_at, "yyyy-MM-dd") === day
      ).length,
    }));
  }, [allSubmissions, dateFilter]);

  // Helper robusto para detectar si un valor está vacío
  const isValueEmpty = (val) => {
    if (val === undefined || val === null || val === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    if (typeof val === "object" && val !== null) {
      // Si es un objeto de archivo pero no tiene nombre, está vacío
      if (val._type === "file") return !val.name;
      // Si es cualquier otro objeto sin llaves, está vacío
      if (Object.keys(val).length === 0) return true;
      // Caso especial: si es un objeto pero todos sus valores son vacíos/falsos
      return Object.values(val).every(
        (v) => v === "" || v === null || v === undefined || v === false
      );
    }
    return false;
  };

  // 3. Helper para estadísticas por pregunta
  const getFieldStats = (fieldLabel) => {
    const counts = {};
    let respondedCount = 0;
    filteredSubmissions.forEach((s) => {
      const val = s.data[fieldLabel];
      if (isValueEmpty(val)) return;

      respondedCount++;
      if (Array.isArray(val)) {
        val.forEach((v) => {
          counts[v] = (counts[v] || 0) + 1;
        });
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

  const currentIndividual = filteredSubmissions[individualIndex];

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-1000 max-w-7xl mx-auto px-4">
      {/* Header Estilo Admin Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div className="space-y-4">
          <Link
            href="/admin/formularios"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Inventario de Formularios
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight leading-none">
              Analíticas{" "}
              <span className="text-[var(--puembo-green)] italic">
                de Datos
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-gray-400 font-light text-base">
              <span>Resultados del formulario:</span>
              <Link
                href={`/formularios/${form.slug}`}
                target="_blank"
              >
                <span className="font-medium text-gray-600 border-b-2 border-[var(--puembo-green)]/20 hover:text-[var(--puembo-green)] transition-colors">
                  {form.title}
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20">
          <div className="hidden sm:flex items-center gap-3 px-5 py-2 border-r border-gray-100">
            <Filter className="w-3.5 h-3.5 text-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Periodo
            </span>
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-[200px] border-none bg-transparent shadow-none focus:ring-0 font-black text-[10px] uppercase tracking-[0.2em]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl bg-black text-white">
              <SelectItem
                value="all"
                className="rounded-xl focus:bg-[var(--puembo-green)] focus:text-white"
              >
                Todo el histórico
              </SelectItem>
              <SelectItem
                value="today"
                className="rounded-xl focus:bg-[var(--puembo-green)] focus:text-white"
              >
                Hoy
              </SelectItem>
              <SelectItem
                value="7days"
                className="rounded-xl focus:bg-[var(--puembo-green)] focus:text-white"
              >
                7 días
              </SelectItem>
              <SelectItem
                value="30days"
                className="rounded-xl focus:bg-[var(--puembo-green)] focus:text-white"
              >
                30 días
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-16 md:mb-20">
          <TabsList className="bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50 backdrop-blur-sm h-auto flex-nowrap justify-center max-w-full">
            <TabsTrigger
              value="summary"
              className="rounded-full px-6 md:px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-500 shrink-0"
            >
              <PieIcon className="w-3.5 h-3.5 md:mr-2" />{" "}
              <span className="hidden md:inline">Resumen Estadístico</span>
              <span className="md:hidden">Resumen</span>
            </TabsTrigger>
            <TabsTrigger
              value="individual"
              className="rounded-full px-6 md:px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-500 shrink-0"
            >
              <User className="w-3.5 h-3.5 md:mr-2" />{" "}
              <span className="hidden md:inline">Respuestas Individuales</span>
              <span className="md:hidden">Individual</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- CONTENIDO: RESUMEN --- */}
        <TabsContent
          value="summary"
          className="space-y-12 focus-visible:outline-none"
        >
          {/* Fila de KPIs rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                label: "Respuestas",
                value: totalSubmissions,
                icon: Inbox,
                bg: "bg-green-50",
                color: "var(--puembo-green)",
              },
              {
                label: "Actividad 24h",
                value: last24Hours,
                icon: Activity,
                bg: "bg-blue-50",
                color: "#3b82f6",
              },
              {
                label: "Estado",
                value: form.enabled ? "Activo" : "Cerrado",
                icon: TrendingUp,
                bg: "bg-amber-50",
                color: "#f59e0b",
              },
            ].map((kpi, i) => (
              <Card
                key={i}
                className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden group"
              >
                <CardContent className="p-8 flex items-center gap-6">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6",
                      kpi.bg
                    )}
                  >
                    <kpi.icon
                      className="w-8 h-8"
                      style={{ color: kpi.color }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {kpi.label}
                    </p>
                    <h3 className="text-3xl font-serif font-bold text-gray-900">
                      {kpi.value}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico de Actividad General */}
          <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 md:p-10 pb-0 border-b border-gray-50 bg-gray-50/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                  Rendimiento
                </span>
              </div>
              <CardTitle className="text-3xl font-serif font-bold text-gray-900 leading-none pb-6">
                {dateFilter === "today"
                  ? "Flujo por Horas"
                  : "Frecuencia de Registros"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12 h-[350px] md:h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient
                      id="puemboGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--puembo-green)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--puembo-green)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "1.5rem",
                      border: "none",
                      boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cantidad"
                    stroke="var(--puembo-green)"
                    strokeWidth={3}
                    fill="url(#puemboGradient)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráficos por Pregunta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {form.form_fields
              .filter((f) => f.type !== "section")
              .map((field) => {
                const { data: stats, respondedCount } = getFieldStats(
                  field.label
                );
              const fieldType = field.field_type || field.type;
              const isChartable = ["radio", "select", "checkbox"].includes(
                fieldType
              );

              return (
                <Card
                  key={field.id}
                  className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden flex flex-col hover:shadow-emerald-500/5 transition-all"
                >
                  <CardHeader className="p-8 md:p-10 pb-6 border-b border-gray-50 bg-gray-50/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-white text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 shadow-sm">
                          {FIELD_TYPE_LABELS[fieldType] || fieldType}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 italic">
                          {respondedCount} respuestas
                        </span>
                      </div>
                      <CardTitle className="text-xl font-serif font-bold text-gray-900 leading-tight tracking-tight">
                        {field.label}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 md:p-10 flex-grow">
                    {isChartable && stats.length > 0 ? (
                      <div className="flex flex-col space-y-8">
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            {fieldType === "checkbox" ? (
                              <BarChart
                                data={stats.sort((a, b) => a.value - b.value)}
                                layout="vertical"
                              >
                                <XAxis type="number" hide />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{
                                    fontSize: 10,
                                    fontWeight: "bold",
                                    fill: "#64748b",
                                  }}
                                  width={50}
                                />
                                <RechartsTooltip
                                  cursor={{ fill: "transparent" }}
                                  content={<CustomBarTooltip />}
                                />
                                <Bar
                                  dataKey="value"
                                  radius={[0, 10, 10, 0]}
                                  barSize={20}
                                  stroke="none"
                                >
                                  {stats.map((_, index) => (
                                    <Cell
                                      key={index}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            ) : (
                              <PieChart>
                                <Pie
                                  data={stats}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={85}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {stats.map((_, index) => (
                                    <Cell
                                      key={index}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  content={<CustomPieTooltip />}
                                />
                              </PieChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                          {stats.map((stat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] py-1"
                            >
                              <div className="flex items-center gap-2 max-w-[70%]">
                                <div
                                  className="w-2 h-2 rounded-full shrink-0 style={{backgroundColor: COLORS[idx % COLORS.length]}}"
                                  style={{
                                    backgroundColor:
                                      COLORS[idx % COLORS.length],
                                  }}
                                />
                                <span className="text-gray-600 font-medium truncate">
                                  {stat.name}
                                </span>
                              </div>
                              <span className="font-black text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 whitespace-nowrap">
                                {stat.value} (
                                {((stat.value / respondedCount) * 100).toFixed(
                                  1
                                )}
                                %)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredSubmissions.length > 0 ? (
                          filteredSubmissions.slice(0, 10).map((s, idx) => {
                            const val = s.data[field.label];
                            const empty = isValueEmpty(val);

                            return (
                              <div
                                key={idx}
                                className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm text-sm group hover:bg-white transition-all overflow-hidden"
                              >
                                {empty ? (
                                  <span className="text-gray-300 italic font-light">
                                    No proporcionado
                                  </span>
                                ) : typeof val === "object" &&
                                  val._type === "file" ? (
                                  <a
                                    href={val.url || val.webViewLink || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[var(--puembo-green)] font-bold truncate hover:underline"
                                  >
                                    <FileText className="w-4 h-4 shrink-0" />{" "}
                                    <span className="truncate">{val.name}</span>
                                  </a>
                                ) : (
                                  <p className="text-gray-700 font-light leading-relaxed italic truncate">
                                    "{String(val)}"
                                  </p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-12 text-center flex flex-col items-center gap-3">
                            <Inbox className="w-10 h-10 text-gray-100" />
                            <p className="text-xs text-gray-400 italic uppercase font-bold tracking-widest">
                              Sin respuestas en este periodo
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* --- CONTENIDO: INDIVIDUAL --- */}
        <TabsContent
          value="individual"
          className="space-y-8 focus-visible:outline-none"
        >
          {totalSubmissions > 0 ? (
            <div className="space-y-8">
              {/* Navegador de respuestas */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/20 sticky top-24 z-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--puembo-green)] shadow-inner shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Expediente
                    </p>
                    <div className="text-sm font-bold truncate">
                      Respuesta{" "}
                      <span className="text-[var(--puembo-green)] px-1">
                        {individualIndex + 1}
                      </span>{" "}
                      de {totalSubmissions}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-grow sm:flex-none rounded-full h-12 px-6 border-gray-100 shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
                    disabled={individualIndex === 0}
                    onClick={() => setIndividualIndex((prev) => prev - 1)}
                  >
                    <ChevronLeft
                      className={cn("w-4 h-4", !isSm && "md:mr-2")}
                    />
                    {!isSm && "Anterior"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-grow sm:flex-none rounded-full h-12 px-6 border-gray-100 shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
                    disabled={individualIndex === totalSubmissions - 1}
                    onClick={() => setIndividualIndex((prev) => prev + 1)}
                  >
                    {!isSm && "Siguiente"}
                    <ChevronRight
                      className={cn("w-4 h-4", !isSm && "md:ml-2")}
                    />
                  </Button>
                </div>
              </div>

              {/* Vista del Formulario Individual Estilo Editorial */}
              <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                <div className="p-8 md:p-16 border-b border-gray-50 bg-gray-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-px w-8 bg-[var(--puembo-green)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                        Registro Individual
                      </span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 leading-none">
                      Respuesta #{individualIndex + 1}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm shadow-gray-200/10 max-w-full overflow-hidden">
                    <Clock className="w-5 h-5 text-gray-200 shrink-0" />
                    <div className="text-left leading-tight min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Marca Temporal
                      </p>
                      <p className="text-[11px] md:text-xs font-bold text-gray-600 truncate">
                        {formatInEcuador(
                          currentIndividual.created_at,
                          "d MMM, yyyy · HH:mm:ss"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-20 space-y-16">
                  {form.form_fields.map((field) => {
                    const fieldType = field.field_type || field.type;

                    // SEPARADOR DE SECCIÓN EN VISTA INDIVIDUAL
                    if (fieldType === "section") {
                      return (
                        <div
                          key={field.id}
                          className="pt-10 border-b border-gray-100 pb-4"
                        >
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)] block mb-2">
                            Bloque de Información
                          </span>
                          <h3 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
                            {field.label}
                          </h3>
                        </div>
                      );
                    }

                    const val = currentIndividual.data[field.label];
                    const empty = isValueEmpty(val);
                    const isFile =
                      typeof val === "object" &&
                      val !== null &&
                      val._type === "file";

                    return (
                      <div key={field.id} className="group space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-[var(--puembo-green)] transition-colors">
                            {field.label}
                          </span>
                        </div>
                        <div className="min-h-[2rem]">
                          {empty ? (
                            <span className="text-gray-200 italic font-light text-xl md:text-2xl">
                              No proporcionado
                            </span>
                          ) : isFile ? (
                            <a
                              href={val.url || val.webViewLink || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-5 p-6 bg-emerald-50/50 rounded-[2rem] w-fit border border-emerald-100 shadow-inner group/file transition-all max-w-full overflow-hidden hover:bg-emerald-100/50"
                            >
                              <div className="p-4 bg-white rounded-2xl shadow-sm group-hover/file:rotate-6 transition-transform shrink-0">
                                <FileText className="w-6 h-6 text-[var(--puembo-green)]" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-base font-bold text-emerald-900 leading-tight truncate">
                                  {val.name}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)] opacity-60 mt-1">
                                  {val.info || "Archivo adjunto"}
                                </span>
                              </div>
                            </a>
                          ) : Array.isArray(val) ? (
                            <div className="flex flex-wrap gap-3 pt-2">
                              {val.map((v, i) => (
                                <span
                                  key={i}
                                  className="px-5 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600 shadow-sm"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-light font-serif italic whitespace-pre-wrap break-words">
                              "{String(val)}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4 shadow-inner">
              <Inbox className="w-16 h-16 text-gray-100" />
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                No hay respuestas en este periodo
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
