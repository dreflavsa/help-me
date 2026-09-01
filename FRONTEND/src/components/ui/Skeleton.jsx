export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-variant/70 ${className}`}
    />
  );
}

export function SkeletonPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 md:px-10 py-8">
      <Skeleton className="h-4 w-32 mb-6" />

      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96 max-w-full mb-8" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}

export function SkeletonList({ nombre = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: nombre }).map((_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
  );
}
