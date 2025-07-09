import Image from "next/image";
import { textShadow, pageTitle, pageDescription, imageHeaderContainer } from "@/lib/styles";

export function EventosHeader() {
    return (
        <div className={imageHeaderContainer}>
            <Image
                src="/eventos/Eventos.jpg"
                alt="Personas en un evento de la iglesia"
                fill
                priority
                className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/50 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center text-center text-white px-4 h-full">
                <h1 className={`${pageTitle} ${textShadow}`}>
                    Próximos Eventos
                </h1>
                <p className={`${pageDescription} ${textShadow} max-w-2xl`}>
                    Mantente al tanto de lo que viene en nuestra comunidad.
                </p>
            </div>
        </div>
    )
}
