import Image from "next/image";
import { BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { subSectionTitle, blockquote, sectionPy } from "@/lib/styles";

export function BeliefBlock({ belief, index }) {
  const { name, detail, verse, citation, image, symbol } = belief;
  const isReversed = index % 2 !== 0;

  return (
    <div className={cn(sectionPy, "relative group px-2 md:px-0")}>
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-20 items-center",
          isReversed && "lg:flex-row-reverse"
        )}
      >
        {/* Image Container with Editorial Style */}
        <div
          className={cn(
            "lg:col-span-7 relative aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]",
            isReversed ? "lg:col-start-6 lg:order-2" : "lg:col-start-1"
          )}
        >
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          
          {/* Subtle Accent Line */}
          <div className={cn(
            "absolute bottom-6 md:bottom-8 w-16 md:w-24 h-1 bg-[var(--puembo-green)] rounded-full",
            isReversed ? "right-6 md:right-8" : "left-6 md:left-8"
          )} />
        </div>

        {/* Content Side */}
        <div className={cn(
          "lg:col-span-5 flex flex-col justify-center space-y-6 md:space-y-8 px-2 md:px-0",
          isReversed ? "lg:col-start-1 lg:order-1 lg:text-right" : "lg:col-start-8"
        )}>
          <div className={cn(
            "space-y-4 md:space-y-6",
            isReversed ? "lg:items-end" : "lg:items-start"
          )}>
            {symbol && (
              <div className={cn(
                "relative size-14 md:size-20 transition-all duration-700 group-hover:scale-110",
                "grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 contrast-125",
                isReversed ? "ml-auto" : ""
              )}>
                <Image
                  src={symbol}
                  alt={`Símbolo de ${name}`}
                  fill
                  className="object-contain drop-shadow-sm"
                />
              </div>
            )}
            
            <div className="space-y-1.5 md:space-y-2">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--puembo-green)] opacity-70 block">
                Fundamento {index + 1}
              </span>
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight">
                {name}
              </h3>
            </div>
          </div>

          <p className="text-gray-500 text-sm md:text-lg leading-relaxed font-light">
            {detail}
          </p>

          <div className={cn(
            "relative p-6 md:p-10 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.05)] transition-all duration-500 hover:border-[var(--puembo-green)]/20",
            isReversed ? "lg:ml-auto" : ""
          )}>
            <div className={cn(
              "absolute top-0 size-8 md:size-10 bg-[var(--puembo-green)] text-white rounded-full flex items-center justify-center -translate-y-1/2 shadow-lg",
              isReversed ? "right-8 md:right-10" : "left-8 md:left-10"
            )}>
              <BookOpenText className="size-4 md:size-5" />
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <p className="text-sm md:text-base text-gray-600 font-medium italic leading-relaxed">
                &quot;{verse}&quot;
              </p>
              <cite className={cn(
                "block text-[10px] md:text-sm not-italic font-black uppercase tracking-widest text-[var(--puembo-green)] opacity-80",
                isReversed ? "text-left" : "text-right"
              )}>
                — {citation}
              </cite>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
