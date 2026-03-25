import api from "@/api/axios";

export const analyticsApi = {
  get: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/analytics`).then((r) => r.data),

  compare: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/analytics/compare`).then((r) => r.data),

  gaps: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/analytics/gaps`).then((r) => r.data),
};
