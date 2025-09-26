import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  // Prevent browser scroll restoration and ensure top on initial load
  useEffect(() => {
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch {}

    // Force scroll to top on first mount and after window load
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const onLoad = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
