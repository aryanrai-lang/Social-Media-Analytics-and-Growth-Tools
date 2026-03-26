import { cn } from "@/lib/utils";

const priorityConfig = {
  high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
  medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  low: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const level = (priority?.toLowerCase() || "medium") as keyof typeof priorityConfig;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        priorityConfig[level] || priorityConfig.medium
      )}
    >
      {priority}
    </span>
  );
}
