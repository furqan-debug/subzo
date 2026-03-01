import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/add', icon: PlusCircle, label: 'Add' },
  { to: '/analytics', icon: BarChart3, label: 'Insights' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="font-display text-xl font-bold text-gradient">
            Subzo
          </h1>
          <button
            onClick={signOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-lg px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 bg-background/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-4 py-1.5 text-xs transition-all duration-300',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2.5 h-0.5 w-6 rounded-full bg-gradient-to-r from-primary to-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={cn(
                  'h-5 w-5 transition-all duration-300',
                  isActive && 'drop-shadow-[0_0_10px_hsl(var(--primary)/0.6)]'
                )} />
                <span className={cn(
                  'transition-all duration-300',
                  isActive && 'font-medium'
                )}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
