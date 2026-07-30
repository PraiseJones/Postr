// Streams instantly on navigation so clicks give immediate feedback while
// the server renders the page.
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-9 w-48 rounded bg-white/5" />
        <div className="h-4 w-72 rounded bg-white/5" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-white/10 bg-zinc-900/50"
          />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-white/10 bg-zinc-900/50" />
    </div>
  );
}
