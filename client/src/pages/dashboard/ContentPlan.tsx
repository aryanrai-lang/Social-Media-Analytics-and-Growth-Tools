import { useState } from "react";
import { useParams } from "react-router-dom";
import { aiApi } from "@/api/ai";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  Sparkles,
  Loader2,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { ContentTypeBadge } from "@/components/dashboard/ContentTypeBadge";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Post {
  time: string;
  type: string;
  topic: string;
  caption: string;
  rationale: string;
}

interface Day {
  day: number;
  date: string;
  posts: Post[];
}

interface PlanData {
  planName?: string;
  period?: string;
  days?: Day[];
  overallStrategy?: string;
  expectedOutcome?: string;
}

const ContentPlan = () => {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState("weekly");
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await aiApi.contentPlan(id, period);
      setPlan(res.output);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Plan</h1>
        <p className="text-muted-foreground">
          AI-generated content calendar and posting schedule
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Generate Content Plan
          </CardTitle>
          <CardDescription>
            Select a period and generate an AI-powered posting schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select
              value={period}
              onValueChange={(val) => setPeriod(val ?? "weekly")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl shimmer-bg" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-60 rounded-xl shimmer-bg" />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {!loading && plan && (
        <div className="space-y-6">
          {/* Strategy Banner */}
          {(plan.overallStrategy || plan.expectedOutcome) && (
            <Card className="relative overflow-hidden border-t-2 border-t-primary shadow-primary/10 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Target className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="font-bold text-lg">
                    {plan.planName || "Content Plan"}
                  </h2>
                  {plan.period && (
                    <Badge variant="secondary">{plan.period}</Badge>
                  )}
                </div>
                {plan.overallStrategy && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {plan.overallStrategy}
                  </p>
                )}
                {plan.expectedOutcome && (
                  <div className="flex items-start gap-2 mt-3 rounded-lg bg-green-50 px-3 py-2">
                    <TrendingUp className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">
                      {plan.expectedOutcome}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Daily Schedule */}
          {plan.days && plan.days.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plan.days.map((day, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {day.day || i + 1}
                        </div>
                        {day.date || `Day ${day.day}`}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {day.posts?.length || 0} post
                        {(day.posts?.length || 0) !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {day.posts?.map((post, j) => (
                        <div
                          key={j}
                          className="rounded-lg border p-3 space-y-2 hover:bg-muted/50 transition-colors"
                        >
                          {/* Time + Type */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {post.time}
                            </div>
                            <ContentTypeBadge type={post.type} />
                          </div>

                          {/* Topic */}
                          <p className="font-medium text-sm">{post.topic}</p>

                          {/* Caption */}
                          {post.caption && (
                            <CollapsibleSection title="Caption">
                              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {post.caption}
                              </p>
                            </CollapsibleSection>
                          )}

                          {/* Rationale */}
                          {post.rationale && (
                            <CollapsibleSection title="Why this post">
                              <div className="rounded-md bg-muted/50 px-2.5 py-1.5">
                                <p className="text-xs text-muted-foreground">
                                  {post.rationale}
                                </p>
                              </div>
                            </CollapsibleSection>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !plan && (
        <EmptyState
          icon={CalendarDays}
          title="No content plan yet"
          description="Generate an AI-powered content calendar for your Instagram"
        />
      )}
    </div>
  );
};

export default ContentPlan;
