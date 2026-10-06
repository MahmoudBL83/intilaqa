import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-[2rem] bg-on-surface-variant/5 flex items-center justify-center text-on-surface-variant/30 mb-6 border border-outline-variant/20">
        {icon || <Inbox className="w-10 h-10" />}
      </div>
      {title && (
        <h3 className="text-headline-lg-mobile font-bold text-on-surface mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-on-surface-variant/60 text-body-md text-center max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
