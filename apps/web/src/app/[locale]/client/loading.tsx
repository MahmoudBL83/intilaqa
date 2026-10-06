export default function ClientLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="w-56 h-8 rounded-xl bg-white/20 mb-2" />
        <div className="w-80 h-4 rounded-full bg-white/20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="floating-glass p-6 rounded-[2rem]">
            <div className="w-10 h-10 rounded-xl bg-white/20 mb-5" />
            <div className="w-20 h-3 rounded-full bg-white/20 mb-2" />
            <div className="w-32 h-8 rounded-lg bg-white/20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="floating-glass rounded-[2rem] p-6">
          <div className="w-48 h-5 rounded-lg bg-white/20 mb-2" />
          <div className="w-64 h-3 rounded-full bg-white/20 mb-6" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/20 shrink-0" />
              <div className="flex-1">
                <div className="w-32 h-4 rounded-full bg-white/20 mb-1" />
                <div className="w-20 h-3 rounded-full bg-white/20" />
              </div>
              <div className="w-14 h-6 rounded-lg bg-white/20" />
            </div>
          ))}
        </div>
        <div className="floating-glass rounded-[2rem] p-6">
          <div className="w-32 h-5 rounded-lg bg-white/20 mb-5" />
          <div className="w-40 h-3 rounded-full bg-white/20 mb-6" />
          <div className="w-36 h-3 rounded-full bg-white/20 mb-2" />
          <div className="w-28 h-3 rounded-full bg-white/20 mb-2" />
          <div className="w-44 h-3 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
