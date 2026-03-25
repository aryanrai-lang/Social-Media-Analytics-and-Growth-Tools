import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { ProfileAnalytics, GapItem } from "./analyticsService";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");

const getModel = () => genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const aiService = {
  async generateGapAnalysis(
    ownerUsername: string,
    ownerAnalytics: ProfileAnalytics,
    gaps: GapItem[],
    competitorData: { username: string; analytics: ProfileAnalytics }[]
  ): Promise<Record<string, any>> {
    const model = getModel();
    const prompt = `You are a social media growth strategist. Analyze the Instagram performance gaps for @${ownerUsername}.

OWNER ANALYTICS:
${JSON.stringify(ownerAnalytics, null, 2)}

GAPS VS COMPETITORS:
${JSON.stringify(gaps, null, 2)}

COMPETITOR DATA:
${JSON.stringify(competitorData, null, 2)}

Provide a comprehensive gap analysis in this exact JSON format:
{
  "summary": "Brief overall assessment (2-3 sentences)",
  "criticalGaps": [
    {
      "area": "string",
      "currentState": "string",
      "targetState": "string",
      "priority": "high|medium|low",
      "actionItems": ["string"]
    }
  ],
  "strengths": ["string"],
  "opportunities": ["string"],
  "quickWins": ["string"]
}

Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text };
    } catch {
      return { summary: text };
    }
  },

  async generateContentPlan(
    ownerUsername: string,
    ownerAnalytics: ProfileAnalytics,
    gaps: GapItem[],
    trends: any[],
    period: "weekly" | "daily" = "weekly"
  ): Promise<Record<string, any>> {
    const model = getModel();
    const days = period === "weekly" ? 7 : 1;

    const prompt = `You are a social media content planner. Create a ${period} content plan for @${ownerUsername}'s Instagram.

ANALYTICS: ${JSON.stringify(ownerAnalytics, null, 2)}
KEY GAPS: ${JSON.stringify(gaps, null, 2)}
CURRENT TRENDS: ${JSON.stringify(trends, null, 2)}
BEST POSTING TIMES: ${JSON.stringify(ownerAnalytics.bestTimes)}

Create a ${days}-day content plan in this exact JSON format:
{
  "planName": "string",
  "period": "${period}",
  "days": [
    {
      "day": 1,
      "date": "Day 1",
      "posts": [
        {
          "time": "string",
          "type": "reel|carousel|image|story",
          "topic": "string",
          "caption": "string (include hashtags)",
          "rationale": "string"
        }
      ]
    }
  ],
  "overallStrategy": "string",
  "expectedOutcome": "string"
}

Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { planName: "Content Plan", days: [] };
    } catch {
      return { planName: "Content Plan", days: [], raw: text };
    }
  },

  async generateGrowthStrategy(
    ownerUsername: string,
    ownerAnalytics: ProfileAnalytics,
    gaps: GapItem[],
    competitorCount: number
  ): Promise<Record<string, any>> {
    const model = getModel();

    const prompt = `You are an Instagram growth expert. Create a growth strategy for @${ownerUsername}.

CURRENT ANALYTICS: ${JSON.stringify(ownerAnalytics, null, 2)}
GAPS VS ${competitorCount} COMPETITORS: ${JSON.stringify(gaps, null, 2)}

Create a growth strategy in this exact JSON format:
{
  "strategyName": "string",
  "overallGoal": "string",
  "phases": [
    {
      "name": "string",
      "duration": "string",
      "focus": "string",
      "actions": [
        {
          "action": "string",
          "details": "string",
          "priority": "high|medium|low",
          "expectedImpact": "string"
        }
      ]
    }
  ],
  "kpis": [
    {
      "metric": "string",
      "currentValue": "string",
      "targetValue": "string",
      "timeframe": "string"
    }
  ],
  "doNot": ["string"]
}

Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { strategyName: "Growth Strategy" };
    } catch {
      return { strategyName: "Growth Strategy", raw: text };
    }
  },

  async generateContentIdeas(
    ownerUsername: string,
    niche: string,
    ownerAnalytics: ProfileAnalytics,
    trends: any[]
  ): Promise<Record<string, any>> {
    const model = getModel();

    const prompt = `You are a creative Instagram content strategist. Generate content ideas for @${ownerUsername} in the "${niche}" niche.

ANALYTICS: ${JSON.stringify(ownerAnalytics, null, 2)}
CURRENT TRENDS: ${JSON.stringify(trends, null, 2)}

Generate 10 unique content ideas in this exact JSON format:
{
  "ideas": [
    {
      "title": "string",
      "type": "reel|carousel|image|story",
      "hook": "string (attention-grabbing first line)",
      "outline": "string",
      "hashtags": ["string"],
      "estimatedEngagement": "high|medium|low"
    }
  ]
}

Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { ideas: [] };
    } catch {
      return { ideas: [], raw: text };
    }
  },

  isConfigured(): boolean {
    return !!env.GEMINI_API_KEY;
  },
};
