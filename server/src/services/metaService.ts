import axios from "axios";
import { env } from "../config/env";

interface MetaProfile {
  id: string;
  username: string;
  name: string;
  biography: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string;
}

interface MetaPost {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  permalink: string;
}

const META_BASE_URL = "https://graph.instagram.com";

export const metaService = {
  async fetchProfile(businessId: string, accessToken: string): Promise<MetaProfile> {
    const { data } = await axios.get(`${META_BASE_URL}/${businessId}`, {
      params: {
        fields: "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url",
        access_token: accessToken,
      },
    });
    return data;
  },

  async fetchPosts(
    businessId: string,
    accessToken: string,
    limit = 25
  ): Promise<MetaPost[]> {
    const { data } = await axios.get(`${META_BASE_URL}/${businessId}/media`, {
      params: {
        fields: "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink",
        limit,
        access_token: accessToken,
      },
    });
    return data.data || [];
  },

  async fetchInsights(
    businessId: string,
    accessToken: string
  ): Promise<Record<string, any>> {
    const { data } = await axios.get(`${META_BASE_URL}/${businessId}/insights`, {
      params: {
        metric: "impressions,reach,profile_views",
        period: "day",
        access_token: accessToken,
      },
    });
    return data.data || [];
  },

  isConfigured(): boolean {
    return !!(env as any).META_ACCESS_TOKEN;
  },
};
