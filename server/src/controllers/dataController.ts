import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Workspace } from "../models/Workspace";
import { InstagramProfile } from "../models/InstagramProfile";
import { InstagramPost } from "../models/InstagramPost";
import { FetchLog } from "../models/FetchLog";
import { apifyService } from "../services/apifyService";
import { perplexityService } from "../services/perplexityService";
import { redditService } from "../services/redditService";
import { User } from "../models/User";

export const fetchWorkspaceData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const results: Array<{ username: string; status: string; source: string }> = [];
    const usernames = [
      workspace.instagramUsername,
      ...workspace.competitors.map((c) => c.username),
    ];

    for (const username of usernames) {
      const startTime = Date.now();
      const isOwner = username === workspace.instagramUsername;

      try {
        if (!apifyService.isConfigured()) {
          results.push({ username, status: "skipped", source: "none" });
          continue;
        }

        // Fetch profile
        const profileData = await apifyService.scrapeProfile(username);
        if (!profileData) {
          results.push({ username, status: "not_found", source: "apify" });
          continue;
        }

        // Upsert profile
        await InstagramProfile.findOneAndUpdate(
          { workspaceId: workspace._id, username },
          {
            workspaceId: workspace._id,
            username,
            isOwner,
            followers: profileData.followersCount,
            following: profileData.followsCount,
            postsCount: profileData.postsCount,
            bio: profileData.biography,
            profilePicUrl: profileData.profilePicUrl,
            lastFetched: new Date(),
          },
          { upsert: true, new: true }
        );

        // Fetch posts
        const posts = await apifyService.scrapePosts(username, 20);
        const profile = await InstagramProfile.findOne({
          workspaceId: workspace._id,
          username,
        });

        for (const post of posts) {
          await InstagramPost.findOneAndUpdate(
            { workspaceId: workspace._id, postId: post.id },
            {
              profileId: profile?._id,
              workspaceId: workspace._id,
              postId: post.id,
              type: post.type as any,
              caption: post.caption,
              likes: post.likesCount,
              comments: post.commentsCount,
              timestamp: post.timestamp ? new Date(post.timestamp) : undefined,
              url: post.url,
              thumbnailUrl: post.displayUrl,
              lastFetched: new Date(),
            },
            { upsert: true }
          );
        }

        await FetchLog.create({
          workspaceId: workspace._id,
          source: "apify",
          status: "success",
          dataType: "profile+posts",
          recordsCount: 1 + posts.length,
          duration: Date.now() - startTime,
        });

        results.push({ username, status: "success", source: "apify" });
      } catch (error: any) {
        await FetchLog.create({
          workspaceId: workspace._id,
          source: "apify",
          status: "error",
          dataType: "profile+posts",
          error: error.message,
          duration: Date.now() - startTime,
        });
        results.push({ username, status: "error", source: "apify" });
      }
    }

    res.json({ message: "Data fetch completed", results });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const fetchTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const { niche, keywords } = req.body;
    const results: Record<string, any> = { trends: [], reddit: [] };

    // Check for user's Perplexity key
    const user = await User.findById(req.userId).select("+apiKeys.perplexityKey");
    const userPerplexityKey = user?.apiKeys?.perplexityKey;

    if (perplexityService.isConfigured(userPerplexityKey) && niche) {
      try {
        results.trends = await perplexityService.searchTrends(niche, keywords || [], userPerplexityKey);
      } catch (error: any) {
        results.trendsError = error.message;
      }
    }

    if (redditService.isConfigured() && keywords?.length) {
      try {
        results.reddit = await redditService.searchPosts(keywords, 15);
      } catch (error: any) {
        results.redditError = error.message;
      }
    }

    res.json(results);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfiles = async (req: AuthRequest, res: Response): Promise<void> => {
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
    res.json(profiles);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const { profileId } = req.query;
    const filter: Record<string, any> = { workspaceId: workspace._id };
    if (profileId) filter.profileId = profileId;

    const posts = await InstagramPost.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json(posts);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
