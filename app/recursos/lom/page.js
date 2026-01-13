"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getLomPosts } from "@/lib/data/client/lom";
import { getLatestWeekPassages } from "@/lib/data/client/passages";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import {
  contentSection,
  notAvailableText,
  notAvailableDevotional,
  sectionTitle,
} from "@/lib/styles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { DatePicker } from "@/components/ui/date-picker";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export default function LomPage() {
  const [posts, setPosts] = useState([]);
  const [passages, setPassages] = useState([]);
  const [titleSearchTerm, setTitleSearchTerm] = useState("");
  const [dateSearchTerm, setDateSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const itemsPerPage = 3;
  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [lomPosts, weeklyPassages] = await Promise.all([
        getLomPosts(),
        getLatestWeekPassages(),
      ]);
      setPosts(lomPosts);
      const sortedPassages = weeklyPassages.sort((a, b) => {
        return (
          daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week)
        );
      });
      setPassages(sortedPassages);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleTitleSearch = (e) => {
    setTitleSearchTerm(e.target.value);
    setDateSearchTerm(""); // Clear date search when title search is used
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDateSearch = (selectedDate) => {
    setDateSearchTerm(selectedDate);
    setTitleSearchTerm(""); // Clear title search when date search is used
    setCurrentPage(1); // Reset to first page on new search
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (titleSearchTerm) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(titleSearchTerm.toLowerCase())
      );
    } else if (dateSearchTerm) {
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.publication_date)
          .toISOString()
          .split("T")[0];
        return postDate === dateSearchTerm;
      });
    }
    return filtered;
  }, [posts, titleSearchTerm, dateSearchTerm]);

  const totalPages = useMemo(
    () => Math.ceil(filteredPosts.length / itemsPerPage),
    [filteredPosts.length, itemsPerPage]
  );
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage, itemsPerPage]);

  const goToLatestPost = () => {
    if (posts.length > 0) {
      router.push(`/recursos/lom/${posts[0].slug}`);
    }
  };

  const getWeekDateRange = (startDate) => {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 4); // Monday to Friday
    return `${start.getUTCDate()}-${end.getUTCDate()} de ${start.toLocaleString("es-ES", { month: "long", timeZone: "UTC" })}`;
  };

  const getBibleLink = (reference) => {
    // YouVersion mapping for Spanish books
    const bookMapping = {
      genesis: "GEN",
      exodo: "EXO",
      levitico: "LEV",
      numeros: "NUM",
      deuteronomio: "DEU",
      josue: "JOS",
      jueces: "JDG",
      rut: "RUT",
      "1 samuel": "1SA",
      "2 samuel": "2SA",
      "1 reyes": "1KI",
      "2 reyes": "2KI",
      "1 cronicas": "1CH",
      "2 cronicas": "2CH",
      esdras: "EZR",
      nehemias: "NEH",
      ester: "EST",
      job: "JOB",
      salmos: "PSA",
      proverbios: "PRO",
      eclesiastes: "ECC",
      cantares: "SNG",
      isaias: "ISA",
      jeremias: "JER",
      lamentaciones: "LAM",
      ezequiel: "EZK",
      daniel: "DAN",
      oseas: "HOS",
      joel: "JOL",
      amos: "AMO",
      abdias: "OBA",
      jonas: "JON",
      miqueas: "MIC",
      nahum: "NAM",
      habacuc: "HAB",
      sofonias: "ZEP",
      hageo: "HAG",
      zacarias: "ZEC",
      malaquias: "MAL",
      mateo: "MAT",
      marcos: "MRK",
      lucas: "LUK",
      juan: "JHN",
      hechos: "ACT",
      romanos: "ROM",
      "1 corintios": "1CO",
      "2 corintios": "2CO",
      galatas: "GAL",
      efesios: "EPH",
      filipenses: "PHP",
      colosenses: "COL",
      "1 tesalonicenses": "1TH",
      "2 tesalonicenses": "2TH",
      "1 timoteo": "1TI",
      "2 timoteo": "2TI",
      tito: "TIT",
      filemon: "PHM",
      hebreos: "HEB",
      santiago: "JAS",
      "1 pedro": "1PE",
      "2 pedro": "2PE",
      "1 juan": "1JN",
      "2 juan": "2JN",
      "3 juan": "3JN",
      judas: "JUD",
      apocalipsis: "REV",
    };

    // Clean reference and try to match book
    const cleanRef = reference
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove accents

    let bookAbbr = "";
    let chapterPart = "";

    for (const [name, abbr] of Object.entries(bookMapping)) {
      if (cleanRef.startsWith(name)) {
        bookAbbr = abbr;
        chapterPart = reference.substring(name.length).trim();
        break;
      }
    }

    if (!bookAbbr)
      return `https://www.bible.com/search/bible?q=${encodeURIComponent(reference)}`;

    // Parse chapter and verse
    // Format: GEN.1.1.NTV or GEN.1.NTV
    const match = chapterPart.match(/(\d+)(?::(\d+))?/);
    if (match) {
      const chapter = match[1];
      const verse = match[2];
      return `https://www.bible.com/bible/127/${bookAbbr}.${chapter}${verse ? "." + verse : ""}.NTV`;
    }

    return `https://www.bible.com/bible/127/${bookAbbr}.1.NTV`;
  };

  return (
    <PublicPageLayout
      title="Devocionales LOM"
      description="Profundiza en la lectura y meditación de la Biblia."
      imageUrl="/recursos/lom/Lom.png"
      imageAlt="Nubes en el cielo con luz del sol"
    >
      <div className={contentSection}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex gap-2 w-full md:w-1/2">
              <Input
                type="text"
                placeholder="Buscar por título..."
                value={titleSearchTerm}
                onChange={handleTitleSearch}
                className="w-full"
              />
              <DatePicker onSelectDate={handleDateSearch} />
            </div>
            <Button onClick={goToLatestPost} variant="green">
              Ir al devocional de hoy
            </Button>
          </div>
          <div className="flex w-full md:w-auto justify-center items-center md:justify-start">
            <Link
              href="https://chat.whatsapp.com/JFxX6eqfcg5CgnTs3W2hBR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full md:w-auto justify-center"
            >
              <Button variant="green" className="w-full">
                <FaWhatsapp className="h-5 w-5" />
                <p>Únete al grupo</p>
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className={`${sectionTitle} mb-4`}>
                {titleSearchTerm || dateSearchTerm
                  ? "Resultados de la Búsqueda"
                  : "Últimos Devocionales"}
              </h2>
              <div className="space-y-4">
                {currentPosts.length > 0 ? (
                  currentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => router.push(`/recursos/lom/${post.slug}`)}
                    >
                      <h3 className="font-bold">{post.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.publication_date).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "UTC",
                          }
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className={notAvailableDevotional}>
                    No se encontraron devocionales.
                  </p>
                )}
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

            <div>
              <h2 className={`${sectionTitle} mb-4`}>Lecturas Semanales</h2>
              {passages.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold">
                    Semana {passages[0].week_number}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {getWeekDateRange(passages[0].week_start_date)}
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Día</TableHead>
                        <TableHead className="font-bold">Pasaje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {passages.map((passage, index) => (
                        <TableRow
                          key={passage.id}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <TableCell className="font-semibold">
                            {passage.day_of_week}
                          </TableCell>
                          <TableCell>
                            <a
                              href={getBibleLink(passage.passage_reference)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-(--puembo-green) hover:underline"
                            >
                              {passage.passage_reference}
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className={notAvailableText}>No hay pasajes disponibles.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
