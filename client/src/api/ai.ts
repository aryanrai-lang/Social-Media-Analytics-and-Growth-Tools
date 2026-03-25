import api from "@/api/axios";

export const aiApi = {
  gapAnalysis: (workspaceId: string) =>
    api.post(`/workspaces/${workspaceId}/ai/gap-analysis`).then((r) => r.data),

  contentPlan: (workspaceId: string, period = "weekly", trends: any[] = []) =>
    api.post(`/workspaces/${workspaceId}/ai/content-plan`, { period, trends }).then((r) => r.data),

  growthStrategy: (workspaceId: string) =>
    api.post(`/workspaces/${workspaceId}/ai/growth-strategy`).then((r) => r.data),

  contentIdeas: (workspaceId: string, niche: string, trends: any[] = []) =>
    api.post(`/workspaces/${workspaceId}/ai/content-ideas`, { niche, trends }).then((r) => r.data),

  history: (workspaceId: string, type?: string) =>
    api.get(`/workspaces/${workspaceId}/ai/history`, { params: { type } }).then((r) => r.data),
};
