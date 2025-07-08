import { useEffect, useState } from 'react';

export function useIsOverflowing(ref: React.RefObject<HTMLElement>) {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const el = ref.current;
      if (el) {
        setIsOverflowing(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
      }
    };

    checkOverflow();

    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [ref]);

  return isOverflowing;
}
