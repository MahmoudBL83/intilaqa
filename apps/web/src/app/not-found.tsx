import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-[120px] font-bold text-primary/20 leading-none mb-4">404</div>
        <h1 className="text-headline-lg font-bold text-on-surface mb-2">Page Not Found</h1>
        <p className="text-on-surface-variant/60 text-body-md max-w-sm mx-auto mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/ar"
          className="inline-flex px-6 py-3 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
