'use client';

import { Mail, Phone, MapPin } from "lucide-react";
import { sectionText, sectionPx } from "@/lib/styles";

export function ContactCards() {

    const destinationLabel = "Iglesia Alianza Puembo";
    const encodedLabel = encodeURIComponent(destinationLabel);
    const fallbackWebUrl = `https://maps.app.goo.gl/nqvrncoX6JpGwAfN9`;

    const handleAddressClick = (e) => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            e.preventDefault();
            const geoUrl = `geo:0,0?q=${encodedLabel}`;
            window.location.href = geoUrl;
        }
    };
    
    return (
        <div className={`pb-16 md:pb-24 ${sectionPx}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center text-gray-800">
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                    <Mail className="h-12 w-12 text-puembo-green mb-4 text-(--puembo-green)" />
                    <h3 className="text-xl font-semibold mb-2 text-(--puembo-green)">Correo Electrónico</h3>
                    <a href="mailto:info@alianzapuembo.org" className={`${sectionText} underline md:no-underline md:hover:underline`}>info@alianzapuembo.org</a>
                </div>
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                    <Phone className="h-12 w-12 text-puembo-green mb-4 text-(--puembo-green)" />
                    <h3 className="text-xl font-semibold mb-2 text-(--puembo-green)">Teléfono</h3>
                    <p className={sectionText}>
                        <a href="tel:023895952" className="underline md:no-underline md:hover:underline">02 389 5952</a>
                        <span className="mx-2">-</span>
                        <a href="tel:023895336" className="underline md:no-underline md:hover:underline">02 389 5336</a>
                    </p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                    <MapPin className="h-12 w-12 text-puembo-green mb-4 text-(--puembo-green)" />
                    <h3 className="text-xl font-semibold mb-2 text-(--puembo-green)">Dirección</h3>
                    <a 
                        href={fallbackWebUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={handleAddressClick}
                        className={`${sectionText} underline md:no-underline md:hover:underline`}
                    >
                        Julio Tobar Donoso y 24 de Mayo, Puembo, Ecuador
                    </a>
                </div>
            </div>
        </div>
    );
}