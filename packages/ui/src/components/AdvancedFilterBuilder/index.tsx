"use client";

import { Plus, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

export interface FilterCondition {
  id: string;
  field: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte" | "between" | "in";
  value: string | string[] | number | number[] | boolean;
  dataType: "string" | "number" | "date" | "boolean" | "select";
}

export interface FilterGroup {
  id: string;
  logic: "AND" | "OR";
  conditions: (FilterCondition | FilterGroup)[];
}

export interface FilterField {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "select";
  operators: string[];
  options?: { label: string; value: string }[];
}

export interface AdvancedFilterBuilderProps {
  fields: FilterField[];
  onFilterChange: (filters: FilterGroup) => void;
  onApply?: () => void;
  onReset?: () => void;
}

const OPERATOR_LABELS: Record<string, string> = {
  equals: "Equals",
  contains: "Contains",
  startsWith: "Starts With",
  endsWith: "Ends With",
  gt: "Greater Than",
  lt: "Less Than",
  gte: "Greater Than or Equal",
  lte: "Less Than or Equal",
  between: "Between",
  in: "In List",
};

export function AdvancedFilterBuilder({
  fields,
  onFilterChange,
  onApply,
  onReset,
}: AdvancedFilterBuilderProps) {
  const [filterGroup, setFilterGroup] = useState<FilterGroup>({
    id: "root",
    logic: "AND",
    conditions: [],
  });

  const [expanded, setExpanded] = useState(true);

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(),
      field: fields[0]?.key || "",
      operator: "equals",
      value: "",
      dataType: fields[0]?.type || "string",
    };
    setFilterGroup({
      ...filterGroup,
      conditions: [...filterGroup.conditions, newCondition],
    });
  };

  const removeCondition = (id: string) => {
    setFilterGroup({
      ...filterGroup,
      conditions: filterGroup.conditions.filter((c: any) => c.id !== id),
    });
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setFilterGroup({
      ...filterGroup,
      conditions: filterGroup.conditions.map((c: any) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const changeLogic = (logic: "AND" | "OR") => {
    setFilterGroup({ ...filterGroup, logic });
    onFilterChange({ ...filterGroup, logic });
  };

  const handleReset = () => {
    setFilterGroup({
      id: "root",
      logic: "AND",
      conditions: [],
    });
    onReset?.();
  };

  const getFieldConfig = (fieldKey: string): FilterField | undefined => {
    return fields.find((f) => f.key === fieldKey);
  };

  const renderConditionInput = (
    condition: FilterCondition,
    fieldConfig: FilterField | undefined
  ) => {
    if (!fieldConfig) return null;

    switch (fieldConfig.type) {
      case "select":
        return (
          <select
            value={condition.value as string}
            onChange={(e) =>
              updateCondition(condition.id, { value: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-white/40 border border-white/40 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select...</option>
            {fieldConfig.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            value={condition.value as string}
            onChange={(e) =>
              updateCondition(condition.id, { value: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-white/40 border border-white/40 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={condition.value as number}
            onChange={(e) =>
              updateCondition(condition.id, {
                value: e.target.value ? parseFloat(e.target.value) : "",
              })
            }
            placeholder="Enter value"
            className="px-3 py-2 rounded-lg bg-white/40 border border-white/40 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );
      case "boolean":
        return (
          <select
            value={condition.value as string}
            onChange={(e) =>
              updateCondition(condition.id, { value: e.target.value === "true" })
            }
            className="px-3 py-2 rounded-lg bg-white/40 border border-white/40 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={condition.value as string}
            onChange={(e) =>
              updateCondition(condition.id, { value: e.target.value })
            }
            placeholder="Enter value"
            className="px-3 py-2 rounded-lg bg-white/40 border border-white/40 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );
    }
  };

  return (
    <div className="floating-glass rounded-[2rem] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-on-surface font-bold text-[14px] hover:text-primary transition-colors"
        >
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform",
              expanded && "rotate-180"
            )}
          />
          Advanced Filters
        </button>
        {filterGroup.conditions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-[12px] font-medium">
              {filterGroup.conditions.length} filter(s) applied
            </span>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-error bg-error/10 hover:bg-error/20 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Logic Toggle */}
          {filterGroup.conditions.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-on-surface-variant text-[12px] font-medium">
                Match:
              </span>
              <div className="flex gap-2 bg-white/20 p-1 rounded-lg">
                <button
                  onClick={() => changeLogic("AND")}
                  className={cn(
                    "px-4 py-2 rounded-md text-[12px] font-bold transition-colors",
                    filterGroup.logic === "AND"
                      ? "bg-primary text-white"
                      : "text-on-surface hover:bg-white/20"
                  )}
                >
                  All (AND)
                </button>
                <button
                  onClick={() => changeLogic("OR")}
                  className={cn(
                    "px-4 py-2 rounded-md text-[12px] font-bold transition-colors",
                    filterGroup.logic === "OR"
                      ? "bg-primary text-white"
                      : "text-on-surface hover:bg-white/20"
                  )}
                >
                  Any (OR)
                </button>
              </div>
            </div>
          )}

          {/* Conditions */}
          <div className="space-y-3">
            {filterGroup.conditions.map((condition: any, idx) => {
              const fieldConfig = getFieldConfig(condition.field);
              return (
                <div
                  key={condition.id}
                  className="flex items-end gap-3 p-4 bg-white/20 rounded-xl border border-white/30"
                >
                  <div className="flex-1 min-w-0">
                    <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1.5 block">
                      Field
                    </label>
                    <select
                      value={condition.field}
                      onChange={(e) => {
                        const newField = fields.find(
                          (f) => f.key === e.target.value
                        );
                        updateCondition(condition.id, {
                          field: e.target.value,
                          dataType: (newField?.type as any) || "string",
                          operator: (newField?.operators[0] as any) || "equals",
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white/40 border border-white/40 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {fields.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1.5 block">
                      Operator
                    </label>
                    <select
                      value={condition.operator}
                      onChange={(e) =>
                        updateCondition(condition.id, {
                          operator: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white/40 border border-white/40 text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {fieldConfig?.operators.map((op) => (
                        <option key={op} value={op}>
                          {OPERATOR_LABELS[op] || op}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1.5 block">
                      Value
                    </label>
                    {renderConditionInput(condition, fieldConfig)}
                  </div>

                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="w-10 h-10 rounded-lg bg-error/10 text-error hover:bg-error/20 flex items-center justify-center transition-colors shrink-0"
                    title="Remove filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Filter Button */}
          <button
            onClick={addCondition}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/40 text-primary text-[13px] font-bold hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Filter
          </button>

          {/* Action Buttons */}
          {filterGroup.conditions.length > 0 && (
            <div className="flex gap-3 pt-3 border-t border-white/20">
              <button
                onClick={() => {
                  onFilterChange(filterGroup);
                  onApply?.();
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-[13px] font-bold hover:scale-105 transition-transform"
              >
                Apply Filters
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/20 text-on-surface text-[13px] font-bold hover:bg-white/40 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
