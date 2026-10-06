import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        {label && (
          <label htmlFor={selectId} className="block text-[13px] font-bold text-on-surface mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all",
            error && "border-error focus:border-error focus:ring-error/10",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-[12px] font-medium text-error">{error}</p>}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
