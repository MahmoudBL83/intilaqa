import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-bold text-on-surface mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-5 py-3 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all",
            error && "border-error focus:border-error focus:ring-error/10",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-[12px] font-medium text-error">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
