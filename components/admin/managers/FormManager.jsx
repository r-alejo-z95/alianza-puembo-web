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
import { Loader2 } from "lucide-react";

export default function FormManager() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editFormId = searchParams.get("editFormId");

  const fetchForms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*, form_fields(*), profiles(full_name, email)") // Fetch related form_fields and author profile
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forms:", error);
      toast.error("Error al cargar los formularios.");
    } else {
      setForms(data);
      if (editFormId) {
        // Redirect to builder if editFormId is present
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
    // Fetch form to get image_url before deleting
    const { data: formToDelete, error: fetchError } = await supabase
      .from("forms")
      .select("image_url")
      .eq("id", formId)
      .single();

    if (fetchError) {
      console.error("Error fetching form for deletion:", fetchError);
      toast.error("Error al obtener el formulario para eliminar.");
      setLoading(false);
      return;
    }

    // If there's an image_url, delete the file from storage
    if (formToDelete.image_url) {
      const fileName = formToDelete.image_url.split("/").pop();
      const { error: deleteStorageError } = await supabase.storage
        .from("form-images") // Assuming a bucket named 'form-images'
        .remove([fileName]);

      if (deleteStorageError) {
        console.error(
          "Error deleting form image from storage:",
          deleteStorageError
        );
        toast.error("Error al eliminar la imagen del almacenamiento.");
      }
    }

    const { error } = await supabase.from("forms").delete().eq("id", formId);
    if (error) {
      console.error("Error deleting form:", error);
      toast.error("Error al eliminar the formulario.");
    } else {
      toast.success("Formulario eliminado con éxito.");
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Formularios Creados</CardTitle>
        <Button onClick={() => router.push("/admin/formularios/builder")}>
          Añadir Formulario
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--puembo-green)]" />
          </div>
        ) : (
          <div id="form-table">
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Título</TableHead>
                    <TableHead className="font-bold">
                      Fecha de Creación
                    </TableHead>
                    <TableHead className="font-bold">Link</TableHead>
                    <TableHead className="font-bold">Respuestas</TableHead>
                    <TableHead className="font-bold">Carpeta</TableHead>
                    <TableHead className="font-bold">Autor</TableHead>
                    <TableHead className="font-bold">Acciones</TableHead>
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
              {totalPages > 1 && (
                <PaginationControls
                  hasNextPage={currentPage < totalPages}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>

            <div className="lg:hidden space-y-4">
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
              {totalPages > 1 && (
                <PaginationControls
                  hasNextPage={currentPage < totalPages}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
