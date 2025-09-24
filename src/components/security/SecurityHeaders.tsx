import { useEffect } from 'react';
import { getSecurityHeaders } from '@/lib/enhancedSecurity';

// Component to inject security headers via meta tags
export const SecurityHeaders = () => {
  useEffect(() => {
    const headers = getSecurityHeaders();
    
    // Add security meta tags
    const addMetaTag = (name: string, content: string) => {
      let existingTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!existingTag) {
        existingTag = document.createElement('meta');
        existingTag.name = name;
        document.head.appendChild(existingTag);
      }
      existingTag.content = content;
    };

    // Add Content Security Policy
    addMetaTag('Content-Security-Policy', headers['Content-Security-Policy']);
    
    // Add other security headers as meta tags for SPA compatibility
    Object.entries(headers).forEach(([key, value]) => {
      if (key !== 'Content-Security-Policy') {
        addMetaTag(key, value);
      }
    });

    // Disable right-click context menu in production for additional security
    if (import.meta.env.PROD) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default SecurityHeaders;