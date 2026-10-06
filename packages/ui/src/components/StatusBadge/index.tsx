import { cn } from "../../lib/utils";

type StatusBadgeProps = {
  status: string;
  label?: string;
};

const statusStyles: Record<string, string> = {
  active: "bg-primary/10 text-primary border border-primary/10",
  approved: "bg-primary/10 text-primary border border-primary/10",
  present: "bg-primary/10 text-primary border border-primary/10",
  paid: "bg-primary/10 text-primary border border-primary/10",

  pending: "bg-on-surface-variant/10 text-on-surface-variant border border-white/20",
  draft: "bg-on-surface-variant/10 text-on-surface-variant border border-white/20",
  trial: "bg-on-surface-variant/10 text-on-surface-variant border border-white/20",

  rejected: "bg-error/10 text-error border border-error/10",
  expired: "bg-error/10 text-error border border-error/10",
  absent: "bg-error/10 text-error border border-error/10",

  inactive: "bg-surface-container text-on-surface-variant/50 border border-white/20",
  cancelled: "bg-surface-container text-on-surface-variant/50 border border-white/20",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.pending;

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest", style)}>
      {label || status}
    </span>
  );
}
