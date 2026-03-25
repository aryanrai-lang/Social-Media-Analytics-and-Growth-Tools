import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Workspace } from "../models/Workspace";
import { InstagramProfile } from "../models/InstagramProfile";
import { InstagramPost } from "../models/InstagramPost";
import { AIGeneration } from "../models/AIGeneration";
import { analyticsService } from "../services/analyticsService";
import { aiService } from "../services/aiService";

async function getWorkspaceAnalyticsData(workspaceId: string, userId: string) {
  const workspace = await Workspace.findOne({ _id: workspaceId, owner: userId });
  if (!workspace) return null;

  const ownerProfile = await InstagramProfile.findOne({
    workspaceId: workspace._id,
    isOwner: true,
  });
  if (!ownerProfile) return null;

  const ownerPosts = await InstagramPost.find({ profileId: ownerProfile._id });
  const ownerAnalytics = analyticsService.computeProfileAnalytics(ownerProfile, ownerPosts);

  const competitorProfiles = await InstagramProfile.find({
    workspaceId: workspace._id,
    isOwner: false,
  });

  const competitorData = await Promise.all(
    competitorProfiles.map(async (profile) => {
      const posts = await InstagramPost.find({ profileId: profile._id });
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

  return { workspace, ownerProfile, ownerAnalytics, competitorData, gaps };
}

export const generateGapAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!aiService.isConfigured()) {
      res.status(400).json({ message: "AI service not configured. Set GEMINI_API_KEY." });
      return;
    }

    const data = await getWorkspaceAnalyticsData(req.params.id, req.userId!);
    if (!data) {
      res.status(404).json({ message: "Workspace or profile data not found." });
      return;
    }

    const output = await aiService.generateGapAnalysis(
      data.ownerProfile.username,
      data.ownerAnalytics,
      data.gaps,
      data.competitorData
    );

    const generation = await AIGeneration.create({
      workspaceId: data.workspace._id,
      type: "gap_analysis",
      input: { ownerAnalytics: data.ownerAnalytics, gaps: data.gaps },
      output,
      aiModel: "gemini-1.5-flash",
    });

    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "AI generation failed" });
  }
};

export const generateContentPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!aiService.isConfigured()) {
      res.status(400).json({ message: "AI service not configured. Set GEMINI_API_KEY." });
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
      period
    );

    const generation = await AIGeneration.create({
      workspaceId: data.workspace._id,
      type: "content_plan",
      input: { ownerAnalytics: data.ownerAnalytics, gaps: data.gaps, trends, period },
      output,
      aiModel: "gemini-1.5-flash",
    });

    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "AI generation failed" });
  }
};

export const generateGrowthStrategy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!aiService.isConfigured()) {
      res.status(400).json({ message: "AI service not configured. Set GEMINI_API_KEY." });
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
      data.competitorData.length
    );

    const generation = await AIGeneration.create({
      workspaceId: data.workspace._id,
      type: "growth_strategy",
      input: { ownerAnalytics: data.ownerAnalytics, gaps: data.gaps },
      output,
      aiModel: "gemini-1.5-flash",
    });

    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "AI generation failed" });
  }
};

export const generateContentIdeas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!aiService.isConfigured()) {
      res.status(400).json({ message: "AI service not configured. Set GEMINI_API_KEY." });
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
      trends
    );

    const generation = await AIGeneration.create({
      workspaceId: data.workspace._id,
      type: "content_ideas",
      input: { niche, trends },
      output,
      aiModel: "gemini-1.5-flash",
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
