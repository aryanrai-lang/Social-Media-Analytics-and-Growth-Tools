import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // Data sources
  META_APP_ID: process.env.META_APP_ID || "",
  META_APP_SECRET: process.env.META_APP_SECRET || "",
  META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || "",
  APIFY_API_TOKEN: process.env.APIFY_API_TOKEN || "",

  // AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  // Supporting sources
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || "",
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID || "",
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET || "",
  REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT || "social-media-analytics/1.0",
};
