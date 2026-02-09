"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { contentSection } from "@/lib/styles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { PaginationControls } from "@/components/shared/PaginationControls";
import {
  formatInEcuador,
  formatEcuadorDateForInput,
  formatLiteralDate,
} from "@/lib/date-utils";
import { getWeekDateRange, getBibleLink } from "@/lib/lomUtils";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

const itemsPerPage = 6;

export function LomClient({ initialPosts = [], initialPassages = [] }) {
  const [posts] = useState(initialPosts);
  const [passages] = useState(initialPassages);
  const [titleSearchTerm, setTitleSearchTerm] = useState("");
  const [dateSearchTerm, setDateSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (titleSearchTerm) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(titleSearchTerm.toLowerCase())
      );
    } else if (dateSearchTerm) {
      filtered = filtered.filter((post) => {
        // publication_date es literal YYYY-MM-DD
        return post.publication_date === dateSearchTerm;
      });
    }
    return filtered;
  }, [posts, titleSearchTerm, dateSearchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToLatestPost = () => {
    if (posts.length > 0) {
      router.push(`/recursos/lom/${posts[0].slug}`);
    }
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-10 md:pt-12 pb-24 space-y-12 md:space-y-16")}>
      <section className="max-w-7xl mx-auto w-full">
        {/* Separador Visual */}
        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 px-2 md:px-4">
          <h2 className="text-xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Lee, Ora, Medita
          </h2>
          <div className="h-1 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1 w-8 md:w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        {/* Search and Filter Bar */}
        <motion.div
          {...fadeIn}
          className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 mb-10 md:mb-12 flex flex-col md:flex-row gap-4 items-center mx-2 md:mx-0"
        >
          <div className="relative w-full md:grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar devocional..."
              className="pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-sm md:text-base"
              value={titleSearchTerm}
              onChange={(e) => {
                setTitleSearchTerm(e.target.value);
                setDateSearchTerm("");
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <DatePicker
              onSelectDate={(date) => {
                setDateSearchTerm(date);
                setTitleSearchTerm("");
                setCurrentPage(1);
              }}
            />
            <Button
              variant="green"
              className="h-12 px-4 md:px-6 rounded-xl md:rounded-2xl shrink-0 text-sm font-bold grow md:grow-0"
              onClick={goToLatestPost}
            >
              Lectura de Hoy
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Main List: Devotionals */}
          <div className="lg:col-span-3 space-y-8 md:space-y-10 px-2 md:px-0">
            {currentPosts.length === 0 ? (
              <div className="text-center py-16 md:py-20 bg-white rounded-2xl md:rounded-3xl border border-dashed border-gray-200 text-gray-400">
                No se encontraron devocionales.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {currentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    {...fadeIn}
                    transition={{ delay: (index % 2) * 0.1 }}
                  >
                    <Link href={`/recursos/lom/${post.slug}`}>
                      <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-xl md:rounded-2xl overflow-hidden group h-full">
                        <CardContent className="p-5 md:p-6 flex flex-col h-full justify-between space-y-3 md:space-y-4">
                          <div className="space-y-1 md:space-y-2">
                            <span className="text-[9px] md:text-[10px] font-bold text-[var(--puembo-green)] uppercase tracking-widest">
                              {formatLiteralDate(
                                post.publication_date,
                                "d 'de' MMMM, yyyy"
                              )}
                            </span>
                            <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors line-clamp-2 leading-tight">
                              {post.title}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-50">
                            <span className="text-[10px] md:text-xs text-gray-400 font-medium italic">
                              Leer
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center pt-6 md:pt-8">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

          {/* Sidebar: Weekly Passages & CTA */}
          <aside className="space-y-6 md:space-y-8 px-2 md:px-0">
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[var(--puembo-green)]" />
                    <CardTitle className="text-base md:text-lg font-serif font-bold text-gray-900">
                      Lecturas Semanales
                    </CardTitle>
                  </div>
                  {passages.length > 0 && (
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 md:mt-2">
                      Semana {passages[0].week_number}:{" "}
                      {getWeekDateRange(passages[0].week_start_date)}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {passages.map((p) => (
                      <a
                        key={p.id}
                        href={getBibleLink(p.passage_reference)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 hover:bg-green-50 transition-colors group"
                      >
                        <div className="flex flex-col">
                          <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">
                            {p.day_of_week}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-[var(--puembo-green)]">
                            {p.passage_reference}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              {...fadeIn}
              transition={{ delay: 0.3 }}
              className="p-6 md:p-8 bg-[var(--puembo-green)] rounded-2xl shadow-xl text-white relative overflow-hidden group"
            >
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <FaWhatsapp className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 opacity-50" />
              <h3 className="text-lg md:text-xl font-serif font-bold mb-2 md:mb-3 relative z-10 leading-tight">
                Recíbelo en tu celular
              </h3>
              <p className="text-xs md:text-sm text-green-50 leading-relaxed mb-5 md:mb-6 relative z-10">
                Únete a nuestro grupo de WhatsApp y recibe el devocional cada
                mañana.
              </p>
              <a
                href="https://chat.whatsapp.com/IM6iQQcljea2tFxFN7Q0EC"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 md:h-10 items-center justify-center rounded-xl bg-white px-5 md:px-6 text-xs md:text-sm font-bold text-[var(--puembo-green)] shadow-lg hover:bg-green-50 transition-all relative z-10 w-full md:w-auto"
              >
                Unirme al grupo
              </a>
            </motion.div>
          </aside>
        </div>
      </section>
    </div>
  );
}
