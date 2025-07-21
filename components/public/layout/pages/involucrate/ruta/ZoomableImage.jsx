'use client';

import { useState, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useScreenSize } from "@/lib/hooks/useScreenSize";

export function ZoomableImage({ src, alt, width, height, sizes, className }) {
  const { isSm } = useScreenSize();
  const [isOpen, setIsOpen] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const wasDragged = useRef(false);

  const [state, setState] = useState({
    zoom: 1,
    origin: 'center center',
    isPanning: false,
    startPos: { x: 0, y: 0 },
    translate: { x: 0, y: 0 },
  });

  const handleZoom = (e) => {
    if (e.button !== 0 || wasDragged.current) {
      wasDragged.current = false;
      return;
    }

    const { clientX, clientY, currentTarget } = e;
    const maxZoom = 2.5;

    if (state.zoom === 1) {
      const rect = currentTarget.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      setState((s) => ({
        ...s,
        zoom: maxZoom,
        origin: `${x}% ${y}%`,
      }));
    } else {
      setState((s) => ({
        ...s,
        zoom: 1,
        translate: { x: 0, y: 0 },
      }));
    }
  };

  const handlePanStart = (e) => {
    if (state.zoom <= 1) return;

    e.preventDefault();
    const point = { x: e.clientX, y: e.clientY };
    setState((s) => ({
      ...s,
      isPanning: true,
      startPos: { x: point.x - s.translate.x, y: point.y - s.translate.y },
    }));
    wasDragged.current = false;
  };

  const handlePanMove = (e) => {
    if (!state.isPanning) return;

    e.preventDefault();
    const point = { x: e.clientX, y: e.clientY };
    const image = imageRef.current;
    const container = containerRef.current;
    if (!image || !container) return;

    const containerRect = container.getBoundingClientRect();
    const scaledWidth = image.offsetWidth * state.zoom;
    const scaledHeight = image.offsetHeight * state.zoom;

    const [ox, oy] = state.origin.split(' ').map((v) => parseFloat(v) / 100);
    const maxX = Math.max(0, (scaledWidth - containerRect.width) * ox);
    const minX = Math.min(0, -(scaledWidth - containerRect.width) * (1 - ox));
    const maxY = Math.max(0, (scaledHeight - containerRect.height) * oy);
    const minY = Math.min(0, -(scaledHeight - containerRect.height) * (1 - oy));

    const newX = Math.max(minX, Math.min(maxX, point.x - state.startPos.x));
    const newY = Math.max(minY, Math.min(maxY, point.y - state.startPos.y));

    setState((s) => ({
      ...s,
      translate: { x: newX, y: newY },
    }));

    wasDragged.current = true;
  };

  const handlePanEnd = () => {
    if (state.isPanning) {
      setState((s) => ({ ...s, isPanning: false }));
    }
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setState({
        zoom: 1,
        origin: 'center center',
        isPanning: false,
        startPos: { x: 0, y: 0 },
        translate: { x: 0, y: 0 },
      });
      wasDragged.current = false;
    }
  };

  const cursorClass =
    state.zoom > 1 ? (state.isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in';

  const transitionClass = state.isPanning ? '' : 'transition-transform duration-300 ease-in-out';

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={100}
        className={`cursor-pointer lg:cursor-default ${className}`}
        onClick={() => {
          if (isSm) setIsOpen(true);
        }}
        priority
      />
      {isSm && (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent
            ref={containerRef}
            className="!max-w-none flex items-center justify-center p-0 overflow-hidden 
                     w-[95vw] h-fit md:w-[90vw] md:h-[90vh] [&>button]:hidden"
          >
            <VisuallyHidden>
              <DialogTitle>Imagen ampliada</DialogTitle>
            </VisuallyHidden>
            <Image
              ref={imageRef}
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes={sizes}
              quality={100}
              onClick={handleZoom}
              onPointerDown={handlePanStart}
              onPointerMove={handlePanMove}
              onPointerUp={handlePanEnd}
              onPointerLeave={handlePanEnd}
              onContextMenu={(e) => e.preventDefault()}
              className={`object-contain ${transitionClass} ${cursorClass}`}
              style={{
                transform: `translate(${state.translate.x}px, ${state.translate.y}px) scale(${state.zoom})`,
                transformOrigin: state.origin,
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                touchAction: 'none',
              }}
              priority
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
