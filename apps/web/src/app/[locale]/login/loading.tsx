export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-pulse">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto mb-4" />
          <div className="w-40 h-6 rounded-lg bg-white/20 mx-auto mb-2" />
          <div className="w-56 h-4 rounded-full bg-white/20 mx-auto" />
        </div>
        <div className="floating-glass rounded-[2.5rem] p-8 mb-6">
          <div className="w-32 h-6 rounded-lg bg-white/20 mb-2" />
          <div className="w-48 h-4 rounded-full bg-white/20 mb-8" />
          <div className="space-y-5">
            <div>
              <div className="w-12 h-3 rounded-full bg-white/20 mb-2" />
              <div className="h-12 rounded-2xl bg-white/20" />
            </div>
            <div>
              <div className="w-16 h-3 rounded-full bg-white/20 mb-2" />
              <div className="h-12 rounded-2xl bg-white/20" />
            </div>
            <div className="h-12 rounded-2xl bg-white/20" />
          </div>
        </div>
        <div className="floating-glass rounded-[2.5rem] p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-4 rounded-full bg-white/20" />
            <div className="w-48 h-4 rounded-full bg-white/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/20 shrink-0" />
                <div className="flex-1">
                  <div className="w-20 h-3 rounded-full bg-white/20 mb-1" />
                  <div className="w-28 h-3 rounded-full bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
