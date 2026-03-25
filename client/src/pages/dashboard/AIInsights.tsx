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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lightbulb,
  TrendingUp,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";

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
      console.log("[AI] Calling gapAnalysis for workspace:", id);
      const res = await aiApi.gapAnalysis(id);
      console.log("[AI] Gap analysis full response:", res);
      console.log("[AI] Gap analysis output:", res.output);
      setGapAnalysis(res.output);
    } catch (err: any) {
      console.error("[AI] Gap analysis error:", err?.response?.data || err.message || err);
    } finally {
      setLoading(null);
    }
  };

  const handleGrowthStrategy = async () => {
    if (!id) return;
    setLoading("growth");
    try {
      console.log("[AI] Calling growthStrategy for workspace:", id);
      const res = await aiApi.growthStrategy(id);
      console.log("[AI] Growth strategy full response:", res);
      setGrowthStrategy(res.output);
    } catch (err: any) {
      console.error("[AI] Growth strategy error:", err?.response?.data || err.message || err);
    } finally {
      setLoading(null);
    }
  };

  const handleContentIdeas = async () => {
    if (!id) return;
    setLoading("ideas");
    try {
      console.log("[AI] Calling contentIdeas for workspace:", id);
      const res = await aiApi.contentIdeas(id, "general");
      console.log("[AI] Content ideas full response:", res);
      setContentIdeas(res.output);
    } catch (err: any) {
      console.error("[AI] Content ideas error:", err?.response?.data || err.message || err);
    } finally {
      setLoading(null);
    }
  };

  const ActionCard = ({
    title,
    description,
    icon: Icon,
    action,
    loadingKey,
    result,
  }: {
    title: string;
    description: string;
    icon: any;
    action: () => void;
    loadingKey: string;
    result: any;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={action}
            disabled={loading !== null}
          >
            {loading === loadingKey ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Generate
              </>
            )}
          </Button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {result && (
        <CardContent>
          <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">
            {typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2)}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">
          AI-powered analysis and recommendations for your account
        </p>
      </div>

      <div className="space-y-4">
        <ActionCard
          title="Gap Analysis"
          description="Identify gaps between your account and competitors using AI"
          icon={Target}
          action={handleGapAnalysis}
          loadingKey="gap"
          result={gapAnalysis}
        />
        <ActionCard
          title="Growth Strategy"
          description="Get personalized growth recommendations based on your data"
          icon={TrendingUp}
          action={handleGrowthStrategy}
          loadingKey="growth"
          result={growthStrategy}
        />
        <ActionCard
          title="Content Ideas"
          description="Generate fresh content ideas based on trends and performance"
          icon={Lightbulb}
          action={handleContentIdeas}
          loadingKey="ideas"
          result={contentIdeas}
        />
      </div>
    </div>
  );
};

export default AIInsights;
