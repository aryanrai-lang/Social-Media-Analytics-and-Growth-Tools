import mongoose, { Document, Schema } from "mongoose";

export interface IInstagramPost extends Document {
  profileId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  postId: string;
  type: "image" | "video" | "carousel" | "reel";
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  timestamp: Date;
  url: string;
  thumbnailUrl: string;
  lastFetched: Date;
}

const instagramPostSchema = new Schema<IInstagramPost>(
  {
    profileId: { type: Schema.Types.ObjectId, ref: "InstagramProfile", required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    postId: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "carousel", "reel"], default: "image" },
    caption: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    timestamp: { type: Date },
    url: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    lastFetched: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

instagramPostSchema.index({ workspaceId: 1, postId: 1 }, { unique: true });

export const InstagramPost = mongoose.model<IInstagramPost>(
  "InstagramPost",
  instagramPostSchema
);
