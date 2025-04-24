import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

const links = [
  {
    title: "Donaciones",
    href: "/donaciones",
  },
  {
    title: "Noticias",
    href: "/noticias",
  },
  {
    title: "Eventos",
    href: "/eventos/proximos-eventos",
  },
  {
    title: "Oración",
    href: "/oracion",
  },
  {
    title: "Contacto",
    href: "/contacto",
  },
];

export default function Footer() {
  return (
    <footer className="bg-(--puembo-black) py-8">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="text-white order-last flex flex-col text-center text-sm md:order-first">
            <div className="flex gap-1 items-center">
              <Image
                src="/iso-white.png"
                alt="Isotipo Puembo"
                width={300}
                height={300}
                className="size-3.5"
              />
              <p>Puembo - {new Date().getFullYear()}</p>
            </div>
            <Link href="https://github.com/r-alejo-z95">
              <Button variant="link" className="text-white text-[10px]">
                Desarrollado por RZ
              </Button>
            </Link>
          </div>
          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-white hover:text-accent block duration-150"
              >
                <span>{link.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
