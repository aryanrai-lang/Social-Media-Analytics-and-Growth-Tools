import { Video, Layers, Image, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ElementType; className: string }> = {
  reel: { icon: Video, className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800" },
  carousel: { icon: Layers, className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800" },
  image: { icon: Image, className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" },
  story: { icon: Circle, className: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800" },
};

export function ContentTypeBadge({ type }: { type: string }) {
  const config = typeConfig[type?.toLowerCase()] || typeConfig.image;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        config.className
      )}
    >
      <Icon className="h-3 w-3" />
      {type}
    </span>
  );
}
