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
}) {
  const { isLg } = useScreenSize();

  // Desktop View: Sheet (Side Panel)
  if (isLg) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className={cn(
            "sm:max-w-2xl w-full p-0 flex flex-col border-none shadow-2xl overflow-hidden",
            className,
          )}
          side="right"
        >
          <div className={cn("bg-black p-8 md:p-12 shrink-0", headerClassName)}>
            <SheetHeader className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                  Editor de Contenido
                </span>
              </div>
              <SheetTitle className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-gray-400 font-light">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar bg-white">
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
        className={cn("max-h-[96vh] flex flex-col z-401 bg-black", className)}
      >
        <div
          className={cn("rounded-3xl bg-black p-6 shrink-0", headerClassName)}
        >
          <DrawerHeader className="space-y-2 text-left p-0">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--puembo-green)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                Editor Móvil
              </span>
            </div>
            <DrawerTitle className="text-2xl font-serif font-bold text-white leading-tight">
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className="text-gray-400 text-xs font-light">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
        </div>
        <div className="flex-grow overflow-y-auto bg-white p-6 pb-12">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
