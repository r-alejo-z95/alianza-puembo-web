"use client";

import * as React from "react";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * AdminEditorPanel
 * Un contenedor híbrido que muestra un Side Panel (Sheet) en Desktop
 * y un Bottom Sheet (Drawer) en Móvil.
 */
export function AdminEditorPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  headerClassName,
  ...props
}) {
  const { isLg } = useScreenSize();

  // Desktop View: Sheet (Side Panel)
  if (isLg) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className={cn(
            "sm:max-w-xl w-full p-0 flex flex-col border-none shadow-2xl overflow-hidden [&>button]:hidden",
            className,
          )}
          side="right"
          {...props}
        >
          <div className={cn("bg-black px-8 pt-8 pb-6 shrink-0 relative", headerClassName)}>
            <SheetHeader className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-[var(--puembo-green)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                    Editor de Contenido
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl h-9 w-9 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <SheetTitle className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-gray-400 text-xs font-light leading-relaxed">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
            {/* Visual separator: green accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[var(--puembo-green)]/40 via-[var(--puembo-green)]/10 to-transparent" />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#F8F9FA] custom-scrollbar flex flex-col">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Mobile View: Drawer (Bottom Sheet)
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn("max-h-[92vh] flex flex-col z-[400] bg-black", className)}
      >
        <div
          className={cn("bg-black px-6 pt-5 pb-4 shrink-0 relative", headerClassName)}
        >
          <DrawerHeader className="space-y-2 text-left p-0">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-[var(--puembo-green)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                Editor
              </span>
            </div>
            <DrawerTitle className="text-xl font-serif font-bold text-white leading-tight">
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className="text-gray-400 text-[10px] font-light leading-relaxed">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[var(--puembo-green)]/40 via-[var(--puembo-green)]/10 to-transparent" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#F8F9FA] flex flex-col">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
