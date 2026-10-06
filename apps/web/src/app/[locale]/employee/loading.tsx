export default function EmployeeLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="w-56 h-8 rounded-xl bg-white/20 mb-2" />
        <div className="w-80 h-4 rounded-full bg-white/20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="floating-glass p-6 rounded-[2rem]">
            <div className="w-10 h-10 rounded-xl bg-white/20 mb-5" />
            <div className="w-20 h-3 rounded-full bg-white/20 mb-2" />
            <div className="w-32 h-8 rounded-lg bg-white/20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3 floating-glass rounded-[2rem] p-6">
          <div className="w-32 h-5 rounded-lg bg-white/20 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-5 rounded-[1.5rem] bg-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/20" />
                <div className="w-16 h-3 rounded-full bg-white/20" />
              </div>
            ))}
          </div>
        </div>
        <div className="floating-glass rounded-[2rem] p-6">
          <div className="w-24 h-5 rounded-lg bg-white/20 mb-2" />
          <div className="w-36 h-3 rounded-full bg-white/20 mb-5" />
          <div className="w-20 h-4 rounded-full bg-white/20 mb-1" />
          <div className="w-16 h-3 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="floating-glass rounded-[2rem] p-6">
        <div className="w-40 h-5 rounded-lg bg-white/20 mb-2" />
        <div className="w-56 h-3 rounded-full bg-white/20 mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="w-40 h-4 rounded-full bg-white/20 mb-1" />
              <div className="w-24 h-3 rounded-full bg-white/20" />
            </div>
            <div className="w-20 h-6 rounded-full bg-white/20" />
            <div className="w-14 h-6 rounded-lg bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
