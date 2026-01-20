'use client';

import { useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { useIsOverflowing } from '@/lib/hooks/useIsOverflowing';
import { cn } from '@/lib/utils.ts';

export function OverflowCell({ children, className }: { children: string, className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { isLg } = useScreenSize();
  const isOverflowing = useIsOverflowing(ref);
  const [open, setOpen] = useState(false);

  const togglePopover = () => {
    if (!isLg) setOpen(!open);
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

  if (!isOverflowing) {
    return textElement;
  }

  return (
    <Popover open={isLg ? undefined : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {textElement}
      </PopoverTrigger>
      <PopoverContent side="bottom-start" className="max-w-xs break-words text-sm p-4 rounded-xl shadow-2xl border-none bg-black text-white">
        <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Contenido completo</span>
            <p className="font-light leading-relaxed">{children}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}