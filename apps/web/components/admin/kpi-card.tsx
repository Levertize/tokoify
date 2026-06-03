import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, trend, icon }: KpiCardProps) {
  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return "text-green-600 bg-green-50";
    if (trendValue < 0) return "text-red-600 bg-red-50";
    return "text-zinc-600 bg-zinc-100";
  };

  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="size-3" />;
    if (trendValue < 0) return <TrendingDown className="size-3" />;
    return <Minus className="size-3" />;
  };

  const formatTrend = (trendValue: number) => {
    const sign = trendValue > 0 ? "+" : "";
    return `${sign}${trendValue}%`;
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-medium text-foreground">{value}</span>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              getTrendColor(trend.value)
            )}
          >
            {getTrendIcon(trend.value)}
            {formatTrend(trend.value)}
            {trend.label && (
              <span className="text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
