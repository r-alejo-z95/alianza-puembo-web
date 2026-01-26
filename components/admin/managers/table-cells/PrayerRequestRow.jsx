import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OverflowCell } from "./OverflowCell";
import {
  Trash2,
  Edit,
  Calendar,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import PrayerRequestStatusDialog from "../../forms/PrayerRequestStatusDialog";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatInEcuador } from "@/lib/date-utils";
import { cn } from "@/lib/utils.ts";
import Link from "next/link";
import { AdminEditorPanel } from "@/components/admin/layout/AdminEditorPanel";

export function PrayerRequestRow({
  request,
  onDelete,
  onStatusChange,
  compact,
}) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const statusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
            Pendiente
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
            Aprobada
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-50 text-red-600 border-red-100 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
            Rechazada
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="rounded-full px-3 text-[10px] uppercase"
          >
            Desconocido
          </Badge>
        );
    }
  };

  const isApprovedAndPublic =
    request.is_public && request.status === "approved";
  const publicHref = isApprovedAndPublic ? `/oracion#${request.id}` : undefined;

  const actions = (
    <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
      {request.is_public ? (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl flex-1 lg:flex-none text-[var(--puembo-green)] lg:text-black hover:bg-[var(--puembo-green)]/10 lg:hover:text-[var(--puembo-green)] transition-all duration-300"
          onClick={() => setIsStatusDialogOpen(true)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          disabled
          variant="ghost"
          size="icon"
          className="opacity-20 rounded-xl flex-1 lg:flex-none px-4 lg:px-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest lg:hidden italic">
            Interna
          </span>
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl flex-1 lg:flex-none text-red-500 lg:text-black hover:bg-red-50 lg:hover:text-red-500 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-2xl font-serif font-bold text-gray-900">
              ¿Mover a la papelera?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-light leading-relaxed">
              Esta petición dejará de ser visible en los registros activos, pero podrás restaurarla desde la papelera si lo necesitas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-full border-gray-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(request.id)}
              className="rounded-full bg-red-500 hover:bg-red-600"
            >
              Mover a papelera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminEditorPanel
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        title="Estado de Petición"
        description="Modera la visibilidad de esta petición en el muro público."
      >
        <div className="md:p-12">
          <PrayerRequestStatusDialog
            request={request}
            onStatusChange={onStatusChange}
            onClose={() => setIsStatusDialogOpen(false)}
          />
        </div>
      </AdminEditorPanel>
    </div>
  );

  const formattedDate = formatInEcuador(request.created_at, "d 'de' MMM, yyyy");
  const formattedTime = formatInEcuador(request.created_at, "HH:mm");

  if (compact) {
    return (
      <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 space-y-3 relative group">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
                {request.is_public ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-blue-500" />}
                <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    request.is_public ? "text-emerald-600" : "text-blue-600"
                )}>
                    {request.is_public ? "Pública" : "Privada"}
                </span>
            </div>
            <OverflowCell 
              href={publicHref}
              linkText="Ver en muro"
              className="text-base font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors whitespace-normal break-words leading-tight"
            >
              {request.request_text}
            </OverflowCell>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                <User className="w-3 h-3 text-gray-400" />
                {request.is_anonymous ? "Anónimo" : (request.name || "N/A")}
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                    <Calendar className="w-2.5 h-2.5" /> {formattedDate}
                </div>
                {request.is_public && statusBadge(request.status)}
            </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-gray-50">
            <div className="w-full">{actions}</div>
        </div>
      </div>
    );
  }

  return (
    <TableRow className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
      <TableCell className="px-8 py-6 w-1/3">
        <div className="max-w-[350px]">
          <OverflowCell
            href={publicHref}
            linkText="Ver en muro"
            className="text-sm font-medium text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors italic"
          >
            {request.request_text}
          </OverflowCell>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col max-w-[150px]">
            <OverflowCell className="text-sm font-bold text-gray-700">
              {request.is_anonymous ? "Anónimo" : request.name || "N/A"}
            </OverflowCell>
            <OverflowCell className="text-[10px] text-gray-400 uppercase tracking-widest">
              {request.email || "Sin email"}
            </OverflowCell>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Calendar className="w-3 h-3 text-[var(--puembo-green)]" />{" "}
            {formattedDate}
          </div>
          <p className="text-[10px] text-gray-400 ml-5">{formattedTime}</p>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-center">
        {request.is_public ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
            <Eye className="w-3 h-3" /> Pública
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
            <EyeOff className="w-3 h-3" /> Privada
          </div>
        )}
      </TableCell>
      <TableCell className="px-8 py-6 text-center">
        {request.is_public ? (
          statusBadge(request.status)
        ) : (
          <span className="text-[10px] font-black text-gray-200 uppercase tracking-[0.3em]">
            Interna
          </span>
        )}
      </TableCell>
      <TableCell className="px-8 py-6">{actions}</TableCell>
    </TableRow>
  );
}
