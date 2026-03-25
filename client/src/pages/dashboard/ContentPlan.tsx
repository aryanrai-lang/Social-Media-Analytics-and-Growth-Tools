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
import { CalendarDays, Sparkles, Loader2 } from "lucide-react";

const ContentPlan = () => {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState("weekly");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await aiApi.contentPlan(id, period);
      setPlan(res.result);
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
            <Select value={period} onValueChange={(val) => setPeriod(val ?? "weekly")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={loading}>
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

      {/* Result */}
      {plan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Content Plan</CardTitle>
              <Badge>{period}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">
              {typeof plan === "string"
                ? plan
                : JSON.stringify(plan, null, 2)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentPlan;
