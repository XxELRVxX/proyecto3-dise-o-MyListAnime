export function SkeletonCard() {
  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="flex gap-1 mt-1">
          <div className="skeleton h-4 rounded-full w-14" />
          <div className="skeleton h-4 rounded-full w-14" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}
