'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";
import { Button } from "@/components/ui/button";

/**
 * @description Componente genérico para secciones de introducción con título, descripción, imagen opcional y botón opcional.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.title - Título de la sección.
 * @param {string} props.description - Descripción de la sección.
 * @param {string} [props.imageUrl] - URL de la imagen de fondo (opcional).
 * @param {string} [props.imageAlt] - Texto alternativo de la imagen (requerido si imageUrl está presente).
 * @param {'left' | 'right'} [props.imagePosition='right'] - Posición de la imagen (left o right).
 * @param {string} [props.buttonText] - Texto del botón (opcional).
 * @param {string} [props.buttonLink] - Enlace del botón (requerido si buttonText está presente).
 * @param {string} [props.titleColor] - Clase de color para el título (opcional).
 * @param {string} [props.buttonVariant='default'] - Variante del botón (opcional, por defecto 'default').
 * @returns {JSX.Element}
 */
export function IntroSection({
  title,
  description,
  imageUrl,
  imageAlt,
  imagePosition = 'right',
  buttonText,
  buttonLink,
  titleColor,
  buttonVariant = 'default',
}) {
  const isImageLeft = imagePosition === 'left';
  const descriptionParagraphs = Array.isArray(description)
    ? description
    : description.split('\n\n');

  return (
    <section
      className={cn(
        contentSection,
        "bg-white flex flex-col items-center gap-8 md:gap-16",
        {
          "md:flex-row-reverse": imageUrl && isImageLeft,
          "md:flex-row": imageUrl && !isImageLeft,
          "justify-center": !imageUrl, // Center content when no image
        }
      )}
    >
      <div
        className={cn({
          "md:w-1/2": imageUrl,
          "w-full max-w-xl mx-auto": !imageUrl, // Full width and centered when no image
        })}
      >
        <h2
          className={cn(sectionTitle, "mb-4", titleColor, {
            "text-center md:text-left": imageUrl,
            "text-center": !imageUrl, // Always center title when no image
          })}
        >
          {title}
        </h2>
        {descriptionParagraphs.map((paragraph, index) => (
          <p
            key={index}
            className={cn(
              sectionText,
              {
                "mb-6": index < descriptionParagraphs.length - 1, // Add margin-bottom to all but the last paragraph
              },
              {
                "text-center md:text-left": imageUrl,
                "text-center": !imageUrl, // Keep text centered if no image
              }
            )}
          >
            {paragraph}
          </p>
        ))}
        {buttonText && buttonLink && (
          <div className="flex justify-center md:justify-start mt-6">
            <a href={buttonLink} target="_blank" rel="noopener noreferrer">
              <Button variant={buttonVariant}>
                {buttonText}
              </Button>
            </a>
          </div>
        )}
      </div>
      {imageUrl && (
        <div className="md:w-1/2 relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}
