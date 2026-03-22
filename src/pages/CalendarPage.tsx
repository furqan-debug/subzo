import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import SubscriptionLogo from '@/components/SubscriptionLogo';
import FeatureGate from '@/components/FeatureGate';
import { DayPicker, DayContentProps } from 'react-day-picker';
import { useProfile } from '@/hooks/useProfile';

// ─── CustomDayContent defined OUTSIDE the component to prevent remount on every render ───
interface CustomDayContentProps extends DayContentProps {
  renewalMap: Map<string, Subscription[]>;
}

const CustomDayContent = ({ date, renewalMap }: CustomDayContentProps) => {
  const key = format(date, 'yyyy-MM-dd');
  const subs = renewalMap.get(key);
  return (
    <div className="relative flex flex-col items-center">
      <span>{date.getDate()}</span>
      {subs && subs.length > 0 && (
        <div className="flex gap-0.5 mt-0.5">
          {subs.slice(0, 3).map((sub) => (
            <div key={sub.id} className="h-1.5 w-1.5 rounded-full bg-primary" />
          ))}
        </div>
      )}
    </div>
  );
};

const CalendarPage = () => {
  return (
    <FeatureGate
      feature="calendar_view"
      title="Calendar View"
      description="Upgrade to any paid plan to see when your subscriptions renew on a calendar."
    >
      <CalendarContent />
    </FeatureGate>
  );
};

const CalendarContent = () => {
  const { data: subscriptions } = useSubscriptions();
  const { currency } = useProfile();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [month, setMonth] = useState(new Date());

  const activeSubscriptions = useMemo(
    () => subscriptions?.filter((s) => s.status === 'active') ?? [],
    [subscriptions]
  );

  const renewalMap = useMemo(() => {
    const map = new Map<string, Subscription[]>();
    activeSubscriptions.forEach((sub) => {
      const key = sub.next_renewal.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(sub);
      map.set(key, list);
    });
    return map;
  }, [activeSubscriptions]);

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedSubs = selectedKey ? renewalMap.get(selectedKey) ?? [] : [];

  const renewalDays = useMemo(
    () => [...renewalMap.keys()].map((key) => parseISO(key)),
    [renewalMap]
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">See when your subscriptions renew</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-4">
          <div className="relative z-10">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={setMonth}
              modifiers={{ renewal: renewalDays }}
              className={cn('p-0 pointer-events-auto [&_.rdp-month]:w-full')}
              classNames={{
                months: 'flex flex-col w-full',
                month: 'space-y-3 w-full',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-display font-semibold',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-secondary/50 hover:bg-secondary rounded-lg p-0 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex w-full',
                head_cell: 'text-muted-foreground flex-1 font-normal text-[0.7rem] uppercase tracking-wider',
                row: 'flex w-full mt-1',
                cell: 'flex-1 text-center text-sm p-0.5 relative',
                day: cn(
                  'h-10 w-full rounded-lg font-normal transition-all duration-200',
                  'hover:bg-secondary/50 focus:bg-secondary/50',
                  'aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:font-semibold'
                ),
                day_selected: 'bg-primary text-primary-foreground',
                day_today: 'bg-accent/15 text-accent font-semibold',
                day_outside: 'text-muted-foreground/30',
                day_disabled: 'text-muted-foreground/30',
                day_hidden: 'invisible',
              }}
              components={{
                DayContent: (props) => <CustomDayContent {...props} renewalMap={renewalMap} />,
                IconLeft: () => (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                ),
                IconRight: () => (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                ),
              }}
            />
          </div>
        </div>
      </motion.div>

      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-base font-semibold mb-2">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          {selectedSubs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No renewals on this day</p>
          ) : (
            <div className="space-y-2">
              {selectedSubs.map((sub) => (
                <Link key={sub.id} to={`/subscription/${sub.id}`}>
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Card className="glass-card hover:border-primary/30 transition-all">
                      <CardContent className="flex items-center gap-3 p-3 relative z-10">
                        <div className="icon-premium h-10 w-10 shrink-0">
                          <SubscriptionLogo name={sub.name} logoUrl={sub.logo_url} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{sub.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{sub.billing_cycle}</p>
                        </div>
                        <p className="text-sm font-bold">{formatCurrency(Number(sub.amount), currency)}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CalendarPage;
