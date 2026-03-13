import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const GOOGLE_WEB_CLIENT_ID = '710406899937-8i7n9kdivc214t5hvl3qf9t9oj4lc5pn.apps.googleusercontent.com';

let initialized = false;

export async function initializeGoogleAuth() {
  if (!Capacitor.isNativePlatform() || initialized) return;

  try {
    const { SocialLogin } = await import('@capgo/capacitor-social-login');
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        mode: 'online',
      },
    });
    initialized = true;
    console.log('Google Auth initialized (native)');
  } catch (err) {
    console.error('Failed to initialize Google Auth:', err);
  }
}

export async function signInWithGoogle(): Promise<{ error: { message: string } | null }> {
  if (Capacitor.isNativePlatform()) {
    return signInNative();
  }
  return signInWeb();
}

async function signInNative(): Promise<{ error: { message: string } | null }> {
  try {
    const { SocialLogin } = await import('@capgo/capacitor-social-login');

    const response = await SocialLogin.login({
      provider: 'google',
      options: {},
    });

    const idToken = (response as any)?.result?.idToken;
    if (!idToken) {
      return { error: { message: 'No ID token received from Google' } };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { error: null };
  } catch (err: any) {
    const message = err?.message || '';
    const errorCode = err?.code || err?.result?.code || '';
    console.error('=== GOOGLE SIGN-IN DEBUG ===');
    console.error('Full error object:', JSON.stringify(err, null, 2));
    console.error('Error code:', errorCode);
    console.error('Error message:', message);
    console.error('===========================');

    // Genuine user cancellation (pressed back before selecting account)
    if (/cancel/i.test(message)) {
      // Log it but show a helpful message — this often indicates SHA-1/config issues
      return { error: { message: 'Google sign-in was interrupted. If this keeps happening, the app may need a configuration update.' } };
    }

    return { error: { message: message || 'Google sign-in failed on native device' } };
  }
}

async function signInWeb(): Promise<{ error: { message: string } | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}
