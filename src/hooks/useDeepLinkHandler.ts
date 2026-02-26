import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Handles deep links from email verification, password reset, etc.
 * When the app is opened via a deep link (e.g., from a verification email),
 * this extracts the auth tokens from the URL and completes the session.
 */
export const useDeepLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle deep links from Capacitor (native mobile)
    const setupCapacitorDeepLinks = async () => {
      try {
        const { App } = await import('@capacitor/app');
        
        App.addListener('appUrlOpen', async ({ url }) => {
          // Extract the path and hash/query from the deep link URL
          const urlObj = new URL(url);
          const hash = urlObj.hash;
          const path = urlObj.pathname;
          
          // Handle auth callbacks (verification, password reset, magic link)
          if (hash && (hash.includes('access_token') || hash.includes('type=recovery') || hash.includes('type=signup') || hash.includes('type=magiclink'))) {
            // Pass the hash fragment to Supabase to complete auth
            const { data, error } = await supabase.auth.getSession();
            
            if (hash.includes('type=recovery')) {
              navigate('/reset-password' + hash);
            } else {
              // For signup confirmation and magic links, navigate to home
              navigate('/');
            }
          } else if (path) {
            // Navigate to the path from the deep link
            navigate(path);
          }
        });
      } catch {
        // Not running in Capacitor (web environment) — ignore
      }
    };

    setupCapacitorDeepLinks();

    // Also handle web-based redirects (hash fragment in current URL)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      navigate('/reset-password' + hash);
    }
  }, [navigate]);
};
