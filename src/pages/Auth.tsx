import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Zap, TrendingDown, Bell } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const { user, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Check your email', description: 'Password reset link sent.' });
      setSubmitting(false);
      return;
    }

    const fn = mode === 'login' ? signIn : signUp;
    const { error } = await fn(email, password);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (mode === 'signup') {
      toast({ title: 'Account created!', description: 'Check your email to confirm.' });
    }
    setSubmitting(false);
  };

  const features = [
    { icon: Zap, label: 'Track all subscriptions in one place' },
    { icon: TrendingDown, label: 'See where your money goes' },
    { icon: Bell, label: 'Never get surprised by a charge' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
        <div className="relative z-10">
          <h1 className="font-display text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Subzo
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Take control of your subscriptions. Save money effortlessly.
          </p>
          <div className="space-y-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-foreground/80">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - auth form */}
      <div className="flex flex-1 items-center justify-center px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-8">
            <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Subzo
            </h1>
          </div>

          <h2 className="font-display text-2xl font-semibold mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm">
            {mode === 'login' ? 'Sign in to manage your subscriptions' : mode === 'signup' ? 'Start tracking your subscriptions' : 'We\'ll send you a reset link'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-border"
              />
            </div>

            <AnimatePresence mode="wait">
              {mode !== 'forgot' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-secondary/50 border-border"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </Button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  const { error } = await signInWithGoogle();
                  if (error) {
                    toast({
                      title: 'Google sign-in failed',
                      description: error.message || 'Please try again.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>Don't have an account?{' '}<button onClick={() => setMode('signup')} className="text-primary hover:underline">Sign up</button></>
            ) : (
              <>Already have an account?{' '}<button onClick={() => setMode('login')} className="text-primary hover:underline">Sign in</button></>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
