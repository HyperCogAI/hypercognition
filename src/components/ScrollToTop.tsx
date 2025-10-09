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
    const scrollNow = () => {
      try {
        // Window/body/html
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Any scrollable app containers
        const containers = document.querySelectorAll('main, [data-sidebar-inset], .sidebar-inset, [data-scroll-container], [data-scroll-root]');
        containers.forEach((el) => {
          try {
            (el as HTMLElement).scrollTo({ top: 0, left: 0, behavior: 'auto' });
            (el as HTMLElement).scrollTop = 0;
          } catch {}
        });
      } catch {}
    };

    // Run after paint to catch newly mounted layouts
    requestAnimationFrame(() => {
      scrollNow();
      // Run twice to ensure sticky headers/layout shifts are accounted for
      requestAnimationFrame(scrollNow);
    });
  }, [pathname]);

  return null;
}
