import { cn } from "../../lib/utils";

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function SettingsCard({ title, description, children, className }: SettingsCardProps) {
  return (
    <div className={cn("floating-glass rounded-[2rem] p-8", className)}>
      <h3 className="text-[18px] font-bold text-on-surface mb-1">{title}</h3>
      {description && <p className="text-on-surface-variant/60 text-body-sm mb-6">{description}</p>}
      {children}
    </div>
  );
}
