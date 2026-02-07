"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { contentSection } from "@/lib/styles";
import { Button } from "@/components/ui/button";

export function IntroSection({
  title,
  description,
  imageUrl,
  imageAlt,
  imagePosition = "right",
  buttonText,
  buttonLink,
  titleColor,
  buttonVariant = "green",
}) {
  const isImageLeft = imagePosition === "left";
  const descriptionParagraphs = Array.isArray(description)
    ? description
    : description.split("\n\n");

  return (
    <section className="relative py-16 bg-white overflow-hidden">
      <div className={cn(contentSection, "relative z-10 max-w-7xl mx-auto")}>
        <div
          className={cn("flex flex-col gap-12 lg:gap-20 items-center", {
            "md:flex-row-reverse": imageUrl && isImageLeft,
            "md:flex-row": imageUrl && !isImageLeft,
            "text-center": !imageUrl,
          })}
        >
          {/* Text Content */}
          <div
            className={cn({
              "w-full md:w-1/2 space-y-8": imageUrl,
              "w-full max-w-3xl mx-auto space-y-8": !imageUrl,
            })}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div
                className={cn("flex items-center gap-4", {
                  "justify-center": !imageUrl,
                })}
              >
                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                  Puembo
                </span>
              </div>

              <h2
                className={cn(
                  "text-3xl md:text-5xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight tracking-tight",
                  titleColor
                )}
              >
                {title}
              </h2>

              <div className="space-y-6">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base md:text-lg lg:text-xl text-gray-500 font-light leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {buttonText && buttonLink && (
                <div
                  className={cn("pt-4 flex", {
                    "justify-center": !imageUrl,
                    "justify-start": imageUrl,
                  })}
                >
                  <a
                    href={buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant={buttonVariant}
                      className="rounded-full px-10 py-7 text-sm font-bold shadow-lg shadow-[var(--puembo-green)]/20 uppercase tracking-widest"
                    >
                      {buttonText}
                    </Button>
                  </a>
                </div>
              )}
            </motion.div>
          </div>

          {/* Image Content */}
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-1/2 relative group"
            >
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl z-10">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[var(--puembo-green)]/10 rounded-[2.5rem] -z-10" />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
