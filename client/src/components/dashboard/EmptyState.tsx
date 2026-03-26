import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title = "No data yet",
  description = "Click Generate to create AI-powered insights",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 p-5 mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        {description}
      </p>
    </div>
  );
}
