"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getLomPosts } from "@/lib/data/client/lom";
import { getThisWeekPassages } from "@/lib/data/client/passages";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { contentSection } from "@/lib/styles";
import { LomSearchBar } from "@/components/public/recursos/lom/LomSearchBar";
import { LomDevotionalsList } from "@/components/public/recursos/lom/LomDevotionalsList";
import { LomWeeklyPassages } from "@/components/public/recursos/lom/LomWeeklyPassages";
import { getWeekDateRange, getBibleLink } from "@/lib/lomUtils";

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
        getThisWeekPassages(),
      ]);

      // Filter posts to only show those published today or earlier
      const today = new Date().toLocaleDateString("en-CA");
      const publishedPosts = lomPosts.filter(
        (post) => post.publication_date <= today
      );

      setPosts(publishedPosts);
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
    const today = new Date().toLocaleDateString("es-EC");
    const todaysPost = posts.find((post) => post.publication_date === today);
    if (todaysPost) {
      router.push(`/recursos/lom/${todaysPost.slug}`);
    } else if (posts.length > 0) {
      // Fallback to the latest post (which is now filtered to not include future ones)
      router.push(`/recursos/lom/${posts[0].slug}`);
    }
  };

  const handlePostClick = (slug) => {
    router.push(`/recursos/lom/${slug}`);
  };

  return (
    <PublicPageLayout
      title="Devocionales LOM"
      description="Profundiza en la lectura y meditación de la Biblia."
      imageUrl="/recursos/lom/Lom.png"
      imageAlt="Nubes en el cielo con luz del sol"
    >
      <div className={contentSection}>
        <LomSearchBar
          titleSearchTerm={titleSearchTerm}
          setTitleSearchTerm={setTitleSearchTerm}
          onDateSearch={handleDateSearch}
          onGoToLatest={goToLatestPost}
          whatsappLink="https://chat.whatsapp.com/JFxX6eqfcg5CgnTs3W2hBR"
        />

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LomDevotionalsList
              titleSearchTerm={titleSearchTerm}
              dateSearchTerm={dateSearchTerm}
              currentPosts={currentPosts}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              onPostClick={handlePostClick}
            />

            <LomWeeklyPassages
              passages={passages}
              getWeekDateRange={getWeekDateRange}
              getBibleLink={getBibleLink}
            />
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
