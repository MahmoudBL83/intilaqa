import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  message?: string;
  size?: "sm" | "md" | "lg";
};

export function LoadingState({ message = "Loading...", size = "md" }: LoadingStateProps) {
  const sizes = { sm: "w-6 h-6", md: "w-10 h-10", lg: "w-16 h-16" };
  const texts = { sm: "text-sm", md: "text-body-md", lg: "text-lg" };

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className={`${sizes[size]} text-primary animate-spin`} />
      <p className={`${texts[size]} text-on-surface-variant/60 font-medium`}>{message}</p>
    </div>
  );
}
