import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-[2rem] bg-error/10 flex items-center justify-center text-error mb-6 border border-error/10">
        <AlertTriangle className="w-10 h-10" />
      </div>
      {title && (
        <h3 className="text-headline-lg-mobile font-bold text-on-surface mb-2">{title}</h3>
      )}
      {message && (
        <p className="text-on-surface-variant/60 text-body-md text-center max-w-sm mb-4">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel || "Retry"}
        </button>
      )}
    </div>
  );
}
