import { useState } from "react";
import { useParams } from "react-router-dom";
import { aiApi } from "@/api/ai";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, TrendingUp, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { GapAnalysisView } from "@/components/dashboard/GapAnalysisView";
import { GrowthStrategyView } from "@/components/dashboard/GrowthStrategyView";
import { ContentIdeasView } from "@/components/dashboard/ContentIdeasView";
import { EmptyState } from "@/components/dashboard/EmptyState";

const AIInsights = () => {
  const { id } = useParams<{ id: string }>();
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [growthStrategy, setGrowthStrategy] = useState<any>(null);
  const [contentIdeas, setContentIdeas] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleGapAnalysis = async () => {
    if (!id) return;
    setLoading("gap");
    try {
      const res = await aiApi.gapAnalysis(id);
      setGapAnalysis(res.output);
    } catch (err: any) {
      console.error("[AI] Gap analysis error:", err?.response?.data || err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGrowthStrategy = async () => {
    if (!id) return;
    setLoading("growth");
    try {
      const res = await aiApi.growthStrategy(id);
      setGrowthStrategy(res.output);
    } catch (err: any) {
      console.error("[AI] Growth strategy error:", err?.response?.data || err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleContentIdeas = async () => {
    if (!id) return;
    setLoading("ideas");
    try {
      const res = await aiApi.contentIdeas(id, "general");
      setContentIdeas(res.output);
    } catch (err: any) {
      console.error("[AI] Content ideas error:", err?.response?.data || err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">
          AI-powered analysis and recommendations for your account
        </p>
      </div>

      <Tabs defaultValue={0}>
        <TabsList>
          <TabsTrigger value={0}>
            <Target className="h-4 w-4" />
            Gap Analysis
          </TabsTrigger>
          <TabsTrigger value={1}>
            <TrendingUp className="h-4 w-4" />
            Growth Strategy
          </TabsTrigger>
          <TabsTrigger value={2}>
            <Lightbulb className="h-4 w-4" />
            Content Ideas
          </TabsTrigger>
        </TabsList>

        {/* Gap Analysis Tab */}
        <TabsContent value={0}>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold">Gap Analysis</h2>
                <p className="text-sm text-muted-foreground">
                  Identify gaps between your account and competitors
                </p>
              </div>
              <Button onClick={handleGapAnalysis} disabled={loading !== null}>
                {loading === "gap" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {loading === "gap" ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-48 rounded-xl" />
                  <Skeleton className="h-48 rounded-xl" />
                </div>
              </div>
            ) : gapAnalysis ? (
              <GapAnalysisView data={gapAnalysis} />
            ) : (
              <EmptyState
                icon={Target}
                description="Analyze gaps between your account and competitors"
              />
            )}
          </div>
        </TabsContent>

        {/* Growth Strategy Tab */}
        <TabsContent value={1}>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold">Growth Strategy</h2>
                <p className="text-sm text-muted-foreground">
                  Get personalized growth recommendations
                </p>
              </div>
              <Button
                onClick={handleGrowthStrategy}
                disabled={loading !== null}
              >
                {loading === "growth" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Strategizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {loading === "growth" ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            ) : growthStrategy ? (
              <GrowthStrategyView data={growthStrategy} />
            ) : (
              <EmptyState
                icon={TrendingUp}
                description="Get AI-powered growth strategy and action plan"
              />
            )}
          </div>
        </TabsContent>

        {/* Content Ideas Tab */}
        <TabsContent value={2}>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold">Content Ideas</h2>
                <p className="text-sm text-muted-foreground">
                  Fresh content ideas based on trends and performance
                </p>
              </div>
              <Button
                onClick={handleContentIdeas}
                disabled={loading !== null}
              >
                {loading === "ideas" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {loading === "ideas" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-52 rounded-xl" />
                ))}
              </div>
            ) : contentIdeas ? (
              <ContentIdeasView data={contentIdeas} />
            ) : (
              <EmptyState
                icon={Lightbulb}
                description="Generate fresh content ideas based on trends"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsights;
