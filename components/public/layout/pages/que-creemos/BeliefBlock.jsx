import Image from "next/image";
import { BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";
import { subSectionTitle, blockquote, sectionPy } from "@/lib/styles";

export function BeliefBlock({ belief, index }) {
    const { name, detail, verse, citation, image } = belief;
    const isReversed = index % 2 !== 0;

    return (
        <div className={sectionPy}>
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center", isReversed && "md:grid-flow-col-dense")}>
                <div className={cn("relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg", isReversed ? "md:col-start-2" : "")}>
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="flex flex-col justify-center">
                    <h3 className={`${subSectionTitle} text-blue-800`}>{name}</h3>
                    <p className="mt-4 text-sm md:text-base text-gray-600">{detail}</p>
                    <blockquote className={blockquote}>
                        <p className="flex items-start gap-3 text-sm md:text-base">
                            <BookOpenText className="size-5 shrink-0 mt-1 text-yellow-600" />
                            <span>&quot;{verse}&quot;</span>
                        </p>
                        <cite className="block text-right mt-2 not-italic font-semibold">{citation}</cite>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
