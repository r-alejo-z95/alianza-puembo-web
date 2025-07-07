import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { footerTextSizes } from "@/lib/styles";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <footer className="bg-primary py-8">
      <div className="mx-auto w-[80%] px-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div
            className={cn(
              footerTextSizes,
              "text-primary-foreground order-last flex flex-col text-center md:order-first"
            )}
          >
            <div className="flex flex-col items-center">
              <div className="flex gap-1 items-center">
                <Image
                  src="/brand/iso-white.png"
                  alt="Isotipo Puembo"
                  width={300}
                  height={300}
                  className="size-3.5 xl:size-5"
                />
                <p>Puembo - {new Date().getFullYear()}</p>
              </div>
              {isHomePage && (
                <Link href="https://github.com/r-alejo-z95">
                  <Button
                    variant="link"
                    className="text-primary-foreground text-xs 2xl:text-base"
                  >
                    Desarrollado por RZ
                  </Button>
                </Link>
              )}
            </div>
            {isHomePage && (
              <div>
                <Link href="/admin">
                  <Button variant="secondary" size="sm">
                    Admin
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div
            className={cn(
              footerTextSizes,
              "order-first flex flex-wrap justify-center gap-6 md:order-last"
            )}
          >
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-primary-foreground hover:text-accent block duration-150"
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