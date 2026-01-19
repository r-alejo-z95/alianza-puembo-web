"use client";

import { useState, useMemo } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewsForm from "@/components/admin/forms/NewsForm";
import { NewsRow } from "./table-cells/NewsRows";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useAdminNewsContext } from "@/components/providers/NewsProvider";
import { Loader2 } from "lucide-react";

export default function NewsManager() {
  const { news, loading, saveNews, deleteNews } = useAdminNewsContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 5 : 3;

  const handleSave = async (newsData, imageFile) => {
    const result = await saveNews(newsData, imageFile, selectedNews);

    if (result.success) {
      setIsFormOpen(false);
      setSelectedNews(null);
    }
  };

  const handleDelete = async (newsId) => {
    const success = await deleteNews(newsId);
    if (success) {
      // Reset to first page if current page becomes empty
      const newTotalPages = Math.ceil((news.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  };

  const totalPages = useMemo(
    () => Math.ceil(news.length / itemsPerPage),
    [news.length, itemsPerPage]
  );
  const currentNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return news.slice(startIndex, endIndex);
  }, [news, currentPage, itemsPerPage]);

  return (
    <Card className="mb-16">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Noticias</CardTitle>
        <Button
          onClick={() => {
            setSelectedNews(null);
            setIsFormOpen(true);
          }}
        >
          Añadir Noticia
        </Button>
      </CardHeader>
      <CardContent className="max-w-full">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--puembo-green)]" />
          </div>
        ) : (
          <div id="news-table">
            {/* Large screens */}
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Título</TableHead>
                    <TableHead className="font-bold">Descripción</TableHead>
                    <TableHead className="font-bold">Fecha</TableHead>
                    <TableHead className="font-bold">Hora</TableHead>
                    <TableHead className="font-bold">Imagen</TableHead>
                    <TableHead className="font-bold">Autor</TableHead>
                    <TableHead className="font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentNews.map((item) => (
                    <NewsRow
                      key={item.id}
                      newsItem={item}
                      onEdit={() => {
                        setSelectedNews(item);
                        setIsFormOpen(true);
                      }}
                      onDelete={() => handleDelete(item.id)}
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

            {/* Small screens */}
            <div className="lg:hidden space-y-4">
              <div className="w-full">
                {currentNews.map((item) => (
                  <NewsRow
                    key={item.id}
                    newsItem={item}
                    onEdit={() => {
                      setSelectedNews(item);
                      setIsFormOpen(true);
                    }}
                    onDelete={() => handleDelete(item.id)}
                    compact={true}
                  />
                ))}
              </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedNews?.id ? "Editar Noticia" : "Crear Nueva Noticia"}
            </DialogTitle>
          </DialogHeader>
          <NewsForm
            newsItem={selectedNews}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
