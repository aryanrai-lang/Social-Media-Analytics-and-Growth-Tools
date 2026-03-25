import mongoose, { Document, Schema } from "mongoose";

export interface IFetchLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  source: "meta" | "apify" | "perplexity" | "reddit";
  status: "success" | "error" | "partial";
  dataType: string;
  recordsCount: number;
  error?: string;
  duration: number;
  createdAt: Date;
}

const fetchLogSchema = new Schema<IFetchLog>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    source: { type: String, enum: ["meta", "apify", "perplexity", "reddit"], required: true },
    status: { type: String, enum: ["success", "error", "partial"], required: true },
    dataType: { type: String, required: true },
    recordsCount: { type: Number, default: 0 },
    error: { type: String },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const FetchLog = mongoose.model<IFetchLog>("FetchLog", fetchLogSchema);
