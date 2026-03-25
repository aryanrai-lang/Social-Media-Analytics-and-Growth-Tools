import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Workspace } from "../models/Workspace";
import { InstagramProfile } from "../models/InstagramProfile";
import { InstagramPost } from "../models/InstagramPost";
import { AIGeneration } from "../models/AIGeneration";
import { analyticsService } from "../services/analyticsService";
import { aiService } from "../services/aiService";
import { User } from "../models/User";
import { AiModelType, getModelDisplayName } from "../services/multiModelService";

async function getUserAiOptions(userId: string) {
  const user = await User.findById(userId).select("+apiKeys.claudeKey +apiKeys.openaiKey +apiKeys.perplexityKey");
  const model: AiModelType = user?.preferredAiModel || "gemini";
  let apiKey: string | undefined;
  if (model === "claude") apiKey = user?.apiKeys?.claudeKey;
  else if (model === "openai") apiKey = user?.apiKeys?.openaiKey;
  return { model, apiKey };
}

async function getWorkspaceAnalyticsData(workspaceId: string, userId: string) {
  console.log("[AI Controller] Getting analytics data for workspace:", workspaceId, "user:", userId);

  const workspace = await Workspace.findOne({ _id: workspaceId, owner: userId });
  if (!workspace) { console.log("[AI Controller] Workspace not found"); return null; }

  const ownerProfile = await InstagramProfile.findOne({
    workspaceId: workspace._id,
    isOwner: true,
  });
  if (!ownerProfile) { console.log("[AI Controller] Owner profile not found"); return null; }
  console.log("[AI Controller] Owner profile:", ownerProfile.username, "followers:", ownerProfile.followers);

  const ownerPosts = await InstagramPost.find({ profileId: ownerProfile._id });
  console.log("[AI Controller] Owner posts count:", ownerPosts.length);

  const ownerAnalytics = analyticsService.computeProfileAnalytics(ownerProfile, ownerPosts);
  console.log("[AI Controller] Owner analytics:", JSON.stringify(ownerAnalytics, null, 2));

  const competitorProfiles = await InstagramProfile.find({
    workspaceId: workspace._id,
    isOwner: false,
  });
  console.log("[AI Controller] Competitor profiles:", competitorProfiles.length);

  const competitorData = await Promise.all(
    competitorProfiles.map(async (profile) => {
      const posts = await InstagramPost.find({ profileId: profile._id });
      console.log("[AI Controller] Competitor", profile.username, "posts:", posts.length);
      return {
        username: profile.username,
        analytics: analyticsService.computeProfileAnalytics(profile, posts),
      };
    })
  );

  const gaps = analyticsService.findGaps(
    ownerAnalytics,
    competitorData.map((c) => c.analytics)
  );
  console.log("[AI Controller] Gaps:", JSON.stringify(gaps));

  return { workspace, ownerProfile, ownerAnalytics, competitorData, gaps };
}

export const generateGapAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log("[AI Controller] generateGapAnalysis called, workspace:", req.params.id);

    const aiOptions = await getUserAiOptions(req.userId!);
    console.log("[AI Controller] Using model:", aiOptions.model);

    if (!aiService.isConfigured(aiOptions.apiKey, aiOptions.model)) {
      console.log("[AI Controller] AI service NOT configured");
      res.status(400).json({ message: "AI service not configured. Set GEMINI_API_KEY or add your API key in Settings." });
      return;
    }

    const data = await getWorkspaceAnalyticsData(req.params.id, req.userId!);
    if (!data) {
      console.log("[AI Controller] No data returned from getWorkspaceAnalyticsData");
      res.status(404).json({ message: "Workspace or profile data not found." });
      return;
    }

    console.log("[AI Controller] Calling", aiOptions.model, "...");
    const output = await aiService.generateGapAnalysis(
      data.ownerProfile.username,
      data.ownerAnalytics,
      data.gaps,
      data.competitorData,
      aiOptions
    );
    console.log("[AI Controller] AI output:", JSON.stringify(output).substring(0, 200));

    const generation = await AIGeneration.create({
      workspaceId: data.workspace._id,
      type: "gap_analysis",
      input: { ownerAnalytics: data.ownerAnalytics, gaps: data.gaps },
      output,
      aiModel: getModelDisplayName(aiOptions.model),
    });

    res.json(generation);
  } catch (error: any) {
    console.error("[AI Controller] ERROR:", error.message, error.stack?.substring(0, 300));
    res.status(500).json({ message: error.message || "AI generation failed" });
  }
};

