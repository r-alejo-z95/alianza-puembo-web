"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export function LomSearchBar({
  titleSearchTerm,
  setTitleSearchTerm,
  onDateSearch,
  onGoToLatest,
  whatsappLink,
}) {
  const handleTitleSearch = (e) => {
    setTitleSearchTerm(e.target.value);
    onDateSearch(""); // Clear date search when title search is used
  };

  const handleDateSearch = (selectedDate) => {
    onDateSearch(selectedDate);
    setTitleSearchTerm(""); // Clear title search when date search is used
  };

  return (
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
        <Button onClick={onGoToLatest} variant="green">
          Ir al devocional de hoy
        </Button>
      </div>
      <div className="flex w-full md:w-auto justify-center items-center md:justify-start">
        <Link
          href={whatsappLink}
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
  );
}
