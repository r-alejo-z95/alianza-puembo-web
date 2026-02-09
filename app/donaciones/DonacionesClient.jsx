"use client";

import { motion } from "framer-motion";
import { Mail, Landmark, User, Clipboard, Check } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const commonDetails = {
  ruc: "0991263217001",
  email: "contabilidadiglesia@alianzapuembo.org",
};

const donationSections = [
  {
    title: "Diezmos & Ofrendas",
    description: "Para el sostenimiento de la obra local y ministerios.",
    accounts: [
      {
        bank: "Banco del Pacífico",
        type: "Cuenta corriente",
        number: "7469640",
        name: "Iglesia Evangélica Ecuatoriana",
      },
      {
        bank: "Banco del Pichincha",
        type: "Cuenta corriente",
        number: "2100268002",
        name: "Iglesia Evangélica Ecuatoriana",
      },
    ],
  },
  {
    title: "Pago Eventos",
    description: "Exclusivo para inscripciones a retiros y actividades.",
    accounts: [
      {
        bank: "Banco del Pichincha",
        type: "Cuenta ahorros",
        number: "2208033009",
        name: "Iglesia Alianza Puembo",
      },
    ],
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-[var(--puembo-green)] cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{copied ? "Copiado" : "Copiar"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DonacionesClient() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-10 md:pt-12 pb-24 space-y-16 md:space-y-24")}>
      {/* Información General */}
      <section className="max-w-7xl mx-auto w-full space-y-12 md:space-y-16">
        <div className="flex items-center gap-4 md:gap-6 px-2 md:px-4">
          <h2 className="text-xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Cuentas Bancarias
          </h2>
          <div className="h-1 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1 w-8 md:w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Info Transversal */}
          <motion.div
            {...fadeIn}
            className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-md border border-gray-100 mx-2 md:mx-0"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-gray-50 rounded-xl text-gray-400">
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col grow min-w-0">
                <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                  RUC para transferencias
                </span>
                <span className="text-base md:text-lg font-bold text-gray-900">
                  {commonDetails.ruc}
                </span>
              </div>
              <CopyButton text={commonDetails.ruc} />
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-gray-50 rounded-xl text-gray-400">
                <Mail className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col grow min-w-0">
                <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Comprobantes
                </span>
                <span className="text-sm font-bold text-gray-900 truncate">
                  {commonDetails.email}
                </span>
              </div>
              <CopyButton text={commonDetails.email} />
            </div>
          </motion.div>

          {/* Secciones de Donación */}
          {donationSections.map((section, sIndex) => (
            <div
              key={section.title}
              className={cn(
                "space-y-4 md:space-y-6",
                sIndex === 0 ? "lg:col-span-2" : "lg:col-span-1"
              )}
            >
              <div className="px-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  {section.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">{section.description}</p>
              </div>

              <div
                className={cn(
                  "grid gap-4 md:gap-6",
                  sIndex === 0 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}
              >
                {section.accounts.map((account, aIndex) => (
                  <motion.div
                    key={account.number}
                    {...fadeIn}
                    transition={{ delay: aIndex * 0.1 }}
                    className="mx-2 md:mx-0"
                  >
                    <Card className="border-none shadow-lg bg-white hover:shadow-xl transition-all duration-300 rounded-2xl md:rounded-3xl overflow-hidden group h-full">
                      <CardHeader className="bg-gray-50/50 p-5 md:p-6 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                          <Landmark className="w-5 h-5 text-[var(--puembo-green)]" />
                          <CardTitle className="text-sm md:text-base font-bold text-gray-900">
                            {account.bank}
                          </CardTitle>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-gray-300 group-hover:text-[var(--puembo-green)]/20 transition-colors">
                          Digital
                        </span>
                      </CardHeader>
                      <CardContent className="p-5 md:p-6 space-y-4">
                        <div className="space-y-1">
                          <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Tipo de Cuenta
                          </p>
                          <p className="text-xs md:text-sm font-medium text-gray-700">
                            {account.type}
                          </p>
                        </div>
                        <div className="space-y-1 bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex flex-col min-w-0">
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Número
                            </p>
                            <p className="text-base md:text-lg font-mono font-bold text-[var(--puembo-green)] tracking-tight">
                              {account.number}
                            </p>
                          </div>
                          <CopyButton text={account.number} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            A nombre de
                          </p>
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {account.name}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Versículo Destacado */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-(--puembo-green) text-white overflow-hidden relative rounded-2xl md:rounded-3xl shadow-2xl mx-2 md:mx-auto max-w-6xl"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16 text-center relative z-10">
          <motion.h2
            {...fadeIn}
            className={cn(sectionTitle, "mb-4 md:mb-6 text-white text-xl md:text-3xl")}
          >
            Malaquías 3:10
          </motion.h2>
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-lg max-w-3xl mx-auto leading-relaxed text-green-50 font-medium italic"
          >
            &quot;Traigan íntegro el diezmo para los fondos del templo, y así
            habrá alimento en mi casa. Pruébenme en esto —dice el Señor
            Todopoderoso—, y vean si no abro las compuertas del cielo y derramo
            sobre ustedes bendición hasta que sobreabunde.&quot;
          </motion.p>
        </div>
      </motion.section>
    </div>
  );
}
