import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  iconClassName?: string;
  progress?: number;
  progressBarClassName?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  hint,
  iconClassName,
  progress,
  progressBarClassName,
}: StatCardProps) => {
  return (
    <Card className="border-brand-border bg-brand-card rounded-3xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            {label}
          </p>
          <div
            aria-hidden="true"
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              iconClassName || "bg-brand-accent/10 text-brand-accent",
            )}
          >
            <Icon size={22} />
          </div>
        </div>
        <div className="text-3xl font-bold text-brand-text font-jakarta">
          {value}
        </div>
        {hint && <p className="text-xs text-brand-muted mt-2">{hint}</p>}
        {typeof progress === "number" && (
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label}: ${progress}%`}
            className="mt-3 h-2 bg-brand-background rounded-full overflow-hidden"
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progressBarClassName || "bg-brand-accent",
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