export const generateContentPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const aiOptions = await getUserAiOptions(req.userId!);

    if (!aiService.isConfigured(aiOptions.apiKey, aiOptions.model)) {
      res.status(400).json({ message: "AI service not configured. Set GEMINI_API_KEY or add your API key in Settings." });
      return;
    }

    const { period = "weekly", trends = [] } = req.body;
    const data = await getWorkspaceAnalyticsData(req.params.id, req.userId!);
    if (!data) {
      res.status(404).json({ message: "Workspace or profile data not found." });
      return;
    }

    const output = await aiService.generateContentPlan(
      data.ownerProfile.username,
      data.ownerAnalytics,
      data.gaps,
      trends,
      period,
      aiOptions
    );

    const generation = await AIGeneration.create({
      workspaceId: data.workspace._id,
      type: "content_plan",
      input: { ownerAnalytics: data.ownerAnalytics, gaps: data.gaps, trends, period },
      output,
      aiModel: getModelDisplayName(aiOptions.model),
    });

    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "AI generation failed" });
  }
};

export const generateGrowthStrategy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const aiOptions = await getUserAiOptions(req.userId!);

    if (!aiService.isConfigured(aiOptions.apiKey, aiOptions.model)) {
      res.status(400).json({ message: "AI service not configured. Set GEMINI_API_KEY or add your API key in Settings." });
      return;
    }

    const data = await getWorkspaceAnalyticsData(req.params.id, req.userId!);
    if (!data) {
      res.status(404).json({ message: "Workspace or profile data not found." });
      return;
    }

    const output = await aiService.generateGrowthStrategy(
      data.ownerProfile.username,
      data.ownerAnalytics,
      data.gaps,
      data.competitorData.length,
      aiOptions
    );

    const generation = await AIGeneration.create({
      workspaceId: data.workspace._id,
      type: "growth_strategy",
      input: { ownerAnalytics: data.ownerAnalytics, gaps: data.gaps },
      output,
      aiModel: getModelDisplayName(aiOptions.model),
    });

    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "AI generation failed" });
  }
};

export const generateContentIdeas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const aiOptions = await getUserAiOptions(req.userId!);

    if (!aiService.isConfigured(aiOptions.apiKey, aiOptions.model)) {
      res.status(400).json({ message: "AI service not configured. Set GEMINI_API_KEY or add your API key in Settings." });
      return;
    }

    const { niche = "general", trends = [] } = req.body;
    const data = await getWorkspaceAnalyticsData(req.params.id, req.userId!);
    if (!data) {
      res.status(404).json({ message: "Workspace or profile data not found." });
      return;
    }

    const output = await aiService.generateContentIdeas(
      data.ownerProfile.username,
      niche,
      data.ownerAnalytics,
      trends,
      aiOptions
    );

    const generation = await AIGeneration.create({
      workspaceId: data.workspace._id,
      type: "content_ideas",
      input: { niche, trends },
      output,
      aiModel: getModelDisplayName(aiOptions.model),
    });

    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "AI generation failed" });
  }
};

export const getAIHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const { type } = req.query;
    const filter: Record<string, any> = { workspaceId: workspace._id };
    if (type) filter.type = type;

    const generations = await AIGeneration.find(filter).sort({ createdAt: -1 }).limit(20);
    res.json(generations);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
