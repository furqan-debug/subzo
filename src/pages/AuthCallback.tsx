import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const [showFallback, setShowFallback] = useState(false);

  const launchUrl = useMemo(() => {
    const currentUrl = new URL(window.location.href);
    const combinedParams = new URLSearchParams(currentUrl.search);
    const hashParams = new URLSearchParams(
      currentUrl.hash.startsWith('#') ? currentUrl.hash.slice(1) : currentUrl.hash
    );

    hashParams.forEach((value, key) => {
      if (!combinedParams.has(key)) {
        combinedParams.set(key, value);
      }
    });

    const query = combinedParams.toString();
    return `com.subzo.app://auth/callback${query ? `?${query}` : ''}`;
  }, []);

  useEffect(() => {
    // Try custom scheme redirect immediately
    window.location.href = launchUrl;

    // Retry after a short delay
    const retry = setTimeout(() => {
      window.location.href = launchUrl;
    }, 300);

    // Show manual fallback after 2s
    const fallback = setTimeout(() => setShowFallback(true), 2000);

    return () => {
      clearTimeout(retry);
      clearTimeout(fallback);
    };
  }, [launchUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] gap-4 px-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Subzo</h1>
        <Loader2 className="h-6 w-6 animate-spin text-[#6366f1]" />
        <p className="text-[#a1a1aa] text-sm">Redirecting to app...</p>
      </div>

      {showFallback && (
        <div className="mt-6 space-y-3 text-center">
          <p className="text-white text-sm font-medium">
            Tap below to open Subzo
          </p>
          <Button
            asChild
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-full px-6"
          >
            <a href={launchUrl}>Open Subzo</a>
          </Button>
          <p className="text-[#71717a] text-xs mt-2">
            If the app doesn't open, make sure Subzo is installed.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
