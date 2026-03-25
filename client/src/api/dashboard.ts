import api from "@/api/axios";

export const dashboardApi = {
  overview: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/dashboard/overview`).then((r) => r.data),
};
