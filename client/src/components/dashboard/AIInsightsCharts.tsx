import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PieChartIcon, BarChart3, Activity } from "lucide-react";

// --- Gap Analysis Chart ---

interface GapChartProps {
  criticalGaps?: Array<{ area: string; priority: string }>;
  strengths?: string[];
  opportunities?: string[];
  quickWins?: string[];
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

export function GapAnalysisChart({ data }: { data: GapChartProps }) {
  const priorityData = useMemo(() => {
    if (!data.criticalGaps) return [];
    const counts: Record<string, number> = {};
    data.criticalGaps.forEach((g) => {
      const p = g.priority?.toLowerCase() || "medium";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      fill: PRIORITY_COLORS[priority] || "#6b7280",
    }));
  }, [data.criticalGaps]);

  const summaryData = useMemo(() => {
    return [
      { category: "Critical Gaps", count: data.criticalGaps?.length || 0, fill: "#ef4444" },
      { category: "Strengths", count: data.strengths?.length || 0, fill: "#10b981" },
      { category: "Opportunities", count: data.opportunities?.length || 0, fill: "#f59e0b" },
      { category: "Quick Wins", count: data.quickWins?.length || 0, fill: "#3b82f6" },
    ].filter((d) => d.count > 0);
  }, [data]);

  if (summaryData.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card className="animate-fade-in-up">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const { category, count } = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{category}</p>
                        <p className="text-xs text-muted-foreground">{count} items</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {summaryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {priorityData.length > 0 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Gap Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={4} dataKey="value" strokeWidth={2} stroke="#fff">
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.[0]) return null;
                      const { name, value } = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium">{name} Priority</p>
                          <p className="text-xs text-muted-foreground">{value} gaps</p>
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="bottom" height={30} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Growth Strategy Chart ---

interface GrowthChartProps {
  phases?: Array<{ name: string; actions: Array<{ priority: string }> }>;
  kpis?: Array<{ metric: string; currentValue: string; targetValue: string }>;
}

function parseNumber(val: string): number {
  const cleaned = val.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export function GrowthStrategyChart({ data }: { data: GrowthChartProps }) {
  const kpiChartData = useMemo(() => {
    if (!data.kpis) return [];
    return data.kpis
      .map((kpi) => ({
        metric: kpi.metric.length > 15 ? kpi.metric.slice(0, 15) + "…" : kpi.metric,
        current: parseNumber(kpi.currentValue),
        target: parseNumber(kpi.targetValue),
      }))
      .filter((d) => d.current > 0 || d.target > 0);
  }, [data.kpis]);

  const phaseData = useMemo(() => {
    if (!data.phases) return [];
    return data.phases.map((phase) => ({
      name: phase.name.length > 12 ? phase.name.slice(0, 12) + "…" : phase.name,
      High: phase.actions?.filter((a) => a.priority?.toLowerCase() === "high").length || 0,
      Medium: phase.actions?.filter((a) => a.priority?.toLowerCase() === "medium").length || 0,
      Low: phase.actions?.filter((a) => a.priority?.toLowerCase() === "low").length || 0,
    }));
  }, [data.phases]);

  if (kpiChartData.length === 0 && phaseData.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      {kpiChartData.length > 0 && (
        <Card className="animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              KPI: Current vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiChartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (!payload?.length) return null;
                      return (
                        <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium mb-1">{label}</p>
                          {payload.map((p: any) => (
                            <p key={p.dataKey} className="text-xs text-muted-foreground">
                              {p.name}: {p.value.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="bottom" height={30} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
                  <Bar dataKey="current" name="Current" fill="#6b7280" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {phaseData.length > 0 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Actions by Phase & Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (!payload?.length) return null;
                      return (
                        <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium mb-1">{label}</p>
                          {payload.map((p: any) => (
                            <p key={p.dataKey} className="text-xs text-muted-foreground">
                              {p.name}: {p.value} actions
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="bottom" height={30} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
                  <Bar dataKey="High" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Low" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Content Ideas Chart ---

interface ContentIdeasChartProps {
  ideas?: Array<{ type: string; estimatedEngagement: string }>;
}

const TYPE_COLORS: Record<string, string> = {
  reel: "#9333ea",
  carousel: "#3b82f6",
  image: "#10b981",
  story: "#f97316",
};

export function ContentIdeasChart({ data }: { data: ContentIdeasChartProps }) {
  const typeData = useMemo(() => {
    if (!data.ideas) return [];
    const counts: Record<string, number> = {};
    data.ideas.forEach((idea) => {
      const t = idea.type?.toLowerCase() || "image";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      fill: TYPE_COLORS[type] || "#6b7280",
    }));
  }, [data.ideas]);

  const engagementData = useMemo(() => {
    if (!data.ideas) return [];
    const byType: Record<string, Record<string, number>> = {};
    data.ideas.forEach((idea) => {
      const t = idea.type?.toLowerCase() || "image";
      const e = idea.estimatedEngagement?.toLowerCase() || "medium";
      if (!byType[t]) byType[t] = {};
      byType[t][e] = (byType[t][e] || 0) + 1;
    });
    return Object.entries(byType).map(([type, engagements]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      High: engagements["high"] || 0,
      Medium: engagements["medium"] || 0,
      Low: engagements["low"] || 0,
    }));
  }, [data.ideas]);

  if (typeData.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card className="animate-fade-in-up">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            Ideas by Content Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={4} dataKey="value" strokeWidth={2} stroke="#fff">
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{value} ideas</p>
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="bottom" height={30} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {engagementData.length > 0 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Expected Engagement by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (!payload?.length) return null;
                      return (
                        <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium mb-1">{label}</p>
                          {payload.map((p: any) => (
                            <p key={p.dataKey} className="text-xs text-muted-foreground">
                              {p.name}: {p.value} ideas
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="bottom" height={30} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
                  <Bar dataKey="High" stackId="a" fill="#10b981" />
                  <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Low" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
