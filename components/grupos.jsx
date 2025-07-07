import { Button } from "./ui/button";
import {
  btnStyles,
  sectionPx,
  mainTitleSizes,
  subTitleSizes,
} from "@/lib/styles";
import { cn } from "@/lib/utils";
import Image from 'next/image';

export default function Grupos() {
  return (
    <section className="relative w-full h-screen flex flex-col text-primary-foreground bg-primary">
      <Image
        src="https://gxziassnnbwnbzfrzcnx.supabase.co/storage/v1/object/public/public-images/homepage/Group-section.webp"
        alt="Grupos Pequeños"
        fill
        className="object-cover brightness-80 contrast-70"
      />
      <div
        className={cn(
          sectionPx,
          "absolute w-full h-full flex flex-col justify-around py-16"
        )}
      >
        <h2
          className={cn(
            subTitleSizes,
            "text-center font-merriweather font-bold mx-auto"
          )}
        >
          Grupos Pequeños
        </h2>
        <p className={cn(mainTitleSizes, "text-center mx-auto")}>
          Tenemos un lugar para ti
        </p>
        <div className="max-w-screen mx-auto">
          <a
            href="https://forms.office.com/Pages/ResponsePage.aspx?id=TmWoelp7PUyMjKoX21uYwVMTAcOtIU5Nr5xM06Zvtd9UNURNTktFVkUwNzY5NDk4RkxNUEwxTUJBSS4u"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className={btnStyles}>
              Conecta con un Grupo Pequeño
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}