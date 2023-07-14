export default function useScreen() {
  const breakpoints = useBreakpoints({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1440,
    hd: 1920,
  });

  return {
    breakpoints,

    /**
     * Above 640px
     */
    isSm: breakpoints.greater('sm'),

    /**
     * Above 768px
     */
    isMd: breakpoints.greater('md'),

    /**
     * Above 1024px
     */
    isLg: breakpoints.greater('lg'),

    /**
     * Above 1440px
     */
    isXl: breakpoints.greater('xl'),

    /**
     * Above 1920px
     */
    isHd: breakpoints.greater('hd'),
  };
}
