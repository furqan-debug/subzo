import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const GOOGLE_WEB_CLIENT_ID = '710406899937-8l7n9kdlvc2l4t5hvl3qf9t9qj4lc5pn.apps.googleusercontent.com';

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

    // Clear stale credentials to avoid cached session issues
    try {
      await SocialLogin.logout({ provider: 'google' });
    } catch {
      // Ignore logout errors — user may not have been logged in
    }

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
    // Handle user cancellation gracefully
    const message = err?.message || '';
    if (
      message.includes('canceled') ||
      message.includes('cancelled') ||
      message.includes('[16]')
    ) {
      console.log('Google sign-in cancelled by user');
      return { error: null };
    }

    console.error('Native Google sign-in error:', err);
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
