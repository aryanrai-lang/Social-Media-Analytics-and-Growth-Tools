import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { workspacesApi, type Workspace } from "@/api/workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Save, Loader2 } from "lucide-react";

const WorkspaceSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [name, setName] = useState("");
  const [igUsername, setIgUsername] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    workspacesApi.get(id).then((ws) => {
      setWorkspace(ws);
      setName(ws.name);
      setIgUsername(ws.instagramUsername);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!id || !workspace) return;
    setSaving(true);
    try {
      const updated = await workspacesApi.update(id, {
        name,
        instagramUsername: igUsername,
        competitors: workspace.competitors,
      });
      setWorkspace(updated);
    } catch {
      // handle
    } finally {
      setSaving(false);
    }
  };

  const addCompetitor = () => {
    if (!newCompetitor.trim() || !workspace) return;
    setWorkspace({
      ...workspace,
      competitors: [
        ...workspace.competitors,
        { username: newCompetitor.trim() },
      ],
    });
    setNewCompetitor("");
  };

  const removeCompetitor = (idx: number) => {
    if (!workspace) return;
    setWorkspace({
      ...workspace,
      competitors: workspace.competitors.filter((_, i) => i !== idx),
    });
  };

  const handleDelete = async () => {
    if (!id) return;
    await workspacesApi.delete(id);
    navigate("/workspaces");
  };

  if (loading) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage workspace configuration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Workspace Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Instagram Username</Label>
            <Input
              value={igUsername}
              onChange={(e) => setIgUsername(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competitors</CardTitle>
          <CardDescription>
            Track up to 20 competitor accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add competitor username"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
            />
            <Button variant="outline" onClick={addCompetitor}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {workspace?.competitors.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <span className="text-sm">@{c.username}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeCompetitor(i)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
          {workspace?.competitors.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No competitors added yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Workspace
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
