import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.ts";
import { footerTextSizes, dropShadow } from "@/lib/styles.ts";
import { usePathname } from "next/navigation";
import { socialLinks } from "./navbar/config";

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
        <div className="flex flex-wrap items-center lg:items-start justify-between gap-6">
          <div
            className={cn(
              footerTextSizes,
              "text-primary-foreground order-last flex flex-col text-center md:order-first"
            )}
          >
            <div className="flex flex-col items-start">
              <div className="flex gap-1 items-center">
                <Image
                  src="/brand/iso-white.png"
                  alt="Isotipo Puembo"
                  width={14}
                  height={14}
                  sizes="(max-width: 768px) 10vw, (max-width: 1200px) 10vw, 10vw"
                  className="size-3.5 xl:size-5"
                />
                <p>Puembo - {new Date().getFullYear()}</p>
              </div>
              {isHomePage && (
                <div>
                  <Link href="/admin">
                    <Button variant="link" size="xs" className="text-primary-foreground underline hover:text-(--puembo-green)">
                      Admin
                    </Button>
                  </Link>
                </div>
              )}
              {/* {isHomePage && (
              <Link href="https://github.com/r-alejo-z95">
                <Button
                  variant="link"
                  className="text-primary-foreground text-xs 2xl:text-base"
                >
                  Desarrollado por RZ
                </Button>
              </Link>
            )} */}
            </div>
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
                className="text-primary-foreground hover:text-(--puembo-green) block duration-150"
              >
                <span>{link.title}</span>
              </Link>
            ))}
            {/* Social Links */}
          </div>
          <div className="items-center flex">
            {socialLinks.map((link) => (
              <Button key={link.name} variant="ghost" size="icon" className="hover:bg-(--puembo-green)" asChild>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <link.icon className={`${dropShadow} h-5 w-5 text-white`} />
                  <span className="sr-only">{link.name}</span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}