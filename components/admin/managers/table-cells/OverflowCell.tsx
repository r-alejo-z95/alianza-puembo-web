'use client';

import { useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

  const toggleTooltip = () => {
    if (!isLarge) setOpen(!open);
  };

  return (
    <Tooltip open={isLarge ? undefined : open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <span
          ref={ref}
          onClick={toggleTooltip}
          className="block cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom-start" className="max-w-3xs break-words">
        <p>{children}</p>
      </TooltipContent>
    </Tooltip>
  );
}
