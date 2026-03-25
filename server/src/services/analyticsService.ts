import { IInstagramPost } from "../models/InstagramPost";
import { IInstagramProfile } from "../models/InstagramProfile";

export interface ProfileAnalytics {
  engagementRate: number;
  postingFrequency: number;
  avgLikes: number;
  avgComments: number;
  bestTimes: string[];
  contentMix: Record<string, number>;
  topPosts: { postId: string; engagement: number; type: string }[];
}

export interface CompetitorComparison {
  username: string;
  followers: number;
  engagementRate: number;
  postingFrequency: number;
  avgLikes: number;
  avgComments: number;
}

export interface GapItem {
  metric: string;
  ownerValue: number;
  benchmarkValue: number;
  diff: number;
  diffPercent: number;
  status: "behind" | "ahead" | "on_par";
}

export const analyticsService = {
  calculateEngagementRate(profile: IInstagramProfile, posts: IInstagramPost[]): number {
    if (!profile.followers || !posts.length) return 0;
    const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments, 0);
    return (totalEngagement / posts.length / profile.followers) * 100;
  },

  calculatePostingFrequency(posts: IInstagramPost[]): number {
    if (posts.length < 2) return posts.length;
    const sorted = [...posts].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const firstDate = new Date(sorted[0].timestamp).getTime();
    const lastDate = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const weeks = (lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000);
    return weeks > 0 ? posts.length / weeks : posts.length;
  },

  calculateBestPostingTimes(posts: IInstagramPost[]): string[] {
    const hourMap: Record<number, number> = {};
    posts.forEach((p) => {
      if (!p.timestamp) return;
      const hour = new Date(p.timestamp).getUTCHours();
      const engagement = p.likes + p.comments;
      hourMap[hour] = (hourMap[hour] || 0) + engagement;
    });

    return Object.entries(hourMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00 UTC`);
  },

  calculateContentMix(posts: IInstagramPost[]): Record<string, number> {
    const mix: Record<string, number> = {};
    posts.forEach((p) => {
      mix[p.type] = (mix[p.type] || 0) + 1;
    });
    // Convert to percentages
    const total = posts.length || 1;
    for (const key of Object.keys(mix)) {
      mix[key] = Math.round((mix[key] / total) * 100);
    }
    return mix;
  },

  getTopPerformingPosts(
    posts: IInstagramPost[],
    limit = 5
  ): { postId: string; engagement: number; type: string }[] {
    return [...posts]
      .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
      .slice(0, limit)
      .map((p) => ({
        postId: p.postId,
        engagement: p.likes + p.comments,
        type: p.type,
      }));
  },

  computeProfileAnalytics(
    profile: IInstagramProfile,
    posts: IInstagramPost[]
  ): ProfileAnalytics {
    return {
      engagementRate: this.calculateEngagementRate(profile, posts),
      postingFrequency: this.calculatePostingFrequency(posts),
      avgLikes: posts.length ? posts.reduce((s, p) => s + p.likes, 0) / posts.length : 0,
      avgComments: posts.length ? posts.reduce((s, p) => s + p.comments, 0) / posts.length : 0,
      bestTimes: this.calculateBestPostingTimes(posts),
      contentMix: this.calculateContentMix(posts),
      topPosts: this.getTopPerformingPosts(posts),
    };
  },

  compareProfiles(
    ownerAnalytics: ProfileAnalytics,
    owner: IInstagramProfile,
    competitors: { profile: IInstagramProfile; analytics: ProfileAnalytics }[]
  ): CompetitorComparison[] {
    const all = [
      {
        username: owner.username,
        followers: owner.followers,
        ...ownerAnalytics,
      },
      ...competitors.map((c) => ({
        username: c.profile.username,
        followers: c.profile.followers,
        ...c.analytics,
      })),
    ];
    return all.map((p) => ({
      username: p.username,
      followers: p.followers,
      engagementRate: Math.round(p.engagementRate * 100) / 100,
      postingFrequency: Math.round(p.postingFrequency * 100) / 100,
      avgLikes: Math.round(p.avgLikes),
      avgComments: Math.round(p.avgComments),
    }));
  },

  findGaps(
    ownerAnalytics: ProfileAnalytics,
    competitorAnalyticsList: ProfileAnalytics[]
  ): GapItem[] {
    if (!competitorAnalyticsList.length) return [];

    const benchmarks = {
      engagementRate:
        competitorAnalyticsList.reduce((s, c) => s + c.engagementRate, 0) /
        competitorAnalyticsList.length,
      postingFrequency:
        competitorAnalyticsList.reduce((s, c) => s + c.postingFrequency, 0) /
        competitorAnalyticsList.length,
      avgLikes:
        competitorAnalyticsList.reduce((s, c) => s + c.avgLikes, 0) /
        competitorAnalyticsList.length,
      avgComments:
        competitorAnalyticsList.reduce((s, c) => s + c.avgComments, 0) /
        competitorAnalyticsList.length,
    };

    const metrics: { metric: string; ownerVal: number; benchVal: number }[] = [
      { metric: "Engagement Rate", ownerVal: ownerAnalytics.engagementRate, benchVal: benchmarks.engagementRate },
      { metric: "Posting Frequency", ownerVal: ownerAnalytics.postingFrequency, benchVal: benchmarks.postingFrequency },
      { metric: "Average Likes", ownerVal: ownerAnalytics.avgLikes, benchVal: benchmarks.avgLikes },
      { metric: "Average Comments", ownerVal: ownerAnalytics.avgComments, benchVal: benchmarks.avgComments },
    ];

    return metrics.map(({ metric, ownerVal, benchVal }) => {
      const diff = ownerVal - benchVal;
      const diffPercent = benchVal > 0 ? (diff / benchVal) * 100 : 0;
      return {
        metric,
        ownerValue: Math.round(ownerVal * 100) / 100,
        benchmarkValue: Math.round(benchVal * 100) / 100,
        diff: Math.round(diff * 100) / 100,
        diffPercent: Math.round(diffPercent * 100) / 100,
        status: diffPercent > 5 ? "ahead" : diffPercent < -5 ? "behind" : "on_par",
      };
    });
  },
};
