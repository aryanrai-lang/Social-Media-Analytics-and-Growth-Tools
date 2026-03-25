import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
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
        <Button onClick={handleFetchData} disabled={fetching}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${fetching ? "animate-spin" : ""}`}
          />
          {fetching ? "Fetching..." : "Fetch Data"}
        </Button>
      </div>

      {/* Stats Cards */}
      {profile ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.followers?.toLocaleString() ?? "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Posts</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.postsCount?.toLocaleString() ?? "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Engagement Rate
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.engagementRate
                  ? `${analytics.engagementRate.toFixed(2)}%`
                  : "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Following</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.following?.toLocaleString() ?? "—"}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardContent>
            <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">No data yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Click &quot;Fetch Data&quot; to pull your Instagram profile data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent AI Generations */}
      {data?.recentAI && data.recentAI.length > 0 && (
        <Card>
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
                  className="flex items-center justify-between rounded-lg border p-3"
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
