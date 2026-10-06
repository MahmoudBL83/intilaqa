import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  variant?: "primary" | "secondary" | "neutral" | "error";
};

const variantStyles = {
  primary: {
    card: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
    text: "text-blue-900",
    iconBg: "bg-blue-100 text-blue-600",
    badgeBg: "bg-blue-100 text-blue-700",
  },
  secondary: {
    card: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
    text: "text-green-900",
    iconBg: "bg-green-100 text-green-600",
    badgeBg: "bg-green-100 text-green-700",
  },
  neutral: {
    card: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200",
    text: "text-gray-900",
    iconBg: "bg-gray-100 text-gray-600",
    badgeBg: "bg-gray-100 text-gray-700",
  },
  error: {
    card: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
    text: "text-red-900",
    iconBg: "bg-red-100 text-red-600",
    badgeBg: "bg-red-100 text-red-700",
  },
};

export function StatCard({ title, value, icon: Icon, trend, variant = "primary" }: StatCardProps) {
  const styles = variantStyles[variant];
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;

  return (
    <div className={cn("rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow", styles.card)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", styles.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1", styles.badgeBg)}>
            <TrendIcon className="w-3 h-3" />
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className={cn("text-sm font-medium mb-1", styles.text)}>
          {title}
        </p>
        <p className={cn("text-3xl font-bold", styles.text)}>
          {value}
        </p>
      </div>
    </div>
  );
}
