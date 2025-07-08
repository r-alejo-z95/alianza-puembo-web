'use client';

import { useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsLargeScreen } from '@/lib/hooks/useIsLargeScreen';
import { useIsOverflowing } from '@/lib/hooks/useIsOverflowing';

export function OverflowCell({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isLarge = useIsLargeScreen(); // default breakpoint: 1024px
  const isOverflowing = useIsOverflowing(ref);
  const [open, setOpen] = useState(false);

  if (!isOverflowing) {
    return <span ref={ref} className="block">{children}</span>;
  }

  const togglePopover = () => {
    if (!isLarge) setOpen(!open);
  };

  return (
    <Popover open={isLarge ? undefined : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          ref={ref}
          onClick={togglePopover}
          className="block cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent side="bottom-start" className="max-w-3xs break-words text-xs">
        <p>{children}</p>
      </PopoverContent>
    </Popover>
  );
}
