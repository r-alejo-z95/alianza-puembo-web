'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  btnStyles,
  sectionPx,
  mainTitleSizes,
  subTitleSizes,
  textShadow,
} from "@/lib/styles.ts";
import { cn } from "@/lib/utils.ts";
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Grupos() {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/ministerios/gp');
  };

  return (
    <section className="relative w-full h-screen flex flex-col text-primary-foreground bg-primary">
      <Image
        src="/homepage/Group-section.webp"
        alt="Grupos Pequeños"
        fill
        sizes="(max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
        className="object-cover object-center"
      />
      <div
        className={cn(
          sectionPx,
          "absolute w-full h-full flex flex-col justify-around py-16"
        )}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
          className={cn(
            subTitleSizes,
            'text-center font-merriweather font-bold mx-auto',
            textShadow
          )}
        >
          Grupos Pequeños
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.2 }}
          viewport={{ once: true }}
          className={cn(
            mainTitleSizes,
            'text-center mx-auto',
            textShadow
          )}
        >
          Tenemos un lugar para ti
        </motion.p>
        <div className="max-w-screen mx-auto">
          <Button variant="green" className={btnStyles} onClick={handleButtonClick}>
            Encuentra un GP
          </Button>
        </div>
      </div>
    </section>
  );
}