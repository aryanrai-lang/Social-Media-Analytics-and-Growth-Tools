import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { dashboardApi } from "@/api/dashboard";
import { dataApi } from "@/api/data";
import { type Workspace } from "@/api/workspaces";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Heart,
  TrendingUp,
  ImageIcon,
  RefreshCw,
  Camera,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { OverviewCharts } from "@/components/dashboard/OverviewCharts";

function generateSparkline(base: number, points = 7): number[] {
  const data: number[] = [];
  for (let i = 0; i < points; i++) {
    data.push(Math.round(base * (0.85 + Math.random() * 0.3)));
  }
  data[points - 1] = base;
  return data;
}

interface OverviewData {
  workspace: Workspace;
  profile: any;
  analytics: any;
  recentAI: any[];
}

const Overview = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchOverview = async () => {
    if (!id) return;
    try {
      const res = await dashboardApi.overview(id);
      setData(res);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [id]);

  const handleFetchData = async () => {
    if (!id) return;
    setFetching(true);
    try {
      await dataApi.fetchData(id);
      await fetchOverview();
    } catch {
      // handle
    } finally {
      setFetching(false);
    }
  };

  const sparklines = useMemo(() => {
    const p = data?.profile;
    if (!p) return {};
    return {
      followers: generateSparkline(p.followers || 0),
      posts: generateSparkline(p.postsCount || 0),
      engagement: generateSparkline(Math.round((data?.analytics?.engagementRate || 0) * 100)),
      following: generateSparkline(p.following || 0),
    };
  }, [data?.profile, data?.analytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const analytics = data?.analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {data?.workspace?.name}
          </h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <Camera className="h-3 w-3" />@
            {data?.workspace?.instagramUsername}
          </p>
        </div>
        <Button
          onClick={handleFetchData}
          disabled={fetching}
          className="bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90 active:scale-[0.98] transition-all duration-200"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${fetching ? "animate-spin" : ""}`}
          />
          {fetching ? "Fetching..." : "Fetch Data"}
        </Button>
      </div>

      {/* Stats Cards */}
      {profile ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Followers"
            value={profile.followers ?? 0}
            icon={Users}
            gradientFrom="#3b82f6"
            gradientTo="#06b6d4"
            sparklineData={sparklines.followers}
            delay={0}
          />
          <KpiCard
            title="Posts"
            value={profile.postsCount ?? 0}
            icon={ImageIcon}
            gradientFrom="#8b5cf6"
            gradientTo="#ec4899"
            sparklineData={sparklines.posts}
            delay={100}
          />
          <KpiCard
            title="Engagement Rate"
            value={analytics?.engagementRate ? Math.round(analytics.engagementRate * 100) : 0}
            icon={Heart}
            gradientFrom="#10b981"
            gradientTo="#34d399"
            sparklineData={sparklines.engagement}
            formatValue={(v) => (v / 100).toFixed(2)}
            suffix="%"
            delay={200}
          />
          <KpiCard
            title="Following"
            value={profile.following ?? 0}
            icon={TrendingUp}
            gradientFrom="#f59e0b"
            gradientTo="#f97316"
            sparklineData={sparklines.following}
            delay={300}
          />
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 p-4 w-fit mx-auto mb-3">
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold">No data yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Click &quot;Fetch Data&quot; to pull your Instagram profile data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overview Charts */}
      {profile && analytics && (
        <OverviewCharts profile={profile} analytics={analytics} sparklines={sparklines} />
      )}

      {/* Recent AI Generations */}
      {data?.recentAI && data.recentAI.length > 0 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle>Recent AI Insights</CardTitle>
            <CardDescription>
              Your latest AI-generated analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentAI.map((ai: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-l-4 border-l-primary/50 p-3 hover:bg-muted/50 transition-colors duration-200"
                >
                  <div>
                    <span className="font-medium text-sm">{ai.type}</span>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ai.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{ai.model}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Overview;
