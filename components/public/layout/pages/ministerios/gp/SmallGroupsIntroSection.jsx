import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";
import { Button } from "@/components/ui/button";

export function SmallGroupsIntroSection() {
  return (
    <section className={cn(contentSection, "bg-white flex flex-col md:flex-row items-center gap-8 md:gap-16")}>
      <div className="md:w-1/2">
        <h2 className={cn(sectionTitle, "text-center md:text-left mb-4")}>
          Conecta, Crece, Comparte
        </h2>
        <p className={cn(sectionText, "text-center md:text-left mb-6")}>
          Nuestros Grupos Pequeños son el corazón de nuestra comunidad. Son espacios íntimos donde puedes conectar con otros creyentes, estudiar la Palabra de Dios, compartir tus experiencias y recibir apoyo en tu caminar de fe.
        </p>
        <p className={cn(sectionText, "text-center md:text-left mb-6")}>
          Creemos que la vida cristiana se vive mejor en comunidad. Por eso, te invitamos a unirte a un grupo pequeño cerca de ti y experimentar el crecimiento espiritual y la amistad que solo se encuentran en un ambiente de apoyo mutuo.
        </p>
        <div className="flex justify-center md:justify-start">
          <a
            href="https://forms.office.com/Pages/ResponsePage.aspx?id=TmWoelp7PUyMjKoX21uYwVMTAcOtIU5Nr5xM06Zvtd9UNURNTktFVkUwNzY5NDk4RkxNUEwxTUJBSS4u"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="green">
              Encuentra un Grupo Pequeño
            </Button>
          </a>
        </div>
      </div>
      <div className="md:w-1/2 relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/ministerios/gp/small-group-intro.jpg"
          alt="Personas en un grupo pequeño"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}