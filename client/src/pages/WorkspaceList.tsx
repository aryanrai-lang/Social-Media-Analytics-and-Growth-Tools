import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { workspacesApi, type Workspace } from "@/api/workspaces";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Camera,
  Users,
  LogOut,
  Trash2,
  BarChart3,
} from "lucide-react";

const WorkspaceList = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [name, setName] = useState("");
  const [igUsername, setIgUsername] = useState("");
  const [competitors, setCompetitors] = useState("");

  const fetchWorkspaces = async () => {
    try {
      const data = await workspacesApi.list();
      setWorkspaces(data);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !igUsername.trim()) return;
    setCreating(true);
    try {
      const compList = competitors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((username) => ({ username }));

      await workspacesApi.create({
        name: name.trim(),
        instagramUsername: igUsername.trim(),
        competitors: compList,
      });
      setName("");
      setIgUsername("");
      setCompetitors("");
      setDialogOpen(false);
      fetchWorkspaces();
    } catch {
      // handle error
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await workspacesApi.delete(id);
      setWorkspaces((prev) => prev.filter((w) => w._id !== id));
    } catch {
      // handle error
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 bg-card/50 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-violet-500 p-2">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Social Analytics</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="active:scale-[0.98] transition-transform">
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Workspaces</h1>
            <p className="text-muted-foreground mt-1">
              Manage your Instagram analytics workspaces
            </p>
          </div>

          {/* Desktop create button */}
          <div className="hidden sm:block">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gradient-to-r from-primary to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200">
                  <Plus className="h-4 w-4" />
                  New Workspace
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Workspace</DialogTitle>
                  <DialogDescription>
                    Set up a new workspace to track an Instagram account and its
                    competitors.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ws-name">Workspace Name</Label>
                    <Input
                      id="ws-name"
                      placeholder="My Brand"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ws-ig">Instagram Username</Label>
                    <Input
                      id="ws-ig"
                      placeholder="yourbrand"
                      value={igUsername}
                      onChange={(e) => setIgUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ws-comp">
                      Competitors{" "}
                      <span className="text-muted-foreground font-normal">
                        (comma-separated)
                      </span>
                    </Label>
                    <Input
                      id="ws-comp"
                      placeholder="competitor1, competitor2"
                      value={competitors}
                      onChange={(e) => setCompetitors(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={creating} className="bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90">
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Workspace Cards */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 p-5 w-fit mx-auto mb-4">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No workspaces yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Create your first workspace to start tracking Instagram
                analytics.
              </p>
              <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws, i) => (
              <Card
                key={ws._id}
                className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Gradient top border */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-violet-500" />

                <CardHeader
                  className="pb-3 pt-5"
                  onClick={() => navigate(`/workspaces/${ws._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{ws.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Camera className="h-3 w-3" />@
                        {ws.instagramUsername}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(ws._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent onClick={() => navigate(`/workspaces/${ws._id}`)}>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5">
                      <Users className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {ws.competitors.length} competitor
                        {ws.competitors.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button — mobile */}
      <button
        onClick={() => setDialogOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-primary to-violet-600 p-4 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Dialog for mobile FAB */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:hidden">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Set up a new workspace to track an Instagram account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name-m">Workspace Name</Label>
              <Input id="ws-name-m" placeholder="My Brand" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-ig-m">Instagram Username</Label>
              <Input id="ws-ig-m" placeholder="yourbrand" value={igUsername} onChange={(e) => setIgUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-comp-m">Competitors <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
              <Input id="ws-comp-m" placeholder="competitor1, competitor2" value={competitors} onChange={(e) => setCompetitors(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90">
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceList;
