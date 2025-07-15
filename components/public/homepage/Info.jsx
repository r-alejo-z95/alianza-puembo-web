'use client'
import { Button } from "@/components/ui/button";
import {
  btnStyles,
  sectionPx,
  secondaryTextSizes,
  subTitleSizes,
} from "@/lib/styles.ts";
import { cn } from "@/lib/utils.ts";
import Image from "next/image";
import { motion } from 'framer-motion';

export default function Info() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={cn(sectionPx, "w-full h-[50%] py-16 overflow-hidden")}>
      <div className="flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-12">
        <div className="flex flex-col gap-6 md:w-1/2">
          <h2 className={cn(subTitleSizes, "font-merriweather font-bold")}>
            Somos una familia con convicciones firmes en Cristo
          </h2>
          <p className={cn(secondaryTextSizes)}>
            Compartimos nuestra fe con amor y queremos que formes parte de
            nuestra casa.
          </p>
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6 2xl:gap-8 mt-4">
            <a href="/noticias">
              <Button className={btnStyles}>Noticias</Button>
            </a>
            <a href="/eventos/proximos-eventos">
              <Button variant="outline" className={btnStyles}>
                Próximos eventos
              </Button>
            </a>
          </div>
        </div>
        <div className="relative w-full md:w-1/2 aspect-[3/2] rounded-md overflow-hidden">
          <Image
            src="homepage/Info-section.jpg"
            alt="Mujer abrazando a otra"
            fill
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            unoptimized
          />
        </div>
      </div>
    </motion.section>
  );
}