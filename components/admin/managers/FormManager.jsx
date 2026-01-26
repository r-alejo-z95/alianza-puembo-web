"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, Plus, Loader2, FileSpreadsheet, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormRow } from "./table-cells/FormRow";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminFAB } from "../layout/AdminFAB";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import { useForms } from "@/lib/hooks/useForms";
import RecycleBin from "./RecycleBin";

export default function FormManager() {
  const {
    forms,
    archivedForms,
    loading,
    loadingArchived,
    archiveForm,
    restoreForm,
    permanentlyDeleteForm,
    fetchArchivedForms,
    refetchForms
  } = useForms();

  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Cargar archivados al abrir papelera
  useEffect(() => {
    if (isRecycleBinOpen) {
      fetchArchivedForms();
    }
  }, [isRecycleBinOpen, fetchArchivedForms]);

  useEffect(() => {
    // Check if we need to show a success message from the builder
    if (searchParams.get("success")) {
      toast.success(searchParams.get("message") || "Operación exitosa");
      router.replace("/admin/formularios");
    }
  }, [searchParams, router]);

  const handleEdit = (form) => {
    router.push(`/admin/formularios/builder?slug=${form.slug}`);
  };

  const handleDelete = async (formId) => {
    const success = await archiveForm(formId);
    if (success) {
      const newTotalPages = Math.ceil((forms.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  };

  const totalPages = useMemo(
    () => Math.ceil(forms.length / itemsPerPage),
    [forms.length, itemsPerPage],
  );
  const currentForms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return forms.slice(startIndex, endIndex);
  }, [forms, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <FolderOpen className="w-3 h-3" />
              <span>Base de Datos</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">
              Gestión de Formularios
            </CardTitle>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full px-6 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
              onClick={() => setIsRecycleBinOpen(true)}
            >
              <Trash2 className="w-5 h-5 lg:mr-2" />
              <span className="hidden lg:inline">Papelera</span>
            </Button>
            <Button
              variant="green"
              className="hidden lg:flex rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
              onClick={() => router.push("/admin/formularios/builder")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Formulario
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={6} />
          ) : forms.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic">
                No hay formularios creados todavía.
              </p>
            </div>
          ) : (
            <div id="forms-table">
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Título del Formulario
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                        Estado
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                        Google Sheets
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                        Google Drive
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                        Autor
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentForms.map((form) => (
                      <FormRow
                        key={form.id}
                        form={form}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        compact={false}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="lg:hidden p-6 space-y-6">
                {currentForms.map((form) => (
                  <FormRow
                    key={form.id}
                    form={form}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    compact={true}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="p-8 border-t border-gray-50">
                  <PaginationControls
                    hasNextPage={currentPage < totalPages}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <RecycleBin 
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="forms"
        items={archivedForms}
        onRestore={restoreForm}
        onDelete={permanentlyDeleteForm}
        loading={loadingArchived}
      />

      <AdminFAB
        onClick={() => router.push("/admin/formularios/builder")}
        label="Crear Formulario"
      />
    </div>
  );
}
