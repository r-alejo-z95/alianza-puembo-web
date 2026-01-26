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
import { OverflowCell } from "./OverflowCell";
import {
  Edit,
  Trash2,
  FolderOpen,
  Calendar,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatInEcuador } from "@/lib/date-utils";
import { AuthorAvatar } from "@/components/shared/AuthorAvatar";
import { cn } from "@/lib/utils.ts";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function FormRow({ form, onEdit, onDelete, compact }) {
  const [isEnabled, setEnabled] = useState(form.enabled ?? true);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const handleToggleEnabled = async (checked) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("forms")
      .update({ enabled: checked })
      .eq("id", form.id);

    if (error) {
      toast.error("Error al actualizar el estado.");
      console.error(error);
    } else {
      setEnabled(checked);
      toast.success(
        checked ? "Formulario habilitado" : "Formulario deshabilitado"
      );
    }
    setIsUpdating(false);
  };

  const sheetLinkActions = form.google_sheet_url ? (
    <div className="flex items-center justify-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={form.google_sheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 lg:p-2 rounded-xl bg-emerald-50 text-emerald-600 lg:text-black lg:hover:bg-emerald-500 lg:hover:text-white transition-all duration-300 shadow-sm shadow-emerald-500/10"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">Ver Hoja</span>
            </a>
          </TooltipTrigger>
          <TooltipContent>Abrir Hoja de Cálculo</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ) : (
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
      -
    </span>
  );

  const folderLinkActions = form.google_drive_folder_id ? (
    <div className="flex items-center justify-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`https://drive.google.com/drive/folders/${form.google_drive_folder_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 lg:p-2 rounded-xl bg-blue-50 text-blue-600 lg:text-black lg:hover:bg-blue-500 lg:hover:text-white transition-all duration-300 shadow-sm shadow-blue-500/10"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">Ver Carpeta</span>
            </a>
          </TooltipTrigger>
          <TooltipContent>Abrir Carpeta Drive</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ) : (
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
      -
    </span>
  );

  const actions = (
    <div className="flex items-center justify-end lg:justify-center gap-2 w-full lg:w-auto">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/admin/formularios/analiticas/${form.slug}`} className="flex-1 lg:flex-none">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl w-full text-blue-600 lg:text-black hover:bg-blue-50 lg:hover:text-blue-600 transition-all duration-300 gap-2 px-4 lg:px-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">Ver Analíticas</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Ver Analíticas</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(form)}
        className="rounded-xl flex-1 lg:flex-none text-[var(--puembo-green)] lg:text-black hover:bg-[var(--puembo-green)]/10 lg:hover:text-[var(--puembo-green)] transition-all duration-300"
      >
        <Edit className="w-4 h-4" />
      </Button>
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
                    Este formulario dejará de estar disponible para el público, pero podrás restaurarlo desde la papelera de reciclaje si lo necesitas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-6">
                  <AlertDialogCancel className="rounded-full border-gray-100">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(form.id)}
                    className="rounded-full bg-red-500 hover:bg-red-600"
                  >
                    Mover a papelera
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
    </div>
  );

  const formattedDate = formatInEcuador(form.created_at, "d 'de' MMM, yyyy");

  if (compact) {
    return (
      <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 space-y-3 relative group">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <span className="text-[9px] font-black text-[var(--puembo-green)] uppercase tracking-widest">
              Formulario
            </span>
            <OverflowCell
              href={`/formularios/${form.slug}`}
              linkText="Ver formulario"
              className="text-lg font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors whitespace-normal break-words leading-tight"
            >
              {form.title}
            </OverflowCell>
          </div>
          <AuthorAvatar
            profile={form.profiles}
            className="h-8 w-8 border-2 border-white shadow-sm shrink-0"
          />
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 pt-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <Calendar className="w-3 h-3 text-[var(--puembo-green)]/50" /> {formattedDate}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                <span className={cn("text-[8px] font-black uppercase tracking-widest", isEnabled ? "text-emerald-600" : "text-gray-400")}>
                    {isEnabled ? "Activo" : "Cerrado"}
                </span>
                <Switch checked={isEnabled} onCheckedChange={handleToggleEnabled} disabled={isUpdating} className="scale-50" />
            </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
          <div className="flex flex-wrap gap-2">
            {sheetLinkActions} {folderLinkActions}
          </div>
          <div className="flex justify-end w-full">{actions}</div>
        </div>
      </div>
    );
  }

  return (
    <TableRow className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
      <TableCell className="px-8 py-6 w-1/3">
        <div className="max-w-[250px]">
          <OverflowCell
            href={`/formularios/${form.slug}`}
            linkText="Ver formulario"
            className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors"
          >
            {form.title}
          </OverflowCell>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-center">
        <div className="flex flex-col items-center gap-1">
            <Switch checked={isEnabled} onCheckedChange={handleToggleEnabled} disabled={isUpdating} className="scale-75 cursor-pointer" />
            <span className={cn("text-[8px] font-black uppercase tracking-widest", isEnabled ? "text-emerald-600" : "text-gray-400")}>
                {isEnabled ? "Activo" : "Deshabilitado"}
            </span>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-center">
        {sheetLinkActions}
      </TableCell>
      <TableCell className="px-8 py-6 text-center">
        {folderLinkActions}
      </TableCell>
      <TableCell className="px-8 py-6">
        <div className="flex justify-center">
          <AuthorAvatar
            profile={form.profiles}
            className="border-2 border-white shadow-sm"
          />
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-center">{actions}</TableCell>
    </TableRow>
  );
}