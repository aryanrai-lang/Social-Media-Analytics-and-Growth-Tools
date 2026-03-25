import { useEffect, useState } from "react";
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
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  const owner = comparison.length > 0 ? comparison[0] : null;
  const competitors = comparison.slice(1);

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
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>@{owner.username}</CardTitle>
              <Badge>You</Badge>
            </div>
            <CardDescription>Your Instagram account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {owner.followers?.toLocaleString() ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {owner.engagementRate != null
                    ? `${owner.engagementRate.toFixed(2)}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {owner.postingFrequency != null
                    ? `${owner.postingFrequency.toFixed(1)}/wk`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Posts/Week</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {owner.avgLikes?.toLocaleString() ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">Avg Likes</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {owner.avgComments?.toLocaleString() ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">Avg Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitor Profiles */}
      {competitors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {competitors.map((cp: any, i: number) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">@{cp.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold">
                      {cp.followers?.toLocaleString() ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {cp.engagementRate != null
                        ? `${cp.engagementRate.toFixed(2)}%`
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {cp.postingFrequency != null
                        ? `${cp.postingFrequency.toFixed(1)}/wk`
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Posts/Week</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {cp.avgLikes?.toLocaleString() ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Likes</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {cp.avgComments?.toLocaleString() ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-8 text-center">
          <CardContent>
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
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
          <Card>
            <CardHeader>
              <CardTitle>Identified Gaps</CardTitle>
              <CardDescription>
                How you compare against competitor averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gaps.map((gap: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
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
                      <p className="text-xs text-muted-foreground mt-1">
                        You: {gap.ownerValue} | Competitor Avg: {gap.benchmarkValue} | Diff: {gap.diffPercent > 0 ? "+" : ""}{gap.diffPercent}%
                      </p>
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