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
import {
  FolderOpen,
  Plus,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { FormRow } from "./table-cells/FormRow";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminFAB } from "../layout/AdminFAB";
import { ManagerSkeleton } from "../layout/AdminSkeletons";

export default function FormManager() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchForms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forms:", error);
      toast.error("Error al cargar los formularios.");
    } else {
      setForms(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
    
    // Check if we need to show a success message from the builder
    if (searchParams.get('success')) {
        toast.success(searchParams.get('message') || 'Operación exitosa');
        // Clean URL
        router.replace('/admin/formularios');
    }
  }, [searchParams]);

  const handleEdit = (form) => {
    router.push(`/admin/formularios/builder?slug=${form.slug}`);
  };

  const handleDelete = async (formId) => {
    try {
      // 1. Obtener el formulario y sus campos para identificar archivos a borrar
      const { data: formToDelete, error: fetchError } = await supabase
        .from("forms")
        .select("image_url, form_fields(attachment_url)")
        .eq("id", formId)
        .single();

      if (fetchError) throw fetchError;

      const filesToDelete = [];

      // Añadir imagen de cabecera si existe
      if (formToDelete.image_url) {
        filesToDelete.push(formToDelete.image_url.split("/").pop());
      }

      // Añadir adjuntos de campos si existen
      if (formToDelete.form_fields) {
        formToDelete.form_fields.forEach((field) => {
          if (field.attachment_url) {
            filesToDelete.push(field.attachment_url.split("/").pop());
          }
        });
      }

      // 2. Borrar archivos del Storage
      if (filesToDelete.length > 0) {
        await supabase.storage.from("form-images").remove(filesToDelete);
      }

      // 3. Borrar el registro de la DB (los campos se borrarán por CASCADE si está configurado, 
      // pero el registro del formulario es lo principal)
      const { error: deleteError } = await supabase
        .from("forms")
        .delete()
        .eq("id", formId);

      if (deleteError) throw deleteError;

      toast.success("Formulario y archivos eliminados.");
      fetchForms();
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Error al eliminar el formulario y sus archivos.");
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
          <Button
            variant="green"
            className="hidden lg:flex rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
            onClick={() => router.push('/admin/formularios/builder')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Formulario
          </Button>
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

      <AdminFAB
        onClick={() => router.push('/admin/formularios/builder')}
        label="Crear Formulario"
      />
    </div>
  );
}