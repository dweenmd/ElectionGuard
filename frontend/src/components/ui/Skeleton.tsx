export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-variant/60 rounded animate-pulse ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-5 md:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-surface-variant/60 animate-pulse shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="h-3 w-1/5" />
        </div>
      </div>
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-4/5" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center flex flex-col items-center gap-2">
      <SkeletonLine className="h-3 w-16" />
      <SkeletonLine className="h-6 w-10" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <SkeletonLine className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
