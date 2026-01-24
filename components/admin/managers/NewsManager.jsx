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
import NewsForm from "@/components/admin/forms/NewsForm";
import { NewsRow } from "./table-cells/NewsRows";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useAdminNewsContext } from "@/components/providers/NewsProvider";
import { Loader2, Plus, ListFilter, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { AdminEditorPanel } from "../layout/AdminEditorPanel";
import { AdminFAB } from "../layout/AdminFAB";

export default function NewsManager() {
  const { news, loading, saveNews, deleteNews } = useAdminNewsContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

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
      const newTotalPages = Math.ceil((news.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  };

  const totalPages = useMemo(
    () => Math.ceil(news.length / itemsPerPage),
    [news.length, itemsPerPage],
  );

  const currentNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return news.slice(startIndex, endIndex);
  }, [news, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <ListFilter className="w-3 h-3" />
              <span>Listado de Contenido</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">
              Historial de Noticias
            </CardTitle>
          </div>
          <Button
            variant="green"
            className="hidden lg:flex rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
            onClick={() => {
              setSelectedNews(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Noticia
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)] opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                Cargando Historias
              </p>
            </div>
          ) : news.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Newspaper className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic">
                No hay noticias publicadas todavía.
              </p>
            </div>
          ) : (
            <div id="news-table">
              {/* Desktop screens */}
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Título
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Extracto
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Fecha y Hora
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                        Autor
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentNews.map((item) => {
                      // Calcular la página pública (4 items por página)
                      // Buscamos el índice global de este item en el array total 'news'
                      const globalIndex = news.findIndex(n => n.id === item.id);
                      const publicPage = Math.floor(globalIndex / 4) + 1;

                      return (
                        <NewsRow
                          key={item.id}
                          newsItem={item}
                          publicPage={publicPage}
                          onEdit={() => {
                            setSelectedNews(item);
                            setIsFormOpen(true);
                          }}
                          onDelete={() => handleDelete(item.id)}
                          compact={false}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile screens */}
              <div className="lg:hidden p-6 space-y-6">
                {currentNews.map((item) => {
                  const globalIndex = news.findIndex(n => n.id === item.id);
                  const publicPage = Math.floor(globalIndex / 4) + 1;

                  return (
                    <NewsRow
                      key={item.id}
                      newsItem={item}
                      publicPage={publicPage}
                      onEdit={() => {
                        setSelectedNews(item);
                        setIsFormOpen(true);
                      }}
                      onDelete={() => handleDelete(item.id)}
                      compact={true}
                    />
                  );
                })}
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

      <AdminEditorPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          <>
            {selectedNews?.id ? "Refinar" : "Crear"} <br />
            <span className="text-[var(--puembo-green)] italic">Historia</span>
          </>
        }
      >
        <div className="md:p-12">
          <NewsForm
            newsItem={selectedNews}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      </AdminEditorPanel>

      <AdminFAB 
        onClick={() => {
          setSelectedNews(null);
          setIsFormOpen(true);
        }} 
        label="Nueva Noticia"
      />
    </div>
  );
}