import Link from "next/link";
import { Button } from "./ui/button";

const links = [
  {
    title: "Donaciones",
    href: "#",
  },
  {
    title: "Noticias",
    href: "#",
  },
  {
    title: "Eventos",
    href: "#",
  },
  {
    title: "Oración",
    href: "#",
  },
  {
    title: "Contacto",
    href: "#",
  },
];

export default function Footer() {
  return (
    <footer className="bg-(--puembo-black) py-8">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap justify-between gap-6">
          <span className="text-white order-last block text-center text-sm md:order-first">
            © {new Date().getFullYear()} Alianza Puembo
            <br />
            <Link href="https://github.com/r-alejo-z95">
              <Button variant="link" className="text-white text-[10px]">
                Desarrollado por RZ
              </Button>
            </Link>
          </span>
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
