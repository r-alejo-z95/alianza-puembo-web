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
import { toast } from "sonner";
import { Edit, Trash2, Link as LinkIcon, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatNewsDate = (dateStr) => {
  if (!dateStr) return "-";
  let datePart = dateStr;
  if (dateStr.includes("T")) {
    datePart = dateStr.split("T")[0];
  }
  const date = new Date(datePart + "T00:00:00");

  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Guayaquil",
  };
  const esFormatter = new Intl.DateTimeFormat("es-ES", options);
  return esFormatter.format(date).replace(/\.$/, "");
};

const formatNewsTime = (timeStr) => {
  if (!timeStr) return "-";
  if (timeStr.includes("T")) {
    // Old format, extract time from timestamp
    const timePart = new Date(timeStr).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Guayaquil",
    });
    return timePart;
  }
  // New format, timeStr is like "14:30:00", take hh:mm
  const parts = timeStr.split(":");
  return `${parts[0]}:${parts[1]}`;
};

export function NewsRow({ newsItem, onEdit, onDelete, compact }) {
  const posterActions = newsItem.image_url ? (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
              <a
                href={newsItem.image_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver imagen"
              >
                <LinkIcon className="w-4 h-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver imagen</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(newsItem.image_url);
                toast.success("URL de la imagen copiada al portapapeles.");
              }}
              aria-label="Copiar URL de la imagen"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copiar URL de la imagen</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ) : (
    "-"
  );

  const actions = (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Editar noticia"
        onClick={onEdit}
      >
        <Edit className="w-4 h-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Eliminar noticia"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la noticia de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const formattedDate = newsItem.date ? formatNewsDate(newsItem.date) : "-";
  const formattedTime = newsItem.time ? formatNewsTime(newsItem.time) : "-";
  if (compact) {
    return (
      <div className="border rounded-lg p-4 shadow-sm space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          {newsItem.title}
        </div>
        {newsItem.description && (
          <div>
            <span className="font-semibold">Descripción:</span>{" "}
            {newsItem.description}
          </div>
        )}
        <div>
          <span className="font-semibold">Fecha:</span> {formattedDate}{" "}
          {formattedTime !== "-" ? `a las ${formattedTime}` : ""}
        </div>
        {newsItem.image_url && (
          <div>
            <span className="font-semibold">Imagen:</span> {posterActions}
          </div>
        )}
        <div className="flex gap-2 pt-2">{actions}</div>
      </div>
    );
  }

  return (
    <TableRow>
      <TableCell className="max-w-48">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          <OverflowCell>{newsItem.title}</OverflowCell>
        </div>
      </TableCell>
      <TableCell className="max-w-68 overflow-hidden text-ellipsis whitespace-nowrap">
        <OverflowCell>{newsItem.description || "-"}</OverflowCell>
      </TableCell>
      <TableCell>
        <OverflowCell>{formattedDate}</OverflowCell>
      </TableCell>
      <TableCell>
        <OverflowCell>{formattedTime}</OverflowCell>
      </TableCell>
      <TableCell>{posterActions}</TableCell>
      <TableCell className="min-w-25">{actions}</TableCell>
    </TableRow>
  );
}
