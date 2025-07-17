'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils.ts';
import {
  btnStyles,
  sectionPx,
  mainTitleSizes,
  secondaryTextSizes,
  textShadow,
} from '@/lib/styles.ts';
import { motion } from 'framer-motion';
import Image from 'next/image';

const heroImages = [
  '/homepage/hero/Hero1.jpg',
  '/homepage/hero/Hero2.jpg',
  '/homepage/hero/Hero3.jpg',
  '/homepage/hero/Hero4.jpg',
  '/homepage/hero/Hero5.jpg',
  '/homepage/hero/Hero6.jpg',
  '/homepage/hero/Hero7.jpg',
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background images superpuestas con fade suave */}
      {heroImages.map((src, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ opacity: i === currentImageIndex ? 1 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ zIndex: i === currentImageIndex ? 1 : 0 }}
        >
          <Image
            src={src}
            alt={`Hero ${i}`}
            fill
            sizes="(max-width: 768px) 200vw, (max-width: 1200px) 100vw, 100vw"
            priority={i === 0}
            className="object-cover object-center lg:object-[center_70%] transition-opacity duration-500"
          />
        </motion.div>
      ))}

      {/* Contenido encima del fondo */}
      <div
        className={cn(
          sectionPx,
          'relative z-10 w-full h-full flex flex-col justify-center items-start text-primary-foreground gap-4'
        )}
      >
        <div className="flex flex-col gap-2 mb-4">
          <h2 className={cn(secondaryTextSizes, textShadow)}>
            Experimenta la presencia de Dios en casa
          </h2>
          <h1
            className={cn(
              mainTitleSizes,
              'font-merriweather font-bold',
              textShadow
            )}
          >
            Bienvenido
          </h1>
        </div>
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6 2xl:gap-8">
          <Button
            className={btnStyles}
            onClick={() => {
              const ubicacion = document.getElementById('ubicacion');
              ubicacion?.scrollIntoView({ behavior: 'smooth' });
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
