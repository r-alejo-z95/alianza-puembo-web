'use client';

import { sectionTitle, sectionPy, formSection } from "@/lib/styles";
import dynamic from 'next/dynamic';

const ContactForm = dynamic(() => import('@/components/public/forms/ContactForm'), { ssr: false });

export function ContactFormSection() {
  return (
    <div className="bg-(--puembo-green) text-gray-800">
      <div className={`container mx-auto px-4 text-center ${sectionPy}`}>
        <div className={formSection}>
          <h2 className={`${sectionTitle} mb-4 text-(--puembo-green)`}>
            Envíanos un Mensaje
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
