import { useEffect, useState } from 'react';

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    isSm: false,
    isMd: false,
    isLg: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isSm: width < 768, // Custom 'sm' breakpoint
        isMd: width >= 768 && width < 1024, // Custom 'md' breakpoint
        isLg: width >= 1024, // Custom 'lg' breakpoint
      });
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

