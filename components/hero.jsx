'use client'
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  btnStyles,
  sectionPx,
  mainTitleSizes,
  secondaryTextSizes,
} from "@/lib/styles";
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative w-full h-screen">
      <Image
        src="/Hero.gif"
        alt="Alianza Puembo Hero Background"
        fill
        priority
        className="object-cover object-top"
      />
      <div
        className={cn(
          sectionPx,
          "relative z-10 w-full h-full flex flex-col justify-center items-start text-primary-foreground backdrop-brightness-80 backdrop-contrast-70 gap-4"
        )}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="flex flex-col gap-2 mb-4"
        >
          <h2 className={cn(secondaryTextSizes)}>
            Experimenta la presencia de Dios en casa
          </h2>
          <h1 className={cn(mainTitleSizes, "font-merriweather font-bold")}>
            Bienvenido
          </h1>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6 2xl:gap-8">
          <Button
            className={btnStyles}
            onClick={() => {
              const ubicacion = document.getElementById("ubicacion");
              ubicacion?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Visítanos
          </Button>
          <a
            href="https://www.youtube.com/@IglesiaAlianzaPuembo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className={btnStyles}>Servicio On-line</Button>
          </a>
        </div>
      </div>
    </section>
  );
}