import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { usePathname } from "next/navigation";
import { socialLinks } from "./navbar/config";
import { MapPin, Mail, ExternalLink } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const footerGroups = [
    {
      title: "Explora",
      links: [
        { name: "Donaciones", href: "/donaciones" },
        { name: "Noticias", href: "/noticias" },
        { name: "Eventos", href: "/eventos/proximos-eventos" },
      ],
    },
    {
      title: "Recursos",
      links: [
        { name: "LOM", href: "/recursos/lom" },
        {
          name: "Prédicas",
          href: "https://www.youtube.com/@IglesiaAlianzaPuembo/playlists",
          external: true,
        },
        {
          name: "Galería",
          href: "https://iglesiaalianzapuembo.pixieset.com/",
          external: true,
        },
      ],
    },
    {
      title: "Comunidad",
      links: [
        { name: "Oración", href: "/oracion" },
        { name: "Grupos Pequeños", href: "/ministerios/grupos-pequenos" },
        { name: "Contacto", href: "/contacto" },
      ],
    },
  ];

  return (
    <footer className="bg-black text-white pt-16 md:pt-24 pb-12 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-12 mb-16 md:mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8 text-center md:text-left">
            <Link href="/" className="inline-block group">
              <Image
                src="/brand/logo-puembo-white.png"
                alt="Iglesia Alianza Puembo"
                width={160}
                height={100}
                className="h-auto w-28 md:w-40 transition-all duration-500 group-hover:opacity-80 mx-auto md:mx-0"
              />
            </Link>
            <p className="text-gray-400 font-light leading-relaxed max-w-sm text-base md:text-lg mx-auto md:mx-0">
              Una familia de familias experimentando la presencia de Dios y
              caminando juntos en fe.
            </p>
            <div className="flex justify-center md:justify-start gap-4 md:gap-5 pt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[var(--puembo-green)] hover:bg-[var(--puembo-green)] transition-all duration-300 group"
                  aria-label={link.name}
                >
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-8 md:gap-10">
            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-4 md:space-y-6">
                <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--puembo-green)] opacity-80">
                  {group.title}
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-gray-400 hover:text-white text-xs md:text-sm font-light transition-colors flex items-center gap-2 group"
                      >
                        {link.name}
                        {link.external && (
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact / Location Column */}
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--puembo-green)] opacity-80">
              Ubicación
            </h3>
            <div className="space-y-4 md:space-y-6">
              <div className="flex gap-3 md:gap-4 items-start">
                <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5 md:mt-1" />
                <p className="text-xs md:text-sm text-gray-400 font-light leading-relaxed">
                  Julio Tobar Donoso y 24 de Mayo <br />
                  Puembo, Ecuador
                </p>
              </div>
              <div className="flex gap-3 md:gap-4 items-start">
                <Mail className="w-5 h-5 text-gray-500 shrink-0" />
                <a
                  href="mailto:info@alianzapuembo.org"
                  className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors font-light"
                >
                  info@alianzapuembo.org
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 text-center">
            <Image
              src="/brand/iso-white.png"
              alt="Alianza Puembo"
              width={16}
              height={16}
              className="opacity-20 hidden sm:block"
            />
            <span>
              &copy; {new Date().getFullYear()} IGLESIA ALIANZA PUEMBO
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-10 items-center">
            <Link
              href="/privacidad"
              className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors"
            >
              Términos
            </Link>
            {isHomePage && (
              <>
                <Link
                  href="/admin"
                  className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-[var(--puembo-green)] transition-colors"
                >
                  Admin
                </Link>
                <a
                  href="https://github.com/r-alejo-z95"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-[var(--puembo-green)] transition-colors italic"
                >
                  Hecho por RZ
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
