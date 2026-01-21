'use client';

import { useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { useIsOverflowing } from '@/lib/hooks/useIsOverflowing';
import { cn } from '@/lib/utils.ts';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface OverflowCellProps {
  children: string;
  className?: string;
  href?: string;
  target?: string;
  linkText?: string;
}

export function OverflowCell({ 
  children, 
  className, 
  href, 
  target = "_blank",
  linkText = "Ver en sitio público"
}: OverflowCellProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { isLg } = useScreenSize();
  const isOverflowing = useIsOverflowing(ref);
  const [open, setOpen] = useState(false);

  const togglePopover = () => {
    if (!isLg && isOverflowing) setOpen(!open);
  };

  const textElement = (
    <span
      ref={ref}
      onClick={togglePopover}
      className={cn(
        "block overflow-hidden text-ellipsis whitespace-nowrap max-w-full",
        isOverflowing && "cursor-pointer",
        className
      )}
    >
      {children}
    </span>
  );

  // Si no hay desbordamiento y hay un href, envolvemos directamente en el Link
  if (!isOverflowing) {
    if (href) {
      return (
        <Link href={href} target={target} className="block w-full">
          {textElement}
        </Link>
      );
    }
    return textElement;
  }

  // Si hay desbordamiento, usamos el Popover
  return (
    <Popover open={isLg ? undefined : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {textElement}
      </PopoverTrigger>
      <PopoverContent side="bottom-start" className="max-w-xs break-words text-sm p-4 rounded-xl shadow-2xl border-none bg-black text-white z-[100]">
        <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Contenido completo</span>
              <p className="font-light leading-relaxed">{children}</p>
            </div>
            
            {href && (
              <div className="pt-2 border-t border-white/10">
                <Link 
                  href={href} 
                  target={target}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--puembo-green)] hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {linkText}
                </Link>
              </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}