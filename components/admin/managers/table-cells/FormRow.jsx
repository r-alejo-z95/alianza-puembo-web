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
  Copy,
  Link as LinkIcon,
  FolderOpen,
  Calendar,
  Database,
  FileSpreadsheet,
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

export function FormRow({ form, onEdit, onDelete, compact }) {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/formularios/${form.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Enlace copiado.");
    });
  };

  const handleCopySheetLink = () => {
    if (form.google_sheet_url) {
      navigator.clipboard.writeText(form.google_sheet_url).then(() => {
        toast.success("URL de la hoja copiada.");
      });
    }
  };

  const handleCopyFolderLink = () => {
    if (form.google_drive_folder_id) {
      const folderUrl = `https://drive.google.com/drive/folders/${form.google_drive_folder_id}`;
      navigator.clipboard.writeText(folderUrl).then(() => {
        toast.success("URL de la carpeta copiada.");
      });
    }
  };

  const formLinkActions = form.slug ? (
    <div className="flex items-center justify-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`${window.location.origin}/formularios/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/10 transition-all duration-300"
            >
              <LinkIcon className="w-4 h-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>Ver formulario</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/10 transition-all duration-300"
            >
              <Copy className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Copiar enlace</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ) : (
    "-"
  );

  const sheetLinkActions = form.google_sheet_url ? (
    <div className="flex items-center justify-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={form.google_sheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm shadow-emerald-500/10"
            >
              <FileSpreadsheet className="w-4 h-4" />
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
              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-sm shadow-blue-500/10"
            >
              <FolderOpen className="w-4 h-4" />
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
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(form)}
        className="rounded-xl hover:bg-[var(--puembo-green)]/10 hover:text-[var(--puembo-green)] transition-all duration-300"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-red-50 hover:text-red-500 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-2xl font-serif font-bold text-gray-900">
              ¿Eliminar este formulario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-light leading-relaxed">
              Esta acción eliminará el formulario y todos sus datos de nuestros
              registros permanentemente.
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
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const formattedDate = formatInEcuador(form.created_at, "d 'de' MMM, yyyy");

  if (compact) {
    return (
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4 relative group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[var(--puembo-green)] uppercase tracking-widest">
              Formulario
            </span>
            <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors line-clamp-2">
              {form.title}
            </h3>
          </div>
          <AuthorAvatar
            profile={form.profiles}
            className="h-10 w-10 border-2 border-white shadow-md"
          />
        </div>

        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" /> {formattedDate}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex gap-2">
            {sheetLinkActions} {folderLinkActions}
          </div>
          <div className="flex gap-2">{actions}</div>
        </div>
      </div>
    );
  }

  return (
    <TableRow className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
      <TableCell className="px-8 py-6 w-1/3">
        <div className="max-w-[250px]">
          <OverflowCell className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors">
            {form.title}
          </OverflowCell>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-center">{formLinkActions}</TableCell>
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
      <TableCell className="px-8 py-6">{actions}</TableCell>
    </TableRow>
  );
}
