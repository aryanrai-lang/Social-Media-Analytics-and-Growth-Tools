import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  Download,
  Search,
  BarChart3,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { OverviewCharts } from "@/components/dashboard/OverviewCharts";

const FETCH_STEPS = [
  { label: "Connecting to Instagram", desc: "Establishing secure connection...", icon: Download, duration: 3000 },
  { label: "Fetching Profile Data", desc: "Pulling followers, posts & bio...", icon: Search, duration: 5000 },
  { label: "Collecting Recent Posts", desc: "Gathering your latest content...", icon: Camera, duration: 6000 },
  { label: "Analyzing Engagement", desc: "Calculating rates & trends...", icon: BarChart3, duration: 4000 },
  { label: "Finalizing Results", desc: "Preparing your dashboard...", icon: CheckCircle2, duration: 2000 },
];

type FetchStatus = "idle" | "fetching" | "success" | "error";

function FetchProgressOverlay({
  status,
  currentStep,
  errorMsg,
  onRetry,
  onDismiss,
}: {
  status: FetchStatus;
  currentStep: number;
  errorMsg: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  if (status === "idle") return null;

  return (
    <Card className="relative overflow-hidden animate-fade-in-up">
      {/* Progress bar */}
      {status === "fetching" && (
        <div className="absolute inset-x-0 top-0 h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700 ease-out"
            style={{ width: `${((currentStep + 1) / FETCH_STEPS.length) * 100}%` }}
          />
        </div>
      )}

      <CardContent className="pt-8 pb-6">
        {status === "fetching" && (
          <div className="space-y-4">
            {FETCH_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === currentStep;
              const isDone = i < currentStep;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-500 ${
                    isActive
                      ? "bg-primary/5 ring-1 ring-primary/20 scale-[1.01]"
                      : isDone
                      ? "opacity-60"
                      : "opacity-30"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                      isDone
                        ? "bg-green-100 text-green-600"
                        : isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isActive ? "text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {(isActive || isDone) && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {isDone ? "Completed" : step.desc}
                      </p>
                    )}
                  </div>
                  {isDone && (
                    <span className="text-xs text-green-600 font-medium">Done</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-4 animate-fade-in-up">
            <div className="rounded-2xl bg-green-100 p-4 w-fit mx-auto mb-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Data Fetched Successfully!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your dashboard has been updated with the latest data.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-4 animate-fade-in-up">
            <div className="rounded-2xl bg-red-50 p-4 w-fit mx-auto mb-3">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="font-semibold text-lg">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {errorMsg || "Failed to fetch data. Please check your connection and try again."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={onDismiss}>
                Dismiss
              </Button>
              <Button
                onClick={onRetry}
                className="bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchStep, setFetchStep] = useState(0);
  const [fetchError, setFetchError] = useState("");
  const stepTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const advanceSteps = useCallback((step: number) => {
    if (step >= FETCH_STEPS.length - 1) return;
    stepTimerRef.current = setTimeout(() => {
      setFetchStep(step + 1);
      advanceSteps(step + 1);
    }, FETCH_STEPS[step].duration);
  }, []);

  const handleFetchData = async () => {
    if (!id) return;
    setFetchStatus("fetching");
    setFetchStep(0);
    setFetchError("");
    advanceSteps(0);

    try {
      await dataApi.fetchData(id);
      // finish all steps visually
      clearTimeout(stepTimerRef.current);
      setFetchStep(FETCH_STEPS.length);
      setFetchStatus("success");
      await fetchOverview();
      // auto-dismiss after 2s
      setTimeout(() => setFetchStatus("idle"), 2000);
    } catch (err: any) {
      clearTimeout(stepTimerRef.current);
      setFetchError(err?.response?.data?.message || err?.message || "");
      setFetchStatus("error");
    }
  };

  const fetching = fetchStatus === "fetching";

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

      {/* Fetch Progress Overlay */}
      <FetchProgressOverlay
        status={fetchStatus}
        currentStep={fetchStep}
        errorMsg={fetchError}
        onRetry={handleFetchData}
        onDismiss={() => setFetchStatus("idle")}
      />

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
