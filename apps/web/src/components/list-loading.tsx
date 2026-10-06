export function ListPageSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="w-56 h-8 rounded-xl bg-white/20 mb-2" />
        <div className="w-80 h-4 rounded-full bg-white/20" />
      </div>
      <div className="max-w-md mb-6">
        <div className="h-11 rounded-2xl bg-white/20" />
      </div>
      <div className="floating-glass rounded-[2rem] p-6">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-white/10 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 shrink-0" />
            <div className="flex-1">
              <div className="w-40 h-4 rounded-full bg-white/20 mb-1" />
              <div className="w-24 h-3 rounded-full bg-white/20" />
            </div>
            <div className="w-20 h-4 rounded-full bg-white/20" />
            <div className="w-14 h-6 rounded-full bg-white/20" />
            <div className="w-16 h-4 rounded-lg bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
