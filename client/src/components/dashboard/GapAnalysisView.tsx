import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PriorityBadge } from "./PriorityBadge";
import { CollapsibleSection } from "./CollapsibleSection";
import {
  CheckCircle2,
  Lightbulb,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface GapAnalysisData {
  summary?: string;
  criticalGaps?: Array<{
    area: string;
    currentState: string;
    targetState: string;
    priority: string;
    actionItems: string[];
  }>;
  strengths?: string[];
  opportunities?: string[];
  quickWins?: string[];
}

export function GapAnalysisView({ data }: { data: GapAnalysisData }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Hero Summary */}
      {data.summary && (
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed text-foreground/90">
              {data.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Critical Gaps */}
      {data.criticalGaps && data.criticalGaps.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
            Critical Gaps
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {data.criticalGaps.map((gap, i) => (
              <Card
                key={i}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{gap.area}</CardTitle>
                    <PriorityBadge priority={gap.priority} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current vs Target */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-start">
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
                      <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide">
                        Current
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                        {gap.currentState}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block mt-4" />
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                      <p className="text-[11px] font-semibold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wide">
                        Target
                      </p>
                      <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                        {gap.targetState}
                      </p>
                    </div>
                  </div>

                  {/* Action Items */}
                  {gap.actionItems && gap.actionItems.length > 0 && (
                    <CollapsibleSection
                      title={`${gap.actionItems.length} action items`}
                    >
                      <ul className="space-y-2">
                        {gap.actionItems.map((item, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-xs leading-relaxed"
                          >
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleSection>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Opportunities */}
      <div className="grid gap-4 md:grid-cols-2">
        {data.strengths && data.strengths.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.strengths.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 px-3 py-1 text-xs text-green-700 dark:text-green-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.opportunities && data.opportunities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Wins */}
      {data.quickWins && data.quickWins.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
            Quick Wins
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.quickWins.map((qw, i) => (
              <Card
                key={i}
                className="border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="pt-4 flex items-start gap-3">
                  <div className="rounded-lg bg-amber-100 dark:bg-amber-950 p-1.5 shrink-0">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-sm leading-relaxed">{qw}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
