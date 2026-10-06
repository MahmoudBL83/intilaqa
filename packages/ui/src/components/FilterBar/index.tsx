import { SlidersHorizontal } from "lucide-react";

type FilterOption = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  selected?: string;
  onChange?: (value: string) => void;
};

type FilterBarProps = {
  filters: FilterOption[];
};

export function FilterBar({ filters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white/20 rounded-2xl border border-outline-variant/30">
      <SlidersHorizontal className="w-5 h-5 text-on-surface-variant/50 shrink-0" />
      {filters.map((filter) => (
        <select
          key={filter.value}
          value={filter.selected || ""}
          onChange={(e) => filter.onChange?.(e.target.value)}
          className="bg-white/40 border border-outline-variant/50 rounded-xl px-3 py-2 text-on-surface text-[13px] font-medium outline-none focus:border-primary/30"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
