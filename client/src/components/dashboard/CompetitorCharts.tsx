import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Crosshair, PieChartIcon } from "lucide-react";

interface CompetitorData {
  username: string;
  followers?: number;
  engagementRate?: number;
  postingFrequency?: number;
  avgLikes?: number;
  avgComments?: number;
}

interface CompetitorChartsProps {
  owner: CompetitorData | null;
  competitors: CompetitorData[];
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f97316", "#ef4444", "#06b6d4"];

export function CompetitorCharts({ owner, competitors }: CompetitorChartsProps) {
  if (!owner || competitors.length === 0) return null;

  const radarData = useMemo(() => {
    const metrics = [
      { key: "followers", label: "Followers" },
      { key: "engagementRate", label: "Engagement" },
      { key: "postingFrequency", label: "Posts/Week" },
      { key: "avgLikes", label: "Avg Likes" },
      { key: "avgComments", label: "Avg Comments" },
    ] as const;

    const all = [owner, ...competitors];
    const maxVals: Record<string, number> = {};
    metrics.forEach(({ key }) => {
      maxVals[key] = Math.max(...all.map((c) => (c as any)[key] || 0), 1);
    });

    return metrics.map(({ key, label }) => {
      const row: Record<string, any> = { metric: label };
      row["You"] = Math.round(((owner as any)[key] || 0) / maxVals[key] * 100);
      competitors.forEach((cp) => {
        row[`@${cp.username}`] = Math.round(((cp as any)[key] || 0) / maxVals[key] * 100);
      });
      return row;
    });
  }, [owner, competitors]);

  const followerShare = useMemo(() => {
    const all = [owner, ...competitors];
    return all.map((c, i) => ({
      name: c === owner ? "You" : `@${c.username}`,
      value: c.followers || 0,
      fill: COLORS[i % COLORS.length],
    }));
  }, [owner, competitors]);

  const radarKeys = ["You", ...competitors.map((c) => `@${c.username}`)];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Radar Comparison */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-primary" />
            Performance Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="65%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                {radarKeys.map((key, i) => (
                  <Radar
                    key={key}
                    dataKey={key}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={key === "You" ? 0.2 : 0.05}
                    strokeWidth={key === "You" ? 2.5 : 1.5}
                    strokeDasharray={key === "You" ? undefined : "4 4"}
                  />
                ))}
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium mb-1">{label}</p>
                        {payload.map((p: any) => (
                          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke }} />
                            <span className="text-muted-foreground">{p.dataKey}:</span>
                            <span className="font-medium">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Follower Share Pie */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            Follower Share
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={followerShare}
                  cx="50%"
                  cy="45%"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {followerShare.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const { name, value } = payload[0].payload;
                    const total = followerShare.reduce((s, e) => s + e.value, 0);
                    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{value.toLocaleString()} followers ({pct}%)</p>
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
