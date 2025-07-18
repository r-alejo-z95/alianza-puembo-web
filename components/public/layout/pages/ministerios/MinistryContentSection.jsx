'use client';

import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

const IconComponents = {
  CheckCircle: CheckCircle,
};

/**
 * @description Componente genérico para secciones de contenido de ministerios con un título y una cuadrícula de elementos.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.title - Título principal de la sección.
 * @param {Array<object>} props.items - Array de objetos, cada uno representando un elemento en la cuadrícula.
 * @param {'icon' | 'image'} props.items[].type - Tipo de elemento: 'icon' o 'image'.
 * @param {string} [props.items[].iconType] - Tipo de icono (ej. 'CheckCircle', requerido si type es 'icon').
 * @param {string} [props.items[].imageUrl] - URL de la imagen (requerido si type es 'image').
 * @param {string} [props.items[].imageAlt] - Texto alternativo de la imagen (requerido si type es 'image').
 * @param {string} props.items[].itemTitle - Título del elemento.
 * @param {string} props.items[].itemDescription - Descripción del elemento.
 * @returns {JSX.Element}
 */
export function MinistryContentSection({
  title,
  items,
}) {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {items.map((item, index) => {
          const IconComponent = item.iconType ? IconComponents[item.iconType] : null;
          return (
            <div key={index} className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
              {item.type === 'icon' && IconComponent && (
                <IconComponent className="h-12 w-12 text-(--puembo-green) mb-4" />
              )}
              {item.type === 'image' && item.imageUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{item.itemTitle}</h3>
              <p className={sectionText}>{item.itemDescription}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
