import mongoose, { Document, Schema } from "mongoose";

export interface IInstagramProfile extends Document {
  workspaceId: mongoose.Types.ObjectId;
  username: string;
  isOwner: boolean;
  followers: number;
  following: number;
  postsCount: number;
  bio: string;
  profilePicUrl: string;
  engagementRate: number;
  lastFetched: Date;
}

const instagramProfileSchema = new Schema<IInstagramProfile>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    username: { type: String, required: true, trim: true, lowercase: true },
    isOwner: { type: Boolean, default: false },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    profilePicUrl: { type: String, default: "" },
    engagementRate: { type: Number, default: 0 },
    lastFetched: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

instagramProfileSchema.index({ workspaceId: 1, username: 1 }, { unique: true });

export const InstagramProfile = mongoose.model<IInstagramProfile>(
  "InstagramProfile",
  instagramProfileSchema
);
