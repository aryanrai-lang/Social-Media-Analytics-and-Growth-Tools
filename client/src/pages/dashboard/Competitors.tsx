import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { analyticsApi } from "@/api/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Users, TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

const Competitors = () => {
  const { id } = useParams<{ id: string }>();
  const [comparison, setComparison] = useState<any[]>([]);
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [compareRes, gapsRes] = await Promise.all([
          analyticsApi.compare(id).catch(() => []),
          analyticsApi.gaps(id).catch(() => ({ gaps: [] })),
        ]);
        setComparison(Array.isArray(compareRes) ? compareRes : []);
        setGaps(gapsRes?.gaps ?? []);
      } catch {
        // handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const maxValues = useMemo(() => {
    if (comparison.length === 0) return { followers: 1, engagementRate: 1, postingFrequency: 1, avgLikes: 1, avgComments: 1 };
    return {
      followers: Math.max(...comparison.map((c) => c.followers || 0)),
      engagementRate: Math.max(...comparison.map((c) => c.engagementRate || 0)),
      postingFrequency: Math.max(...comparison.map((c) => c.postingFrequency || 0)),
      avgLikes: Math.max(...comparison.map((c) => c.avgLikes || 0)),
      avgComments: Math.max(...comparison.map((c) => c.avgComments || 0)),
    };
  }, [comparison]);

  const bestEngagement = useMemo(() => {
    if (comparison.length < 2) return null;
    const comps = comparison.slice(1);
    let best = comps[0];
    for (const c of comps) {
      if ((c.engagementRate || 0) > (best.engagementRate || 0)) best = c;
    }
    return best?.username;
  }, [comparison]);

  const gapChartData = useMemo(() => {
    return gaps.map((g) => ({
      metric: g.metric,
      you: Number(g.ownerValue) || 0,
      avg: Number(g.benchmarkValue) || 0,
    }));
  }, [gaps]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const owner = comparison.length > 0 ? comparison[0] : null;
  const competitors = comparison.slice(1);

  function getBarColor(val: number, ownerVal: number) {
    if (!ownerVal) return "#6b7280";
    const ratio = val / ownerVal;
    if (ratio > 1.1) return "#10b981";
    if (ratio < 0.9) return "#ef4444";
    return "#f59e0b";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Competitors</h1>
        <p className="text-muted-foreground">
          Compare your account against competitors
        </p>
      </div>

      {/* Your Profile */}
      {owner && (
        <Card className="relative overflow-hidden border-2 border-transparent animate-fade-in-up" style={{ borderImage: 'linear-gradient(135deg, var(--primary), #8b5cf6) 1' }}>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-violet-500" />
          <CardHeader className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                {owner.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>@{owner.username}</CardTitle>
                  <Badge className="bg-gradient-to-r from-primary to-violet-500 text-white border-0">You</Badge>
                </div>
                <CardDescription>Your Instagram account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-center">
              {[
                { label: "Followers", value: owner.followers, format: (v: number) => v?.toLocaleString() ?? "—" },
                { label: "Engagement", value: owner.engagementRate, format: (v: number) => v != null ? `${v.toFixed(2)}%` : "—" },
                { label: "Posts/Week", value: owner.postingFrequency, format: (v: number) => v != null ? `${v.toFixed(1)}/wk` : "—" },
                { label: "Avg Likes", value: owner.avgLikes, format: (v: number) => v?.toLocaleString() ?? "—" },
                { label: "Avg Comments", value: owner.avgComments, format: (v: number) => v?.toLocaleString() ?? "—" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold">{stat.format(stat.value)}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitor Profiles */}
      {competitors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {competitors.map((cp: any, i: number) => (
            <Card
              key={i}
              className="relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                      {cp.username?.charAt(0).toUpperCase()}
                    </div>
                    <CardTitle className="text-base">@{cp.username}</CardTitle>
                  </div>
                  {cp.username === bestEngagement && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                      <Trophy className="h-3 w-3" />
                      Best Engagement
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Followers", val: cp.followers, max: maxValues.followers, ownerVal: owner?.followers, fmt: (v: number) => v?.toLocaleString() ?? "—" },
                    { label: "Engagement", val: cp.engagementRate, max: maxValues.engagementRate, ownerVal: owner?.engagementRate, fmt: (v: number) => v != null ? `${v.toFixed(2)}%` : "—" },
                    { label: "Posts/Week", val: cp.postingFrequency, max: maxValues.postingFrequency, ownerVal: owner?.postingFrequency, fmt: (v: number) => v != null ? `${v.toFixed(1)}` : "—" },
                    { label: "Avg Likes", val: cp.avgLikes, max: maxValues.avgLikes, ownerVal: owner?.avgLikes, fmt: (v: number) => v?.toLocaleString() ?? "—" },
                    { label: "Avg Comments", val: cp.avgComments, max: maxValues.avgComments, ownerVal: owner?.avgComments, fmt: (v: number) => v?.toLocaleString() ?? "—" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-semibold">{m.fmt(m.val)}</span>
                      </div>
                      <MetricBar
                        value={m.val || 0}
                        max={m.max}
                        color={getBarColor(m.val || 0, m.ownerVal || 0)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-8 text-center">
          <CardContent>
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 p-4 w-fit mx-auto mb-3">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold">No competitor data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add competitors and fetch data from the Overview page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <>
          <Separator />

          {/* Comparison Chart */}
          {gapChartData.length > 0 && (
            <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-base">Performance Comparison</CardTitle>
                <CardDescription>You vs competitor average</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gapChartData} layout="vertical" barCategoryGap="20%">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="metric" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="you" name="You" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="avg" name="Competitor Avg" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle>Identified Gaps</CardTitle>
              <CardDescription>
                How you compare against competitor averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gaps.map((gap: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors duration-200">
                    {gap.status === "behind" ? (
                      <TrendingDown className="h-5 w-5 text-destructive mt-0.5" />
                    ) : gap.status === "ahead" ? (
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{gap.metric}</p>
                        <Badge
                          variant={gap.status === "behind" ? "destructive" : gap.status === "ahead" ? "default" : "secondary"}
                        >
                          {gap.status === "behind" ? "Behind" : gap.status === "ahead" ? "Ahead" : "On Par"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-0.5">
                            <span>You: {gap.ownerValue}</span>
                            <span>Avg: {gap.benchmarkValue}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 relative overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min(Math.abs(gap.diffPercent || 0), 100)}%`,
                                background: gap.status === "behind" ? "#ef4444" : gap.status === "ahead" ? "#10b981" : "#6b7280",
                              }}
                            />
                          </div>
                        </div>
                        <span className={`text-xs font-bold min-w-[48px] text-right ${gap.status === "behind" ? "text-destructive" : gap.status === "ahead" ? "text-green-500" : "text-muted-foreground"}`}>
                          {gap.diffPercent > 0 ? "+" : ""}{gap.diffPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Competitors;