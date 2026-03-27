import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Treemap,
} from "recharts";
import { Network, PieChartIcon, CalendarClock } from "lucide-react";

interface Post {
  time: string;
  type: string;
  topic: string;
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
}

const TYPE_COLORS: Record<string, string> = {
  reel: "#9333ea",
  carousel: "#3b82f6",
  image: "#10b981",
  story: "#f97316",
};

const TYPE_LABELS: Record<string, string> = {
  reel: "Reels",
  carousel: "Carousels",
  image: "Images",
  story: "Stories",
};

const TIME_SLOTS = [
  { label: "Morning", range: "6 AM – 12 PM", min: 6, max: 11 },
  { label: "Afternoon", range: "12 PM – 5 PM", min: 12, max: 16 },
  { label: "Evening", range: "5 PM – 9 PM", min: 17, max: 20 },
  { label: "Night", range: "9 PM – 6 AM", min: 21, max: 5 },
];

function parseHour(time: string): number {
  const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return 12;
  let hour = parseInt(match[1], 10);
  const ampm = match[3]?.toLowerCase();
  if (ampm === "pm" && hour !== 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;
  return hour;
}

function getSlotIndex(hour: number): number {
  if (hour >= 6 && hour <= 11) return 0;
  if (hour >= 12 && hour <= 16) return 1;
  if (hour >= 17 && hour <= 20) return 2;
  return 3;
}

// Custom content renderer for Treemap cells
function TreemapContent(props: any) {
  const { x, y, width, height, name, depth, fill } = props;
  if (width < 30 || height < 20) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={depth === 1 ? 6 : 3}
        fill={fill}
        stroke="#fff"
        strokeWidth={depth === 1 ? 2 : 1}
        style={{ opacity: depth === 1 ? 0.85 : 0.95 }}
      />
      {width > 40 && height > 25 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[10px] font-medium"
          fill="#fff"
          style={{ pointerEvents: "none" }}
        >
          {name.length > Math.floor(width / 7)
            ? name.slice(0, Math.floor(width / 7)) + "…"
            : name}
        </text>
      )}
    </g>
  );
}

export function ContentPlanCharts({ data }: { data: PlanData }) {
  const days = data.days ?? [];
  const allPosts = days.flatMap((d) => d.posts ?? []);

  // --- Treemap data ---
  const treemapData = useMemo(() => {
    return days.map((day) => ({
      name: day.date || `Day ${day.day}`,
      children: (day.posts ?? []).map((post) => ({
        name: post.topic,
        size: 1,
        fill: TYPE_COLORS[post.type?.toLowerCase()] ?? "#94a3b8",
      })),
    }));
  }, [days]);

  // --- Donut data ---
  const donutData = useMemo(() => {
    const counts: Record<string, number> = {};
    allPosts.forEach((p) => {
      const key = p.type?.toLowerCase() || "image";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: TYPE_LABELS[type] || type,
      value: count,
      fill: TYPE_COLORS[type] || "#94a3b8",
    }));
  }, [allPosts]);

  // --- Heatmap data ---
  const heatmap = useMemo(() => {
    const grid: number[][] = TIME_SLOTS.map(() => days.map(() => 0));
    days.forEach((day, di) => {
      (day.posts ?? []).forEach((post) => {
        const hour = parseHour(post.time);
        const si = getSlotIndex(hour);
        grid[si][di]++;
      });
    });
    const max = Math.max(1, ...grid.flat());
    return { grid, max };
  }, [days]);

  if (allPosts.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Row 1: Content Mindmap (Treemap) — full width */}
      <Card className="animate-fade-in-up">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            Content Mindmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                stroke="#fff"
                content={<TreemapContent />}
              >
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.root?.name && (
                          <p className="text-xs text-muted-foreground">
                            {item.root.name}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize text-muted-foreground">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Row 2: Donut + Heatmap side by side */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Content Mix (Donut) */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Content Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.[0]) return null;
                      const { name, value } = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {value} post{value !== 1 ? "s" : ""}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center stat */}
            <div className="text-center -mt-4">
              <span className="text-2xl font-bold">{allPosts.length}</span>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
          </CardContent>
        </Card>

        {/* Posting Schedule Heatmap */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Posting Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-1.5">
                <thead>
                  <tr>
                    <th className="text-[10px] text-muted-foreground font-medium text-left w-20" />
                    {days.map((day, i) => (
                      <th
                        key={i}
                        className="text-[10px] text-muted-foreground font-medium text-center"
                      >
                        {day.date
                          ? day.date.replace(/Day\s*/i, "D")
                          : `D${day.day}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slot, si) => (
                    <tr key={si}>
                      <td className="text-[10px] text-muted-foreground font-medium pr-2 whitespace-nowrap">
                        {slot.label}
                      </td>
                      {days.map((_, di) => {
                        const count = heatmap.grid[si][di];
                        const intensity =
                          count === 0
                            ? 0
                            : Math.max(0.15, count / heatmap.max);
                        return (
                          <td key={di} className="p-0">
                            <div
                              className="h-10 rounded-md flex items-center justify-center transition-colors"
                              style={{
                                backgroundColor:
                                  count > 0
                                    ? `oklch(0.488 0.243 264 / ${intensity})`
                                    : "var(--muted)",
                              }}
                              title={`${slot.label}, ${days[di].date || "Day " + days[di].day}: ${count} post${count !== 1 ? "s" : ""}`}
                            >
                              {count > 0 && (
                                <span
                                  className="text-xs font-bold"
                                  style={{
                                    color:
                                      intensity > 0.5 ? "#fff" : "var(--primary)",
                                  }}
                                >
                                  {count}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Heatmap legend */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
                <div
                  key={op}
                  className="h-3 w-5 rounded-sm"
                  style={{
                    backgroundColor: `oklch(0.488 0.243 264 / ${op})`,
                  }}
                />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
