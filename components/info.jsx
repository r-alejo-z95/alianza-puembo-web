'use client'
import { Button } from "./ui/button";
import {
  btnStyles,
  sectionPx,
  secondaryTextSizes,
  subTitleSizes,
} from "@/lib/styles";
import { cn } from "@/lib/utils";
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
        <div className="flex flex-col gap-6 flex-1">
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
        <div className="relative max-w-full w-full md:w-[300px] lg:w-[500px] xl:w-[700px] 2xl:w-[900px] 3xl:w-[1100px] 4xl:w-[1300px] 5xl:w-[1500px] aspect-[3/2] rounded-md overflow-hidden flex-shrink-0">
          <Image
            src="https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/Info-section.jpg"
            alt="Mujer abrazando a otra"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </motion.section>
  );
}