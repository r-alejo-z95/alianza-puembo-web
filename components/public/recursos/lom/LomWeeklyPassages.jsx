"use client";

import { notAvailableText, sectionTitle } from "@/lib/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function LomWeeklyPassages({
  passages,
  getWeekDateRange,
  getBibleLink,
}) {
  return (
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
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <TableCell className="font-semibold">
                    {passage.day_of_week}
                  </TableCell>
                  <TableCell>
                    <a
                      href={getBibleLink(passage.passage_reference)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="md:hover:text-(--puembo-green) md:hover:underline md:text-black md:no-underline text-(--puembo-green) underline"
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
  );
}
