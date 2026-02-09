'use client';

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { X, ZoomIn, ZoomOut, RotateCcw, Search } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

export function ZoomableImage({ src, alt, width, height, sizes, className }) {
  const { isSm } = useScreenSize();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const controls = useAnimation();
  
  // Usamos ref para el estado de transformación para evitar re-renders costosos durante el pan
  const transform = useRef({
    scale: 1,
    x: 0,
    y: 0,
    lastTap: 0
  });

  const [isZoomed, setIsZoomed] = useState(false);

  const updateView = useCallback((immediate = false) => {
    controls.start({
      x: transform.current.x,
      y: transform.current.y,
      scale: transform.current.scale,
      transition: immediate ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 300 }
    });
    setIsZoomed(transform.current.scale > 1);
  }, [controls]);

  const clampBoundaries = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const s = transform.current.scale;
    
    // Calculamos el área sobrante tras el escalado
    // Asumimos que la imagen ocupa el contenedor inicialmente
    const maxX = Math.max(0, (container.width * s - container.width) / 2);
    const maxY = Math.max(0, (container.height * s - container.height) / 2);

    transform.current.x = Math.max(-maxX, Math.min(maxX, transform.current.x));
    transform.current.y = Math.max(-maxY, Math.min(maxY, transform.current.y));
  }, []);

  const handlePan = (event, info) => {
    if (transform.current.scale <= 1) return;
    
    transform.current.x += info.delta.x;
    transform.current.y += info.delta.y;
    
    clampBoundaries();
    updateView(true); // Update immediate for drag feel
  };

  const resetView = useCallback(() => {
    transform.current.scale = 1;
    transform.current.x = 0;
    transform.current.y = 0;
    updateView();
  }, [updateView]);

  const toggleZoom = useCallback(() => {
    if (transform.current.scale > 1) {
      resetView();
    } else {
      transform.current.scale = 2.5;
      updateView();
    }
  }, [resetView, updateView]);

  const handleTap = () => {
    const now = Date.now();
    if (now - transform.current.lastTap < 300) {
      toggleZoom();
    }
    transform.current.lastTap = now;
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      transform.current = { scale: 1, x: 0, y: 0, lastTap: 0 };
      setIsZoomed(false);
    }
  };

  return (
    <>
      <div 
        className="relative cursor-pointer w-full h-full group/preview"
        onClick={() => isSm && setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          quality={100}
          className={className}
          priority
        />
        {/* Mobile Overlay Hint */}
        <div className="absolute inset-0 bg-black/5 flex items-end justify-center pb-6 md:hidden pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
            <Search className="w-3 h-3 text-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Ver mapa completo</span>
          </div>
        </div>
      </div>

      {isSm && (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent
            className="!max-w-none w-screen h-[100dvh] p-0 bg-black border-none rounded-none z-[200] [&>button]:hidden"
          >
            <VisuallyHidden>
              <DialogTitle>Mapa de la Ruta</DialogTitle>
            </VisuallyHidden>

            {/* Toolbar */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[210] bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex gap-2">
                <button 
                  onClick={toggleZoom}
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
                </button>
                {isZoomed && (
                  <button 
                    onClick={resetView}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors animate-in fade-in zoom-in duration-300"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                )}
              </div>
              
              <DialogClose asChild>
                <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </DialogClose>
            </div>

            {/* Interactive Area */}
            <div 
              ref={containerRef}
              className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
            >
              <motion.div
                animate={controls}
                onPan={handlePan}
                onTap={handleTap}
                className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <div className="relative w-full h-[85dvh]">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="100vw"
                    quality={100}
                    className="object-contain"
                    draggable={false}
                    priority
                  />
                </div>
              </motion.div>
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[210] pointer-events-none">
              <div className="bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 whitespace-nowrap">
                  {isZoomed ? 'Arrastra para navegar' : 'Doble toque para zoom'}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
