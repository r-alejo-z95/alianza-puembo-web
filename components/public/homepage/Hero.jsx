'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  btnStyles,
  sectionPx,
  mainTitleSizes,
  secondaryTextSizes,
} from '@/lib/styles';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const heroImages = [
  'https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/hero/Hero1.webp',
  'https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/hero/Hero2.webp',
  'https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/hero/Hero3.webp',
  'https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/hero/Hero4.webp',
  'https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/hero/Hero5.webp',
  'https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/hero/Hero6.webp',
  'https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/hero/Hero7.webp',
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
    <section className="relative w-full h-screen">
      <AnimatePresence>
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={heroImages[currentImageIndex]}
            alt="Alianza Puembo Hero Background"
            fill
            priority
            sizes="100vw"
            quality={100}
            className="object-cover object-top"
          />
        </motion.div>
      </AnimatePresence>
      <div
        className={cn(
          sectionPx,
          'relative z-10 w-full h-full flex flex-col justify-center items-start text-primary-foreground backdrop-brightness-80 backdrop-contrast-70 gap-4'
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="flex flex-col gap-2 mb-4"
        >
          <h2 className={cn(secondaryTextSizes)}>
            Experimenta la presencia de Dios en casa
          </h2>
          <h1 className={cn(mainTitleSizes, 'font-merriweather font-bold')}>
            Bienvenido
          </h1>
        </motion.div>
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