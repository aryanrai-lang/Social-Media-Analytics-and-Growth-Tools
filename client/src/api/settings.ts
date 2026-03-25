import api from "@/api/axios";

export interface ApiKeysResponse {
  preferredAiModel: "gemini" | "claude" | "openai";
  claudeKey: string;
  openaiKey: string;
  perplexityKey: string;
  hasClaude: boolean;
  hasOpenai: boolean;
  hasPerplexity: boolean;
}

export interface UpdateApiKeysPayload {
  preferredAiModel?: "gemini" | "claude" | "openai";
  claudeKey?: string;
  openaiKey?: string;
  perplexityKey?: string;
}

export const settingsApi = {
  getApiKeys: () => api.get<ApiKeysResponse>("/auth/api-keys").then((r) => r.data),

  updateApiKeys: (data: UpdateApiKeysPayload) =>
    api.put("/auth/api-keys", data).then((r) => r.data),
};
