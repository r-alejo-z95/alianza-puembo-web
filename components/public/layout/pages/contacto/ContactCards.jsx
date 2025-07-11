import { Mail, Phone, MapPin } from "lucide-react";
import { sectionText, sectionPx } from "@/lib/styles";

export function ContactCards() {
    return (
        <div className={`pb-16 md:pb-24 ${sectionPx}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center text-gray-800">
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                    <Mail className="h-12 w-12 text-puembo-green mb-4 text-sky-800" />
                    <h3 className="text-xl font-semibold mb-2 text-sky-800">Correo Electrónico</h3>
                    <p className={sectionText}>info@alianzapuembo.org</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                    <Phone className="h-12 w-12 text-puembo-green mb-4 text-sky-800" />
                    <h3 className="text-xl font-semibold mb-2 text-sky-800">Teléfono</h3>
                    <p className={sectionText}>389 5952 - 389 5336</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                    <MapPin className="h-12 w-12 text-puembo-green mb-4 text-sky-800" />
                    <h3 className="text-xl font-semibold mb-2 text-sky-800">Dirección</h3>
                    <p className={sectionText}>Julio Tobar Donoso y 24 de Mayo, Puembo, Ecuador</p>
                </div>
            </div>
        </div>
    );
}