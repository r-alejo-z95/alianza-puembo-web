import Link from "next/link";
import { BarChart3, CalendarDays, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatInEcuador } from "@/lib/date-utils";

export default function DelegatedFormAnalyticsList({ forms = [] }) {
  if (forms.length === 0) {
    return (
      <Card className="border-none shadow-xl bg-white rounded-[2.5rem]">
        <CardContent className="p-10 text-center space-y-4">
          <FileText className="w-10 h-10 mx-auto text-gray-300" />
          <p className="text-sm font-bold text-gray-900">
            No tienes formularios asignados.
          </p>
          <p className="text-xs text-gray-500">
            Cuando el super admin te asigne uno, aparecera aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {forms.map((form) => (
        <Card
          key={form.id}
          className="border border-gray-100 shadow-xl bg-white rounded-[2rem] overflow-hidden"
        >
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)]">
                <FileText className="w-3.5 h-3.5" />
                Formulario asignado
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                {form.title}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <CalendarDays className="w-3.5 h-3.5" />
                {form.created_at
                  ? formatInEcuador(form.created_at, "d MMM yyyy")
                  : "Sin fecha"}
              </div>
            </div>
            <Button
              asChild
              variant="green"
              className="w-full rounded-full h-12 text-xs font-black uppercase tracking-widest"
            >
              <Link href={`/admin/formularios/analiticas/${form.slug}`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Abrir analiticas
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
