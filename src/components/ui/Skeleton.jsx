// Skeleton loaders mejorados — shimmer animado + variantes
export function SkeletonCard() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface-container, #171f33)' }}
    >
      <div className="skeleton-shimmer" style={{ aspectRatio: '3/4', width: '100%' }} />
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton-shimmer" style={{ height: 12, borderRadius: 4, width: '85%' }} />
        <div className="skeleton-shimmer" style={{ height: 12, borderRadius: 4, width: '60%' }} />
        <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
          <div className="skeleton-shimmer" style={{ height: 18, borderRadius: 99, width: 48 }} />
          <div className="skeleton-shimmer" style={{ height: 18, borderRadius: 99, width: 40 }} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 12 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonRankRow() {
  return (
    <div
      className="rounded-xl"
      style={{
        background: 'var(--color-surface-container, #171f33)',
        border: '1px solid rgba(77,67,84,0.4)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      }}
    >
      <div className="skeleton-shimmer" style={{ width: 32, height: 28, borderRadius: 4, flexShrink: 0 }} />
      <div className="skeleton-shimmer" style={{ width: 44, height: 58, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton-shimmer" style={{ height: 13, borderRadius: 4, width: '70%' }} />
        <div className="skeleton-shimmer" style={{ height: 11, borderRadius: 4, width: '45%' }} />
        <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
          <div className="skeleton-shimmer" style={{ height: 16, borderRadius: 99, width: 40 }} />
          <div className="skeleton-shimmer" style={{ height: 16, borderRadius: 99, width: 40 }} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{ height: 12, borderRadius: 4, width: i === lines - 1 ? '55%' : '100%' }}
        />
      ))}
    </div>
  )
}
