import { NavLink, useParams } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Users,
  Lightbulb,
  CalendarDays,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "competitors", icon: Users, label: "Competitors" },
  { to: "ai-insights", icon: Lightbulb, label: "AI Insights" },
  { to: "content-plan", icon: CalendarDays, label: "Content Plan" },
  { to: "settings", icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const { id } = useParams();

  return (
    <div className="flex h-screen w-60 flex-col border-r bg-gradient-to-b from-card to-card/80">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="rounded-xl bg-gradient-to-br from-primary to-violet-500 p-2">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-sm tracking-tight">Social Analytics</span>
      </div>
      <Separator />

      <div className="px-3 py-2">
        <NavLink to="/workspaces">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:translate-x-0.5 transition-transform duration-200">
            <ArrowLeft className="h-4 w-4" />
            All Workspaces
          </Button>
        </NavLink>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={`/workspaces/${id}/${item.to}`}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="px-3 py-3">
        <p className="text-[10px] text-muted-foreground/50 text-center">v1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
