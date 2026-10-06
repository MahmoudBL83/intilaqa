export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 animate-pulse" />
        <div className="w-40 h-4 rounded-full bg-white/20 animate-pulse" />
      </div>
    </div>
  );
}
