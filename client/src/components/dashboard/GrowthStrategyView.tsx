import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "./PriorityBadge";
import { CollapsibleSection } from "./CollapsibleSection";
import {
  Clock,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Rocket,
} from "lucide-react";

interface GrowthStrategyData {
  strategyName?: string;
  overallGoal?: string;
  phases?: Array<{
    name: string;
    duration: string;
    focus: string;
    actions: Array<{
      action: string;
      details: string;
      priority: string;
      expectedImpact: string;
    }>;
  }>;
  kpis?: Array<{
    metric: string;
    currentValue: string;
    targetValue: string;
    timeframe: string;
  }>;
  doNot?: string[];
}

export function GrowthStrategyView({ data }: { data: GrowthStrategyData }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      {(data.strategyName || data.overallGoal) && (
        <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            {data.strategyName && (
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">{data.strategyName}</h2>
              </div>
            )}
            {data.overallGoal && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.overallGoal}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Phases Timeline */}
      {data.phases && data.phases.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
            Phases
          </h3>
          <div className="relative ml-4">
            {/* Timeline line */}
            <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-border" />

            <div className="space-y-6">
              {data.phases.map((phase, i) => (
                <div key={i} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />

                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">
                          {phase.name}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {phase.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {phase.focus}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <CollapsibleSection
                        title={`${phase.actions?.length || 0} actions`}
                        defaultOpen={i === 0}
                      >
                        <div className="space-y-3">
                          {phase.actions?.map((action, j) => (
                            <div
                              key={j}
                              className="rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-medium text-sm">
                                  {action.action}
                                </h4>
                                <PriorityBadge priority={action.priority} />
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {action.details}
                              </p>
                              {action.expectedImpact && (
                                <div className="rounded-md bg-primary/10 px-2.5 py-1.5">
                                  <p className="text-xs font-medium text-primary">
                                    Impact: {action.expectedImpact}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      {data.kpis && data.kpis.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Key Performance Indicators
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.kpis.map((kpi, i) => (
              <Card
                key={i}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {kpi.metric}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      {kpi.currentValue}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-lg font-bold text-primary">
                      {kpi.targetValue}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.timeframe}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Do Not */}
      {data.doNot && data.doNot.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Avoid These Mistakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.doNot.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 shrink-0 font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
