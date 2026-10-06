import { cn } from "../../lib/utils";

type TimelineBarProps = {
  start: string;
  end: string;
  color?: "blue" | "emerald" | "purple" | "amber" | "green" | "red";
  height?: number;
  className?: string;
};

const barColors = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  red: "bg-red-500",
};

const trackColors = {
  blue: "bg-blue-100",
  emerald: "bg-emerald-100",
  purple: "bg-purple-100",
  amber: "bg-amber-100",
  green: "bg-green-100",
  red: "bg-red-100",
};

function timeToMinutes(t: string): number {
  const parts = t.split(":").map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  return h * 60 + m;
}

export function TimelineBar({
  start,
  end,
  color = "emerald",
  height = 8,
  className,
}: TimelineBarProps) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const totalMin = 24 * 60;

  const segments: { left: string; width: string }[] = [];

  if (startMin < endMin) {
    segments.push({
      left: `${(startMin / totalMin) * 100}%`,
      width: `${((endMin - startMin) / totalMin) * 100}%`,
    });
  } else {
    segments.push({
      left: `${(startMin / totalMin) * 100}%`,
      width: `${((totalMin - startMin) / totalMin) * 100}%`,
    });
    segments.push({
      left: "0%",
      width: `${(endMin / totalMin) * 100}%`,
    });
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn("relative w-full rounded-full overflow-hidden", trackColors[color])}
        style={{ height }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn("absolute top-0 h-full rounded-full", barColors[color])}
            style={{ left: seg.left, width: seg.width }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400 font-medium">00:00</span>
        <span className="text-[10px] text-gray-400 font-medium">12:00</span>
        <span className="text-[10px] text-gray-400 font-medium">24:00</span>
      </div>
    </div>
  );
}
