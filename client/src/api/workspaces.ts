import api from "@/api/axios";

export interface Workspace {
  _id: string;
  owner: string;
  name: string;
  instagramUsername: string;
  instagramBusinessId?: string;
  competitors: { username: string; businessId?: string }[];
  createdAt: string;
  updatedAt: string;
}

export const workspacesApi = {
  list: () => api.get<Workspace[]>("/workspaces").then((r) => r.data),

  get: (id: string) => api.get<Workspace>(`/workspaces/${id}`).then((r) => r.data),

  create: (data: { name: string; instagramUsername: string; competitors?: { username: string }[] }) =>
    api.post<Workspace>("/workspaces", data).then((r) => r.data),

  update: (id: string, data: Partial<Workspace>) =>
    api.put<Workspace>(`/workspaces/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/workspaces/${id}`).then((r) => r.data),
};
