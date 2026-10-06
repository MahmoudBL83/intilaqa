import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";

type QuickActionCardProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  href: string;
  variant?: "primary" | "secondary" | "neutral";
};

const variantStyles = {
  primary: {
    card: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
    text: "text-blue-900",
    iconBg: "bg-blue-200 text-blue-700",
  },
  secondary: {
    card: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
    text: "text-green-900",
    iconBg: "bg-green-200 text-green-700",
  },
  neutral: {
    card: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200",
    text: "text-gray-900",
    iconBg: "bg-gray-200 text-gray-700",
  },
};

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  variant = "neutral",
}: QuickActionCardProps) {
  const styles = variantStyles[variant];

  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "rounded-lg border p-5 shadow-sm hover:shadow-md transition-shadow",
          styles.card
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", styles.iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className={cn("font-semibold text-sm truncate", styles.text)}>{title}</p>
            {description && (
              <p className={cn("text-xs mt-0.5 truncate opacity-70", styles.text)}>{description}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
