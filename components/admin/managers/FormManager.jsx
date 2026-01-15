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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormBuilder from "@/components/admin/forms/FormBuilder";
import { FormRow } from "./table-cells/FormRow";
import { stripHtml } from "@/lib/utils";
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchParams, useRouter } from "next/navigation";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export default function FormManager() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialEdit, setIsInitialEdit] = useState(false);

  const itemsPerPage = 5;
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editFormId = searchParams.get("editFormId");

  const fetchForms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*, form_fields(*)") // Fetch related form_fields
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forms:", error);
      toast.error("Error al cargar los formularios.");
    } else {
      setForms(data);
      if (editFormId) {
        const formToEdit = data.find((form) => form.id === editFormId);
        if (formToEdit) {
          setSelectedForm(formToEdit);
          setIsFormOpen(true);
          setIsInitialEdit(true); // Set initial edit flag
          router.replace("/admin/formularios"); // Remove editFormId from URL
        } else {
          toast.error("Formulario no encontrado.");
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleSave = async (formData, imageFile) => {
    setLoading(true);
    const { title, description, fields } = formData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let formId = selectedForm?.id;
    let imageUrl = selectedForm?.image_url || null;
    const slug = slugify(title);

    // Handle image upload
    if (imageFile) {
      // If updating an existing form and a new image is provided, delete the old one
      if (selectedForm && selectedForm.image_url) {
        const oldFileName = selectedForm.image_url.split("/").pop();
        const { error: deleteOldStorageError } = await supabase.storage
          .from("form-images") // Assuming a bucket named 'form-images'
          .remove([oldFileName]);

        if (deleteOldStorageError) {
          console.error(
            "Error deleting old form image from storage:",
            deleteOldStorageError
          );
          toast.error(
            "Error al eliminar la imagen antigua del almacenamiento."
          );
        }
      }

      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("form-images") // Assuming a bucket named 'form-images'
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Error uploading form image:", uploadError);
        toast.error("Error al subir la imagen del formulario.");
        setLoading(false);
        return;
      } else {
        const { data: urlData } = supabase.storage
          .from("form-images")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }
    }

    if (selectedForm) {
      // Update existing form
      const { error: formError } = await supabase
        .from("forms")
        .update({ title, description, image_url: imageUrl, slug })
        .eq("id", formId);

      if (formError) {
        console.error("Error updating form:", formError);
        toast.error("Error al actualizar el formulario.");
        setLoading(false);
        return;
      }

      // Delete existing fields and insert new ones
      const { error: deleteFieldsError } = await supabase
        .from("form_fields")
        .delete()
        .eq("form_id", formId);

      if (deleteFieldsError) {
        console.error("Error deleting old form fields:", deleteFieldsError);
        toast.error("Error al actualizar los campos del formulario.");
        setLoading(false);
        return;
      }
    } else {
      // Create new form
      const { data: newForm, error: formError } = await supabase
        .from("forms")
        .insert([
          { title, description, image_url: imageUrl, user_id: user?.id, slug },
        ])
        .select()
        .single();

      if (formError || !newForm) {
        console.error("Error creating form:", formError);
        toast.error("Error al crear el formulario.");
        setLoading(false);
        return;
      }
      formId = newForm.id;
    }

    // Insert form fields
    const fieldsToInsert = fields.map((field) => ({
      ...field,
      form_id: formId,
    }));

    const { error: fieldsError } = await supabase
      .from("form_fields")
      .insert(fieldsToInsert);

    if (fieldsError) {
      console.error("Error inserting form fields:", fieldsError);
      toast.error("Error al guardar los campos del formulario.");
      setLoading(false);
      return;
    }

    toast.success("Formulario guardado con éxito.");
    setIsFormOpen(false);
    fetchForms();

    // After saving, if it's an initial edit, redirect to /admin/eventos
    if (isInitialEdit) {
      router.push("/admin/eventos");
      setIsInitialEdit(false); // Reset the flag after redirection
    }
  };

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
      toast.error("Error al eliminar el formulario.");
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
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando formularios...</p>
        ) : (
          <div id="form-table">
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Título</TableHead>
                    <TableHead className="font-bold">Descripción</TableHead>
                    <TableHead className="font-bold">
                      Fecha de Creación
                    </TableHead>
                    <TableHead className="font-bold">Link</TableHead>
                    <TableHead className="font-bold">Respuestas</TableHead>
                    <TableHead className="font-bold">Carpeta</TableHead>
                    <TableHead className="font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentForms.map((form) => (
                    <FormRow
                      key={form.id}
                      form={form}
                      onEdit={() => {
                        setSelectedForm(form);
                        setIsFormOpen(true);
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
                    setSelectedForm(form);
                    setIsFormOpen(true);
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
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedForm ? "Editar Formulario" : "Crear Nuevo Formulario"}
            </DialogTitle>
          </DialogHeader>
          <FormBuilder
            form={selectedForm}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
