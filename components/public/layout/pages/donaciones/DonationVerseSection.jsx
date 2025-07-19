import { sectionText, blockquote, sectionPy } from "@/lib/styles";

export function DonationVerseSection() {
  return (
    <div className="text-gray-800 bg-(--puembo-green)">
      <div className={`container mx-auto px-4 text-center ${sectionPy}`}>
        <p className={`${blockquote} text-white max-w-2xl mx-auto`}>
          &quot;Traigan íntegro el diezmo para los fondos del templo, y así habrá alimento en mi casa. Pruébenme en esto —dice el Señor Todopoderoso—, y vean si no abro las compuertas del cielo y derramo sobre ustedes bendición hasta que sobreabunde.&rdquo;
          <br />
          <span className="font-semibold">Malaquías 3:10</span>
        </p>
      </div>
    </div>

  );
}

