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
    let lastHandledUrl = '';

    const normalizePath = (urlObj: URL) => {
      if (urlObj.pathname === '/auth/callback') return '/auth/callback';
      if (urlObj.hostname === 'auth' && urlObj.pathname === '/callback') return '/auth/callback';
      if (urlObj.hostname === 'reset-password' && (!urlObj.pathname || urlObj.pathname === '/')) return '/reset-password';
      return urlObj.pathname;
    };

    const closeAuthBrowser = async () => {
      try {
        await Browser.close();
      } catch {
        // Browser may already be closed; ignore
      }
    };

    const handleIncomingUrl = async (incomingUrl?: string | null) => {
      if (!incomingUrl || incomingUrl === lastHandledUrl) return;

      lastHandledUrl = incomingUrl;

      const urlObj = new URL(incomingUrl);
      const hash = urlObj.hash.startsWith('#') ? urlObj.hash.slice(1) : urlObj.hash;
      const hashParams = new URLSearchParams(hash);
      const searchParams = urlObj.searchParams;
      const accessToken = hashParams.get('access_token') ?? searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') ?? searchParams.get('refresh_token');
      const authType = hashParams.get('type') ?? searchParams.get('type');
      const code = urlObj.searchParams.get('code');
      const normalizedPath = normalizePath(urlObj);

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        await closeAuthBrowser();
        navigate(authType === 'recovery' ? `/reset-password${urlObj.hash}` : '/', { replace: true });
        return;
      }

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        await closeAuthBrowser();
        navigate('/', { replace: true });
        return;
      }

      if (normalizedPath && normalizedPath !== '/auth/callback') {
        navigate(normalizedPath, { replace: true });
      }
    };

    // Handle deep links from Capacitor (native mobile)
    const setupCapacitorDeepLinks = async () => {
      try {
        const { App } = await import('@capacitor/app');

        const listener = await App.addListener('appUrlOpen', async ({ url }) => {
          await handleIncomingUrl(url);
        });

        const launchUrl = await App.getLaunchUrl();
        await handleIncomingUrl(launchUrl?.url);

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
