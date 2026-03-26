import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_BREAKPOINT).matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

        const handleChange = () => setIsMobile(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isMobile;
}
