import { Skeleton } from '@/components/ui/Skeleton';

export const IndexSkeleton = () => (
  <div className="space-y-6">
    {/* Hero card */}
    <div className="glass-card p-6 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-12 w-40" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-6 w-28 rounded-full" />
    </div>
    {/* Quick stats */}
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-card p-3 space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
    {/* Subscription rows */}
    <div className="space-y-2">
      <Skeleton className="h-5 w-36 mb-3" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="glass-card p-3 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-6 w-24" />
    <div className="grid grid-cols-2 gap-3">
      {[1, 2].map(i => (
        <div key={i} className="glass-card p-4 space-y-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
    <div className="glass-card p-4 flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="glass-card p-5 space-y-4">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  </div>
);

export const SettingsSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-6 w-20" />
    <div className="glass-card p-5 flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="glass-card p-5 space-y-5">
      {[1, 2].map(i => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-8 rounded-lg" />
    <div className="glass-card p-5 flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="glass-card p-4 space-y-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);
