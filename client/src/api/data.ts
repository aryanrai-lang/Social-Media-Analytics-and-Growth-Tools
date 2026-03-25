import api from "@/api/axios";

export const dataApi = {
  fetchData: (workspaceId: string) =>
    api.post(`/workspaces/${workspaceId}/fetch`).then((r) => r.data),

  fetchTrends: (workspaceId: string, niche: string, keywords: string[]) =>
    api.post(`/workspaces/${workspaceId}/fetch/trends`, { niche, keywords }).then((r) => r.data),

  getProfiles: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/profiles`).then((r) => r.data),

  getPosts: (workspaceId: string, profileId?: string) =>
    api.get(`/workspaces/${workspaceId}/posts`, { params: { profileId } }).then((r) => r.data),
};
