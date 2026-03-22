import { NavLink, useMatch } from 'react-router-dom';
import { Home, CalendarDays, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar', exact: false },
  { to: '/add', icon: PlusCircle, label: 'Add', center: true, exact: false },
  { to: '/analytics', icon: BarChart3, label: 'Insights', exact: false },
  { to: '/settings', icon: Settings, label: 'Settings', exact: false },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="font-display text-xl font-bold text-gradient">
            Subzo
          </h1>
        </div>
      </header>

      {/* Content — pb accounts for fixed nav + iOS home indicator */}
      <main
        className="relative z-10 flex-1 mx-auto w-full max-w-lg px-4 py-6"
        style={{ paddingBottom: 'max(6rem, calc(4.5rem + env(safe-area-inset-bottom)))' }}
      >
        {children}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 bg-background/60 backdrop-blur-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label, center, exact }) => (
            <NavItem key={to} to={to} icon={Icon} label={label} center={center} exact={exact} />
          ))}
        </div>
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  center?: boolean;
  exact?: boolean;
}

const NavItem = ({ to, icon: Icon, label, center, exact }: NavItemProps) => {
  const match = useMatch({ path: to, end: exact ?? false });
  const isActive = !!match;

  if (center) {
    return (
      <NavLink
        to={to}
        aria-label={label}
        className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 text-xs"
      >
        <div className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300',
          isActive
            ? 'bg-primary/25 border-primary/50'
            : 'bg-primary/15 border-primary/30'
        )}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-primary font-medium">{label}</span>
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
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
      <span className={cn('transition-all duration-300', isActive && 'font-medium')}>{label}</span>
    </NavLink>
  );
};

export default AppLayout;
