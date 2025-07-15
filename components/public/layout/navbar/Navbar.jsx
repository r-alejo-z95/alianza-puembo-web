"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils.ts";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { menuItems } from "./config";
import { MenuIcon } from "lucide-react";
import { dropShadow, textShadow } from "@/lib/styles";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const isHomepage = pathname === "/";

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    if (isHomepage) {
      setScrolled(window.scrollY > 0); // Immediately set scrolled based on current scroll position
      window.addEventListener("scroll", handleScroll);
    } else {
      setScrolled(true); // Always show background on non-homepage routes
    }

    return () => {
      if (isHomepage) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isHomepage]);



  const headerClasses = cn(
    "top-0 z-50 w-full transition-colors duration-300 py-1 px-8 lg:px-12",
    {
      "fixed": isHomepage,
      "sticky": !isHomepage,
      "bg-transparent": isHomepage && !scrolled,
      "bg-black":
        !isHomepage || scrolled,
    }
  );



  return (
    <header className={headerClasses}>
      <div className="container flex h-16 items-center justify-between mx-auto">

        <div className="lg:hidden w-6" />
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={cn(
            "hover:scale-105 transition duration-700"
          )}
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/brand/logo-puembo-white.png"
              alt="Alianza Puembo Logo"
              width={150}
              height={150}
              priority
              quality={100}
              className={`${dropShadow} h-auto w-22 flex-shrink-0`}
            />
          </Link>
        </motion.div>
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {menuItems.map((item) =>
              item.subroutes ? (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuTrigger className={`${textShadow} cursor-pointer text-white bg-transparent hover:text-(--puembo-green) focus:text-(--puembo-green) hover:[text-shadow:none] focus:[text-shadow:none] focus:bg-transparent hover:bg-transparent`}>{item.name}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {item.subroutes.map((subroute) => (
                        <ListItem
                          key={subroute.name}
                          title={subroute.name}
                          href={subroute.href}
                        >
                          {subroute.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white bg-transparent",
                      "hover:[text-shadow:none] focus:[text-shadow:none] hover:text-(--puembo-green) focus:text-(--puembo-green) focus:bg-transparent hover:bg-transparent",
                      textShadow,
                    )}
                    href={item.href}
                  >
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild className="lg:hidden hover:bg-transparent">
            <Button variant="ghost" size="icon">
              <MenuIcon className={`${dropShadow} h-6 w-6 text-white`} />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="bg-black border-none">
            <SheetHeader>
              <SheetTitle>
                <Link href="/" className="flex items-center justify-center space-x-2" onClick={() => setIsSheetOpen(false
                )}>
                  <Image
                    src="/brand/logo-puembo-white.png"
                    alt="Alianza Puembo Logo"
                    width={150}
                    height={150}
                    priority
                    quality={100}
                    className={`${dropShadow} h-16 w-auto`}
                  />
                </Link>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navegación principal del sitio.
              </SheetDescription>
            </SheetHeader>

            <div className="w-full md:w-2/3 max-h-[calc(100vh-160px)] mx-auto flex flex-col px-4 overflow-y-auto lg:hidden">
              <Accordion type="single" collapsible>
                {menuItems.map((item) =>
                  item.subroutes ? (
                    <AccordionItem key={item.name} value={item.name}>
                      <AccordionTrigger className="text-primary-foreground font-medium text-lg">
                        {item.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.subroutes.map((subroute) => (
                          <Link
                            key={subroute.name}
                            href={subroute.href}
                            className="block px-4 py-4 border-b border-gray-100 bg-background last:border-b-0"
                            onClick={() => setIsSheetOpen(false
                            )}>
                            {subroute.name}
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-primary-foreground font-medium text-lg py-4 block border-b last:border-b-0"
                      onClick={() => setIsSheetOpen(false
                      )}>
                      {item.name}
                    </Link>
                  )
                )}
              </Accordion>
            </div>

          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef(
  ({ className, title, children, href, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            href={href}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/60 group",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none group-hover:text-(--puembo-green) transition-colors duration-200">{title}</div>
            {children && (
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {children}
              </p>
            )}
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
