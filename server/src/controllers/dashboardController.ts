import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Workspace } from "../models/Workspace";
import { InstagramProfile } from "../models/InstagramProfile";
import { InstagramPost } from "../models/InstagramPost";
import { AIGeneration } from "../models/AIGeneration";
import { analyticsService } from "../services/analyticsService";

export const getDashboardOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const ownerProfile = await InstagramProfile.findOne({
      workspaceId: workspace._id,
      isOwner: true,
    });

    let ownerAnalytics = null;
    if (ownerProfile) {
      const posts = await InstagramPost.find({ profileId: ownerProfile._id });
      ownerAnalytics = analyticsService.computeProfileAnalytics(ownerProfile, posts);
    }

    const competitorCount = await InstagramProfile.countDocuments({
      workspaceId: workspace._id,
      isOwner: false,
    });

    const recentAI = await AIGeneration.find({ workspaceId: workspace._id })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      workspace: {
        id: workspace._id,
        name: workspace.name,
        instagramUsername: workspace.instagramUsername,
        competitorCount: workspace.competitors.length,
      },
      profile: ownerProfile
        ? {
            username: ownerProfile.username,
            followers: ownerProfile.followers,
            following: ownerProfile.following,
            postsCount: ownerProfile.postsCount,
            bio: ownerProfile.bio,
            profilePicUrl: ownerProfile.profilePicUrl,
            lastFetched: ownerProfile.lastFetched,
          }
        : null,
      analytics: ownerAnalytics,
      competitorCount,
      recentAI: recentAI.map((g) => ({
        id: g._id,
        type: g.type,
        createdAt: g.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
