"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { menuItems, socialLinks } from "./config";
import { Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isHomepage = pathname === "/";

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={cn(
          "top-0 z-[100] w-full transition-all duration-500 ease-in-out border-b",
          // Usamos fixed en la Home para que el contenido empiece desde arriba (detrás del nav)
          // Usamos sticky en el resto para un flujo natural
          isHomepage ? "fixed" : "sticky md:sticky",
          // Fondo sólido en móvil siempre. En desktop transparencia condicional en Home.
          "bg-black py-3 md:py-4 border-white/10 shadow-2xl border-transparent",
          isHomepage &&
            !scrolled &&
            !activeMenu &&
            "md:bg-transparent md:py-8 md:shadow-none"
        )}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* LOGO AREA - Optimized sizes */}
          <Link href="/" className="relative z-[110] group shrink-0">
            <Image
              src="/brand/logo-puembo-white.png"
              alt="Iglesia Alianza Puembo"
              width={140}
              height={90}
              priority
              className="h-auto w-24 transition-all duration-500 group-hover:opacity-80"
            />
          </Link>

          {/* DESKTOP NARRATIVE NAV */}
          <div className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => (
              <div
                key={item.name}
                onMouseEnter={() =>
                  setActiveMenu(item.subroutes ? item.name : null)
                }
                className="relative"
              >
                <Link
                  href={item.href || "#"}
                  className={cn(
                    "px-5 py-2 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300 block",
                    activeMenu === item.name
                      ? "text-[var(--puembo-green)]"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="lg:hidden relative z-[110]">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {/* MEGA MENU OVERLAY (Desktop) */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 pt-8 pb-16 hidden lg:block"
            >
              <div className="container mx-auto px-12">
                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-3 space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
                      Sección
                    </span>
                    <h2 className="text-5xl font-serif font-bold text-white leading-tight">
                      {activeMenu}
                    </h2>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      Descubre más sobre nuestra familia y cómo puedes ser parte
                      de lo que Dios está haciendo.
                    </p>
                  </div>

                  <div className="col-span-9 grid grid-cols-3 gap-x-8 gap-y-4 pt-10">
                    {menuItems
                      .find((i) => i.name === activeMenu)
                      ?.subroutes?.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="group p-6 rounded-[2rem] hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold text-white group-hover:text-[var(--puembo-green)] transition-colors">
                                {sub.name}
                              </h3>
                              <ArrowRight className="w-4 h-4 text-[var(--puembo-green)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-2">
                              {sub.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MOBILE FULL-SCREEN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[95] bg-black flex flex-col"
          >
            <div className="flex-grow overflow-y-auto px-8 pt-28 pb-12">
              <div className="space-y-10">
                {menuItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                  >
                    <Link
                      href={item.href || "#"}
                      className="text-4xl font-serif font-bold text-white hover:text-[var(--puembo-green)] transition-colors block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.subroutes && (
                      <div className="mt-4 ml-2 space-y-4 border-l border-white/10 pl-6">
                        {item.subroutes.slice(0, 4).map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block text-xl text-gray-500 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-8 border-t border-white/10 bg-white/[0.02]">
              <div className="flex justify-between items-center">
                <div className="flex gap-6">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <s.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                  Puembo, Ecuador
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
