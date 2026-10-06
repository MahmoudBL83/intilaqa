import { cn } from "../../lib/utils";

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("floating-glass rounded-[2rem] p-8", className)}>
      <h3 className="text-[18px] font-bold text-on-surface mb-1">{title}</h3>
      {description && <p className="text-on-surface-variant/60 text-body-sm mb-6">{description}</p>}
      <div className="space-y-5">{children}</div>
    </div>
  );
}
