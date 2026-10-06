"use client";

import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function SearchInput({ placeholder = "Search...", value, onChange, className }: SearchInputProps) {
  return (
    <div className={cn(
      "flex items-center bg-white/40 border border-outline-variant/60 focus-within:bg-white/70 focus-within:border-primary/30 rounded-2xl transition-all h-11 px-4",
      className
    )}>
      <Search className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-on-surface placeholder-on-surface-variant/40 outline-none font-medium px-2"
      />
    </div>
  );
}
