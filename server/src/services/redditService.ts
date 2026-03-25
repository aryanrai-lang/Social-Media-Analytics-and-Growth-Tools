import Snoowrap from "snoowrap";
import { env } from "../config/env";

interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  numComments: number;
  url: string;
  subreddit: string;
  createdUtc: number;
}

interface SentimentResult {
  positive: number;
  negative: number;
  neutral: number;
  topThemes: string[];
}

export const redditService = {
  getClient(): Snoowrap {
    return new Snoowrap({
      userAgent: (env as any).REDDIT_USER_AGENT || "social-media-analytics/1.0",
      clientId: (env as any).REDDIT_CLIENT_ID,
      clientSecret: (env as any).REDDIT_CLIENT_SECRET,
      username: "",
      password: "",
    });
  },

  async searchPosts(keywords: string[], limit = 25): Promise<RedditPost[]> {
    const client = this.getClient();
    const query = keywords.join(" OR ");

    const results = await client.search({
      query,
      sort: "relevance",
      time: "month",
      limit,
    });

    return results.map((post: any) => ({
      title: post.title,
      selftext: post.selftext?.substring(0, 500) || "",
      score: post.score,
      numComments: post.num_comments,
      url: `https://reddit.com${post.permalink}`,
      subreddit: post.subreddit_name_prefixed,
      createdUtc: post.created_utc,
    }));
  },

  async getViralContent(subreddit: string, limit = 10): Promise<RedditPost[]> {
    const client = this.getClient();

    const results = await client.getSubreddit(subreddit).getTop({ time: "week", limit });

    return results.map((post: any) => ({
      title: post.title,
      selftext: post.selftext?.substring(0, 500) || "",
      score: post.score,
      numComments: post.num_comments,
      url: `https://reddit.com${post.permalink}`,
      subreddit: post.subreddit_name_prefixed,
      createdUtc: post.created_utc,
    }));
  },

  isConfigured(): boolean {
    return !!((env as any).REDDIT_CLIENT_ID && (env as any).REDDIT_CLIENT_SECRET);
  },
};
