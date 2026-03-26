import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  gradientFrom: string;
  gradientTo: string;
  trend?: number;
  sparklineData?: number[];
  formatValue?: (v: number) => string;
  suffix?: string;
  delay?: number;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  gradientFrom,
  gradientTo,
  trend,
  sparklineData,
  formatValue,
  suffix,
  delay = 0,
}: KpiCardProps) {
  const animatedValue = useAnimatedCounter(value);
  const chartData = sparklineData?.map((v, i) => ({ i, v })) || [];
  const gradientId = `kpi-${title.replace(/\s+/g, "-").toLowerCase()}`;

  const displayValue = formatValue
    ? formatValue(animatedValue)
    : animatedValue.toLocaleString();

  return (
    <Card
      className="group relative overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient top border */}
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-lg"
        style={{
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className="rounded-xl p-2.5 text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-2xl font-bold tracking-tight">
              {displayValue}
              {suffix && (
                <span className="text-base font-medium text-muted-foreground ml-0.5">
                  {suffix}
                </span>
              )}
            </div>
            {trend !== undefined && trend !== 0 && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                  trend > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend > 0 ? "+" : ""}
                {trend.toFixed(1)}%
              </div>
            )}
            {trend === 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-muted-foreground">
                <Minus className="h-3 w-3" />
                No change
              </div>
            )}
          </div>

          {chartData.length > 1 && (
            <div className="w-24 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={gradientTo} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={gradientFrom}
                    strokeWidth={1.5}
                    fill={`url(#${gradientId})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
