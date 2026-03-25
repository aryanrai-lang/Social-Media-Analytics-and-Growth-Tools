import mongoose, { Document, Schema } from "mongoose";

export interface IAnalytics extends Document {
  workspaceId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;
  metrics: {
    engagementRate: number;
    postingFrequency: number;
    followerGrowth: number;
    avgLikes: number;
    avgComments: number;
    bestTimes: string[];
    contentMix: Record<string, number>;
  };
  generatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    profileId: { type: Schema.Types.ObjectId, ref: "InstagramProfile", required: true },
    metrics: {
      engagementRate: { type: Number, default: 0 },
      postingFrequency: { type: Number, default: 0 },
      followerGrowth: { type: Number, default: 0 },
      avgLikes: { type: Number, default: 0 },
      avgComments: { type: Number, default: 0 },
      bestTimes: [{ type: String }],
      contentMix: { type: Schema.Types.Mixed, default: {} },
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Analytics = mongoose.model<IAnalytics>("Analytics", analyticsSchema);
