import axios from "axios";
import { env } from "../config/env";

interface TrendResult {
  topic: string;
  summary: string;
  relevance: string;
}

interface ContentIdea {
  title: string;
  description: string;
  format: string;
}

const PERPLEXITY_BASE_URL = "https://api.perplexity.ai";

export const perplexityService = {
  async searchTrends(niche: string, keywords: string[], userApiKey?: string): Promise<TrendResult[]> {
    const apiKey = userApiKey || (env as any).PERPLEXITY_API_KEY;
    const query = `What are the current trending topics and content themes in the ${niche} niche on Instagram? Focus on: ${keywords.join(", ")}. Return structured data about each trend.`;

    const response = await axios.post(
      `${PERPLEXITY_BASE_URL}/chat/completions`,
      {
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a social media trend analyst. Return structured JSON arrays of trends with fields: topic, summary, relevance (high/medium/low).",
          },
          { role: "user", content: query },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content || "[]";
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [{ topic: niche, summary: content, relevance: "medium" }];
    }
  },

  async getContentIdeas(niche: string, userApiKey?: string): Promise<ContentIdea[]> {
    const apiKey = userApiKey || (env as any).PERPLEXITY_API_KEY;
    const query = `Generate 10 unique Instagram content ideas for the ${niche} niche. Include diverse content formats (Reels, Carousels, Stories, Posts). Return as JSON array with fields: title, description, format.`;

    const response = await axios.post(
      `${PERPLEXITY_BASE_URL}/chat/completions`,
      {
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a social media content strategist. Return structured JSON arrays of content ideas.",
          },
          { role: "user", content: query },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content || "[]";
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  },

  isConfigured(userApiKey?: string): boolean {
    return !!(userApiKey || (env as any).PERPLEXITY_API_KEY);
  },
};
