import { ApifyClient } from "apify-client";
import { env } from "../config/env";

interface ApifyProfileResult {
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  profilePicUrl: string;
  isVerified: boolean;
}

interface ApifyPostResult {
  id: string;
  type: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  url: string;
  displayUrl: string;
}

export const apifyService = {
  getClient(): ApifyClient {
    return new ApifyClient({ token: (env as any).APIFY_API_TOKEN });
  },

  async scrapeProfile(username: string): Promise<ApifyProfileResult | null> {
    const client = this.getClient();
    const startedAt = Date.now();

    const run = await client.actor("apify/instagram-profile-scraper").call({
      usernames: [username],
      resultsLimit: 1,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    if (!items.length) return null;

    const item = items[0] as any;
    return {
      username: item.username || username,
      fullName: item.fullName || "",
      biography: item.biography || "",
      followersCount: item.followersCount || 0,
      followsCount: item.followsCount || 0,
      postsCount: item.postsCount || 0,
      profilePicUrl: item.profilePicUrl || "",
      isVerified: item.isVerified || false,
    };
  },

  async scrapePosts(username: string, limit = 25): Promise<ApifyPostResult[]> {
    const client = this.getClient();

    const run = await client.actor("apify/instagram-post-scraper").call({
      username,
      resultsLimit: limit,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return items.map((item: any) => ({
      id: item.id || item.shortCode || "",
      type: item.type || "image",
      caption: item.caption || "",
      likesCount: item.likesCount || 0,
      commentsCount: item.commentsCount || 0,
      timestamp: item.timestamp || "",
      url: item.url || "",
      displayUrl: item.displayUrl || "",
    }));
  },

  isConfigured(): boolean {
    return !!(env as any).APIFY_API_TOKEN;
  },
};
