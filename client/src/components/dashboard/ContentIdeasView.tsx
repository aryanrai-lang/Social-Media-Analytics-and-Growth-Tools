import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { CollapsibleSection } from "./CollapsibleSection";
import { cn } from "@/lib/utils";
import { Hash, MessageSquareQuote } from "lucide-react";

interface ContentIdea {
  title: string;
  type: string;
  hook: string;
  outline: string;
  hashtags: string[];
  estimatedEngagement: string;
}

interface ContentIdeasData {
  ideas?: ContentIdea[];
}

const engagementConfig: Record<string, string> = {
  high: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
  medium:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  low: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const contentTypes = ["all", "reel", "carousel", "image", "story"];

export function ContentIdeasView({ data }: { data: ContentIdeasData }) {
  const [filter, setFilter] = useState("all");

  if (!data?.ideas || data.ideas.length === 0) return null;

  const filteredIdeas =
    filter === "all"
      ? data.ideas
      : data.ideas.filter((idea) => idea.type?.toLowerCase() === filter);

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {contentTypes.map((type) => {
          const count =
            type === "all"
              ? data.ideas!.length
              : data.ideas!.filter((i) => i.type?.toLowerCase() === type)
                  .length;
          if (type !== "all" && count === 0) return null;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === type
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Ideas Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredIdeas.map((idea, i) => (
          <Card
            key={i}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm leading-snug">
                  {idea.title}
                </CardTitle>
                <ContentTypeBadge type={idea.type} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Hook */}
              {idea.hook && (
                <div className="border-l-2 border-primary pl-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquareQuote className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                      Hook
                    </span>
                  </div>
                  <p className="text-sm font-medium italic">
                    &ldquo;{idea.hook}&rdquo;
                  </p>
                </div>
              )}

              {/* Outline */}
              {idea.outline && (
                <CollapsibleSection title="Read more">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {idea.outline}
                  </p>
                </CollapsibleSection>
              )}

              {/* Hashtags */}
              {idea.hashtags && idea.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {idea.hashtags.map((tag, j) => (
                    <span
                      key={j}
                      className="inline-flex items-center gap-0.5 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      <Hash className="h-3 w-3" />
                      {tag.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement */}
              {idea.estimatedEngagement && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Est. Engagement
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                      engagementConfig[
                        idea.estimatedEngagement?.toLowerCase()
                      ] || engagementConfig.medium
                    )}
                  >
                    {idea.estimatedEngagement}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No {filter} ideas found. Try a different filter.
        </div>
      )}
    </div>
  );
}
