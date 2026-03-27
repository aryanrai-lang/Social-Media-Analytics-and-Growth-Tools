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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Activity, BarChart3 } from "lucide-react";

interface OverviewChartsProps {
  profile: {
    followers?: number;
    postsCount?: number;
    following?: number;
  } | null;
  analytics: {
    engagementRate?: number;
    avgLikes?: number;
    avgComments?: number;
  } | null;
  sparklines: {
    followers?: number[];
    posts?: number[];
    engagement?: number[];
    following?: number[];
  };
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function OverviewCharts({ profile, analytics, sparklines }: OverviewChartsProps) {
  if (!profile) return null;

  const radarData = useMemo(() => {
    const followers = profile.followers ?? 0;
    const posts = profile.postsCount ?? 0;
    const engagement = (analytics?.engagementRate ?? 0) * 100;
    const avgLikes = analytics?.avgLikes ?? 0;
    const avgComments = analytics?.avgComments ?? 0;
    const following = profile.following ?? 0;

    const normalize = (val: number, max: number) => Math.min((val / max) * 100, 100);

    return [
      { metric: "Followers", value: normalize(followers, Math.max(followers, 10000)) },
      { metric: "Engagement", value: normalize(engagement, 10) },
      { metric: "Avg Likes", value: normalize(avgLikes, Math.max(avgLikes, 1000)) },
      { metric: "Avg Comments", value: normalize(avgComments, Math.max(avgComments, 200)) },
      { metric: "Posts", value: normalize(posts, Math.max(posts, 500)) },
      { metric: "Following", value: normalize(following, Math.max(following, 5000)) },
    ];
  }, [profile, analytics]);

  const followerTrend = useMemo(() => {
    const data = sparklines.followers ?? [];
    return data.map((val, i) => ({ day: DAYS[i % 7], followers: val }));
  }, [sparklines.followers]);

  const engagementTrend = useMemo(() => {
    const data = sparklines.engagement ?? [];
    return data.map((val, i) => ({ day: DAYS[i % 7], rate: val / 100 }));
  }, [sparklines.engagement]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Account Health Radar */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Account Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const { metric, value } = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{metric}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {Math.round(value)}/100
                        </p>
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Follower Trend */}
      {followerTrend.length > 1 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Follower Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={followerTrend}>
                  <defs>
                    <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (!payload?.[0]) return null;
                      return (
                        <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium">{payload[0].value?.toLocaleString()} followers</p>
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="followers" stroke="#3b82f6" strokeWidth={2} fill="url(#followerGrad)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Rate Trend */}
      {engagementTrend.length > 1 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              Engagement Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementTrend}>
                  <defs>
                    <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (!payload?.[0]) return null;
                      return (
                        <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium">{Number(payload[0].value).toFixed(2)}% engagement</p>
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} fill="url(#engagementGrad)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
