import { useEffect, useState } from 'react';

export const useIsMobile = (breakpoint: number = 769) => {
  const [width, setWidth] = useState<number>(0);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    if (!width) setWidth(window.innerWidth);

    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  return width < breakpoint;
};
