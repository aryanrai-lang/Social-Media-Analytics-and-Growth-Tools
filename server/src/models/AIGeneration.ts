import mongoose, { Document, Schema } from "mongoose";

export interface IAIGeneration extends Document {
  workspaceId: mongoose.Types.ObjectId;
  type: "gap_analysis" | "content_plan" | "growth_strategy" | "content_ideas";
  input: Record<string, any>;
  output: Record<string, any>;
  aiModel: string;
  createdAt: Date;
}

const aiGenerationSchema = new Schema<IAIGeneration>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    type: {
      type: String,
      enum: ["gap_analysis", "content_plan", "growth_strategy", "content_ideas"],
      required: true,
    },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
    aiModel: { type: String, required: true },
  },
  { timestamps: true }
);

export const AIGeneration = mongoose.model<IAIGeneration>(
  "AIGeneration",
  aiGenerationSchema
);
