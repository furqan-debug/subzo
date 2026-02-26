import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';

/**
 * Handles deep links from email verification, password reset, and OAuth callbacks.
 */
export const useDeepLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Handle deep links from Capacitor (native mobile)
    const setupCapacitorDeepLinks = async () => {
      try {
        const { App } = await import('@capacitor/app');

        const closeAuthBrowser = async () => {
          try {
            await Browser.close();
          } catch {
            // Browser may already be closed; ignore
          }
        };

        const listener = await App.addListener('appUrlOpen', async ({ url }) => {
          const urlObj = new URL(url);
          const hash = urlObj.hash.startsWith('#') ? urlObj.hash.slice(1) : urlObj.hash;
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const authType = hashParams.get('type');
          const code = urlObj.searchParams.get('code');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            await closeAuthBrowser();
            navigate(authType === 'recovery' ? '/reset-password' : '/', { replace: true });
            return;
          }

          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
            await closeAuthBrowser();
            navigate('/', { replace: true });
            return;
          }

          if (urlObj.pathname && urlObj.pathname !== '/auth/callback') {
            navigate(urlObj.pathname, { replace: true });
          }
        });

        cleanup = () => listener.remove();
      } catch {
        // Not running in Capacitor (web environment) — ignore
      }
    };

    setupCapacitorDeepLinks();

    // Handle web-based reset links
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      navigate('/reset-password' + hash, { replace: true });
    }

    return () => cleanup?.();
  }, [navigate]);
};
