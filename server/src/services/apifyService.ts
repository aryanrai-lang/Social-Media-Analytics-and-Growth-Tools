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
    return new ApifyClient({ token: env.APIFY_API_TOKEN });
  },

  async scrapeProfile(username: string): Promise<ApifyProfileResult | null> {
    const client = this.getClient();

    console.log(`[Apify] Scraping profile: @${username}`);

    const run = await client.actor("apify/instagram-scraper").call({
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: "details",
      resultsLimit: 1,
      searchType: "hashtag",
      searchLimit: 1,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`[Apify] Profile results for @${username}: ${items.length} items`);

    if (!items.length) return null;

    const item = items[0] as any;
    console.log(`[Apify] Profile data keys:`, Object.keys(item).join(", "));

    return {
      username: item.username || username,
      fullName: item.fullName || item.full_name || "",
      biography: item.biography || item.bio || "",
      followersCount: item.followersCount || item.followedBy || 0,
      followsCount: item.followsCount || item.follows || 0,
      postsCount: item.postsCount || item.mediaCount || 0,
      profilePicUrl: item.profilePicUrl || item.profilePicUrlHD || "",
      isVerified: item.isVerified || item.verified || false,
    };
  },

  async scrapePosts(username: string, limit = 20): Promise<ApifyPostResult[]> {
    const client = this.getClient();

    console.log(`[Apify] Scraping posts: @${username} (limit: ${limit})`);

    const run = await client.actor("apify/instagram-scraper").call({
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: "posts",
      resultsLimit: limit,
      searchType: "hashtag",
      searchLimit: 1,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`[Apify] Post results for @${username}: ${items.length} items`);

    if (items.length > 0) {
      console.log(`[Apify] Post data keys:`, Object.keys(items[0]).join(", "));
    }

    return items.map((item: any) => ({
      id: item.id || item.shortCode || item.pk || "",
      type: item.type || item.productType || "image",
      caption: item.caption || "",
      likesCount: item.likesCount || item.likes || 0,
      commentsCount: item.commentsCount || item.comments || 0,
      timestamp: item.timestamp || item.takenAt || "",
      url: item.url || item.webLink || "",
      displayUrl: item.displayUrl || item.imageUrl || "",
    }));
  },

  isConfigured(): boolean {
    const configured = !!env.APIFY_API_TOKEN;
    console.log(`[Apify] isConfigured: ${configured}`);
    return configured;
  },
};