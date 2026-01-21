"use client";

import { useMemo } from "react";
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
  Users, 
  Calendar, 
  Activity, 
  ArrowLeft,
  FileText,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { subDays, subHours, format } from "date-fns";
import { formatInEcuador, getNowInEcuador } from "@/lib/date-utils";
import { cn } from "@/lib/utils.ts";

const COLORS = ["#82ca9d", "#8884d8", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AnalyticsDashboard({ form, submissions }) {
  
  // 1. Procesar datos para KPI Cards
  const totalSubmissions = submissions.length;
  const last24Hours = useMemo(() => {
    const nowUtc = new Date(); // Fecha real UTC
    const twentyFourHoursAgo = subHours(nowUtc, 24);
    
    return submissions.filter(s => {
      const submissionDate = new Date(s.created_at); // s.created_at es ISO UTC string
      return submissionDate > twentyFourHoursAgo;
    }).length;
  }, [submissions]);

  // 2. Procesar datos para gráfico de tendencia (Últimos 14 días)
  const chartData = useMemo(() => {
    // Generar los últimos 14 días en formato string local de Ecuador para comparación
    const nowEcuador = getNowInEcuador(); // Esto nos da un objeto Date cuya hora "local" es la de Ecuador
    
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = subDays(nowEcuador, i);
      // Extraemos el string YYYY-MM-DD sin desplazamientos adicionales
      return format(d, "yyyy-MM-dd"); 
    }).reverse();

    return days.map(day => {
      // Formatear la etiqueta para el gráfico (ej: "21 Ene")
      // Creamos una fecha temporal para formatear el nombre del día
      const [y, m, d] = day.split("-").map(Number);
      const dateForLabel = new Date(y, m - 1, d);
      const dayLabel = formatInEcuador(dateForLabel, "d MMM");

      const count = submissions.filter(s => 
        formatInEcuador(s.created_at, "yyyy-MM-dd") === day
      ).length;

      return {
        date: dayLabel,
        cantidad: count
      };
    });
  }, [submissions]);

  // 3. Helper para procesar respuestas de una pregunta específica
  const getFieldStats = (fieldLabel, fieldType) => {
    const counts = {};
    submissions.forEach(s => {
      const val = s.data[fieldLabel];
      if (val === undefined || val === null) return;

      if (Array.isArray(val)) {
        // Para checkboxes
        val.forEach(v => {
          counts[v] = (counts[v] || 0) + 1;
        });
      } else {
        counts[val] = (counts[val] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/admin/formularios" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Volver a Formularios
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">
            Analíticas: <span className="text-[var(--puembo-green)] italic">{form.title}</span>
          </h1>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-[var(--puembo-green)] group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all duration-500">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Respuestas</p>
              <h3 className="text-4xl font-bold text-gray-900">{totalSubmissions}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Últimas 24h</p>
              <h3 className="text-4xl font-bold text-gray-900">{last24Hours}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</p>
              <h3 className={cn(
                "text-2xl font-bold uppercase tracking-tight",
                form.enabled ? "text-emerald-600" : "text-gray-400"
              )}>
                {form.enabled ? "Activo" : "Cerrado"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencia Chart */}
      <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">Actividad</span>
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-gray-900">Tendencia de Registros</CardTitle>
        </CardHeader>
        <CardContent className="p-10 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--puembo-green)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--puembo-green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}}
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="cantidad" 
                stroke="var(--puembo-green)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorGreen)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grid de Preguntas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {form.form_fields.map((field) => {
          const stats = getFieldStats(field.label, field.field_type);
          const fieldType = field.field_type || field.type;
          const isRequired = field.required || field.is_required;
          
          // Clasificación de tipos de visualización
          const isPieChart = ["radio", "select"].includes(fieldType);
          const isBarChart = fieldType === "checkbox";
          const isDateHistogram = fieldType === "date";
          const isChartable = isPieChart || isBarChart || isDateHistogram;

          return (
            <Card key={field.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
              <CardHeader className="p-10 pb-6 border-b border-gray-50 bg-gray-50/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-500">
                      {fieldType}
                    </span>
                    {isRequired && (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-[8px] font-black uppercase tracking-widest text-red-500 border border-red-100">
                        Obligatorio
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-gray-900 leading-tight">
                    {field.label}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-10 flex-grow">
                {isChartable && stats.length > 0 ? (
                  <div className="h-[300px] w-full flex flex-col">
                    <ResponsiveContainer width="100%" height="100%">
                      {isPieChart ? (
                        <PieChart>
                          <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                        </PieChart>
                      ) : (
                        <BarChart 
                          data={stats.sort((a, b) => b.value - a.value)} 
                          layout={isBarChart ? "vertical" : "horizontal"}
                          margin={{ left: isBarChart ? 40 : 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={!isBarChart} vertical={isBarChart} stroke="#f0f0f0" />
                          {isBarChart ? (
                            <>
                              <XAxis type="number" hide />
                              <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 'bold', fill: '#6b7280'}}
                                width={100}
                              />
                            </>
                          ) : (
                            <>
                              <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 'bold', fill: '#6b7280'}}
                              />
                              <YAxis axisLine={false} tickLine={false} hide />
                            </>
                          )}
                          <RechartsTooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[0, 10, 10, 0]} 
                            fill="var(--puembo-green)"
                            barSize={isBarChart ? 20 : undefined}
                          >
                            {stats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={isBarChart ? COLORS[index % COLORS.length] : "var(--puembo-green)"} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                    
                    <div className="mt-6 space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                      {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                            <span className="font-bold text-gray-600 truncate max-w-[180px]">{stat.name}</span>
                          </div>
                          <span className="font-black text-gray-900">
                            {stat.value} {fieldType === "checkbox" ? "" : `(${totalSubmissions > 0 ? ((stat.value / totalSubmissions) * 100).toFixed(1) : 0}%)`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !isChartable ? (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                    {submissions.length > 0 ? submissions.slice(0, 15).map((s, idx) => {
                      const val = s.data[field.label];
                      if (val === undefined || val === null || val === "") return null;
                      
                      // Manejar objetos (como archivos) o valores simples
                      const isFile = typeof val === 'object' && val !== null && val._type === 'file';
                      const isEmptyObject = typeof val === 'object' && val !== null && Object.keys(val).length === 0;
                      const isObject = typeof val === 'object' && val !== null && !Array.isArray(val) && !isFile && !isEmptyObject;
                      
                      const submissionDate = formatInEcuador(s.created_at, "d MMM, HH:mm");

                      return (
                        <div key={idx} className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white transition-colors group/item">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-grow">
                              <div className={cn(
                                "text-sm leading-relaxed",
                                isFile ? "text-[var(--puembo-green)] font-bold flex items-center gap-2" : "text-gray-700 font-light"
                              )}>
                                {isFile ? (
                                  <>
                                    <FileText className="w-4 h-4" /> 
                                    <div className="flex flex-col">
                                      <span>{val.name}</span>
                                      <span className="text-[10px] uppercase font-black opacity-40">{val.info}</span>
                                    </div>
                                  </>
                                ) : isEmptyObject ? (
                                  <span className="text-gray-300 italic">No proporcionado</span>
                                ) : Array.isArray(val) ? (
                                  val.join(", ")
                                ) : isObject ? (
                                  JSON.stringify(val)
                                ) : (
                                  String(val)
                                )}
                              </div>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-300 group-hover/item:text-[var(--puembo-green)] transition-colors whitespace-nowrap">
                              {submissionDate}
                            </span>
                          </div>
                        </div>
                      );
                    }) : <p className="text-gray-400 italic text-center py-10">Sin respuestas aún.</p>}
                    {submissions.length > 15 && (
                      <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 pt-4">
                        Mostrando las últimas 15 de {submissions.length} respuestas
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200">
                      <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Esperando datos para visualizar...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
