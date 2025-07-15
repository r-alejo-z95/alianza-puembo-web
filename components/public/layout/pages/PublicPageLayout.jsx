'use client';

import { PageHeader } from "@/components/public/layout/pages/PageHeader";

/**
 * @description Un layout reutilizable para las páginas públicas que incluye el PageHeader estándar.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.title - El título para el PageHeader.
 * @param {string} props.description - La descripción para el PageHeader.
 * @param {string} props.imageUrl - La URL de la imagen de fondo para el PageHeader.
 * @param {string} props.imageAlt - El texto alternativo para la imagen de fondo.
 * @param {React.ReactNode} props.children - El contenido principal de la página a renderizar debajo del header.
 * @returns {JSX.Element}
 */
export function PublicPageLayout({ title, description, imageUrl, imageAlt, children }) {
  return (
    <main>
      <PageHeader
        title={title}
        description={description}
        imageUrl={imageUrl}
        imageAlt={imageAlt}
      />
      {children}
    </main>
  );
}
