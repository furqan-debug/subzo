import { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Web Client ID from your Google Cloud Console (Web Sabzo)
const GOOGLE_WEB_CLIENT_ID = '710406899937-8l7n9kdlvc2l4t5hvl3qf9t9qj4lc5pn.apps.googleusercontent.com';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { SocialLogin } = await import('@capgo/capacitor-social-login');

        await SocialLogin.initialize({
          google: {
            webClientId: GOOGLE_WEB_CLIENT_ID,
            mode: 'online',
          },
        });

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

        return { error };
      } catch (err: any) {
        console.error('Native Google sign-in error:', err);
        return { error: err };
      }
    } else {
      // Web: use standard OAuth redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });

      if (data?.url) {
        window.location.href = data.url;
      }

      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
