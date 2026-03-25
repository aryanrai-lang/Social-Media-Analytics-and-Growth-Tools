import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { analyticsApi } from "@/api/analytics";
import { dataApi } from "@/api/data";
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
import { Separator } from "@/components/ui/separator";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

const Competitors = () => {
  const { id } = useParams<{ id: string }>();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [profilesRes, compareRes, gapsRes] = await Promise.all([
          dataApi.getProfiles(id),
          analyticsApi.compare(id).catch(() => null),
          analyticsApi.gaps(id).catch(() => null),
        ]);
        setProfiles(profilesRes);
        setComparison(compareRes);
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

  const ownerProfile = profiles.find((p: any) => p.isOwner);
  const competitorProfiles = profiles.filter((p: any) => !p.isOwner);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Competitors</h1>
        <p className="text-muted-foreground">
          Compare your account against competitors
        </p>
      </div>

      {/* Your Profile */}
      {ownerProfile && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>@{ownerProfile.username}</CardTitle>
              <Badge>You</Badge>
            </div>
            <CardDescription>Your Instagram account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {ownerProfile.followers?.toLocaleString() ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ownerProfile.postsCount?.toLocaleString() ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ownerProfile.engagementRate
                    ? `${ownerProfile.engagementRate.toFixed(2)}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitor Profiles */}
      {competitorProfiles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {competitorProfiles.map((cp: any) => (
            <Card key={cp._id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">@{cp.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">
                      {cp.followers?.toLocaleString() ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {cp.postsCount?.toLocaleString() ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {cp.engagementRate
                        ? `${cp.engagementRate.toFixed(2)}%`
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
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
                Areas where competitors outperform you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gaps.map((gap: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                    {gap.direction === "behind" ? (
                      <TrendingDown className="h-5 w-5 text-destructive mt-0.5" />
                    ) : gap.direction === "ahead" ? (
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{gap.metric}</p>
                      <p className="text-xs text-muted-foreground">
                        {gap.description}
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
