import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Transparent auth callback page.
 * When Supabase verifies an email, it redirects here (web URL) with auth tokens.
 * This page immediately redirects to the native app scheme (com.subzo.app://)
 * so the Android app opens and handles the session.
 * 
 * Users never see this page — it's a pass-through.
 */
const AuthCallback = () => {
  useEffect(() => {
    const NATIVE_SCHEME = 'com.subzo.app';
    
    // Grab everything from the current URL (hash + search params)
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Build the native deep link with the same tokens
    const nativeUrl = `${NATIVE_SCHEME}://auth/callback${search}${hash}`;
    
    // Redirect to native app
    window.location.href = nativeUrl;
    
    // Fallback: if the redirect doesn't work after 3s, show a message
    const timeout = setTimeout(() => {
      document.getElementById('fallback')?.classList.remove('hidden');
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Opening Subzo...</p>
      <div id="fallback" className="hidden text-center space-y-2 mt-4">
        <p className="text-foreground text-sm font-medium">Couldn't open the app automatically.</p>
        <p className="text-muted-foreground text-xs">Please open the Subzo app on your device.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
