import { useEffect, useState } from 'react';

export const useIsMobile = (breakpoint = 769) => {
  const [width, setWidth] = useState(0);

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
