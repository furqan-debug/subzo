import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Transparent auth callback page.
 * When Supabase verifies an email, it redirects here (web URL) with auth tokens.
 * This page immediately redirects to the native app scheme (com.subzo.app://)
 * so the Android app opens and handles the session.
 * 
 * Users never see this page — it's a pass-through.
 */
const AuthCallback = () => {
  const [showFallback, setShowFallback] = useState(false);

  const launchUrls = useMemo(() => {
    const currentUrl = new URL(window.location.href);
    const combinedParams = new URLSearchParams(currentUrl.search);
    const hashParams = new URLSearchParams(currentUrl.hash.startsWith('#') ? currentUrl.hash.slice(1) : currentUrl.hash);

    hashParams.forEach((value, key) => {
      if (!combinedParams.has(key)) {
        combinedParams.set(key, value);
      }
    });

    const query = combinedParams.toString();
    const appPath = `auth/callback${query ? `?${query}` : ''}`;

    return {
      native: `com.subzo.app://${appPath}`,
      intent: `intent://${appPath}#Intent;scheme=com.subzo.app;package=com.subzo.app;end`,
    };
  }, []);

  useEffect(() => {
    const isAndroid = /android/i.test(window.navigator.userAgent);
    const primaryUrl = isAndroid ? launchUrls.intent : launchUrls.native;
    const secondaryUrl = isAndroid ? launchUrls.native : launchUrls.intent;

    const openNativeApp = (url: string) => {
      window.location.replace(url);
    };

    openNativeApp(primaryUrl);

    const retry = window.setTimeout(() => openNativeApp(secondaryUrl), 600);
    const timeout = window.setTimeout(() => setShowFallback(true), 2200);
    
    return () => {
      clearTimeout(retry);
      clearTimeout(timeout);
    };
  }, [launchUrls]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Opening Subzo...</p>
      {showFallback && (
        <div className="mt-4 space-y-3 text-center">
          <p className="text-foreground text-sm font-medium">Open Subzo to finish signing in.</p>
          <p className="text-muted-foreground text-xs">Tap below if Android did not switch back automatically.</p>
          <Button asChild variant="outline" size="sm">
            <a href={launchUrls.intent}>Open Subzo</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
