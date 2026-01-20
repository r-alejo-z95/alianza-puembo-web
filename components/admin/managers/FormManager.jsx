"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { FormRow } from "./table-cells/FormRow";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Plus, ListFilter, FileText } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export default function FormManager() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editFormId = searchParams.get("editFormId");

  const fetchForms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*, form_fields(*), profiles(full_name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forms:", error);
      toast.error("Error al cargar los formularios.");
    } else {
      setForms(data);
      if (editFormId) {
        router.push(`/admin/formularios/builder?id=${editFormId}`);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (formId) => {
    setLoading(true);
    const { data: formToDelete, error: fetchError } = await supabase
      .from("forms")
      .select("image_url")
      .eq("id", formId)
      .single();

    if (fetchError) {
      console.error("Error fetching form for deletion:", fetchError);
      toast.error("Error al obtener el formulario.");
      setLoading(false);
      return;
    }

    if (formToDelete.image_url) {
      const fileName = formToDelete.image_url.split("/").pop();
      await supabase.storage
        .from("form-images")
        .remove([fileName]);
    }

    const { error } = await supabase.from("forms").delete().eq("id", formId);
    if (error) {
      console.error("Error deleting form:", error);
      toast.error("Error al eliminar.");
    } else {
      toast.success("Formulario eliminado.");
      fetchForms();
    }
  };

  const totalPages = useMemo(
    () => Math.ceil(forms.length / itemsPerPage),
    [forms.length, itemsPerPage]
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
              <ListFilter className="w-3 h-3" />
              <span>Inventario de Formularios</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">Formularios Activos</CardTitle>
          </div>
          <Button 
            variant="green"
            className="rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
            onClick={() => router.push("/admin/formularios/builder")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Formulario
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)] opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Cargando Estructuras</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic">No hay formularios creados todavía.</p>
            </div>
          ) : (
            <div id="form-table">
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Título</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Acceso Directo</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Datos</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Carpeta</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Autor</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentForms.map((form) => (
                      <FormRow
                        key={form.id}
                        form={form}
                        onEdit={() => {
                          router.push(`/admin/formularios/builder?id=${form.id}`);
                        }}
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
                    onEdit={() => {
                      router.push(`/admin/formularios/builder?id=${form.id}`);
                    }}
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
    </div>
  );
}