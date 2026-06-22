export default function Loading() {
  return (
    <div className="flex h-full gap-0 overflow-hidden animate-pulse">
      <aside className="w-52 shrink-0 border-r border-border" />
      <div className="flex-1 p-8 space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-6 w-64 rounded bg-muted" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 rounded bg-muted" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
