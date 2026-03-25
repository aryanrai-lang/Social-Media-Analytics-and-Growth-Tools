import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Workspace } from "../models/Workspace";
import { InstagramProfile } from "../models/InstagramProfile";
import { InstagramPost } from "../models/InstagramPost";
import { Analytics } from "../models/Analytics";
import { analyticsService } from "../services/analyticsService";

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const profiles = await InstagramProfile.find({ workspaceId: workspace._id });
    const results: Record<string, any>[] = [];

    for (const profile of profiles) {
      const posts = await InstagramPost.find({ profileId: profile._id });
      const analytics = analyticsService.computeProfileAnalytics(profile, posts);

      // Save to DB
      await Analytics.findOneAndUpdate(
        { workspaceId: workspace._id, profileId: profile._id },
        {
          workspaceId: workspace._id,
          profileId: profile._id,
          metrics: analytics,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      results.push({
        username: profile.username,
        isOwner: profile.isOwner,
        followers: profile.followers,
        ...analytics,
      });
    }

    res.json(results);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getCompetitorComparison = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (!ownerProfile) {
      res.status(404).json({ message: "Owner profile not found. Fetch data first." });
      return;
    }

    const ownerPosts = await InstagramPost.find({ profileId: ownerProfile._id });
    const ownerAnalytics = analyticsService.computeProfileAnalytics(ownerProfile, ownerPosts);

    const competitorProfiles = await InstagramProfile.find({
      workspaceId: workspace._id,
      isOwner: false,
    });

    const competitors = await Promise.all(
      competitorProfiles.map(async (profile) => {
        const posts = await InstagramPost.find({ profileId: profile._id });
        return {
          profile,
          analytics: analyticsService.computeProfileAnalytics(profile, posts),
        };
      })
    );

    const comparison = analyticsService.compareProfiles(ownerAnalytics, ownerProfile, competitors);

    res.json(comparison);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getGaps = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (!ownerProfile) {
      res.status(404).json({ message: "Owner profile not found. Fetch data first." });
      return;
    }

    const ownerPosts = await InstagramPost.find({ profileId: ownerProfile._id });
    const ownerAnalytics = analyticsService.computeProfileAnalytics(ownerProfile, ownerPosts);

    const competitorProfiles = await InstagramProfile.find({
      workspaceId: workspace._id,
      isOwner: false,
    });

    const competitorAnalyticsList = await Promise.all(
      competitorProfiles.map(async (profile) => {
        const posts = await InstagramPost.find({ profileId: profile._id });
        return analyticsService.computeProfileAnalytics(profile, posts);
      })
    );

    const gaps = analyticsService.findGaps(ownerAnalytics, competitorAnalyticsList);

    res.json({ gaps, ownerAnalytics });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
