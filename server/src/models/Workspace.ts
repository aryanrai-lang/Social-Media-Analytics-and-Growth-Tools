import mongoose, { Document, Schema } from "mongoose";

export interface ICompetitor {
  username: string;
  businessId?: string;
}

export interface IWorkspace extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  instagramUsername: string;
  instagramBusinessId?: string;
  competitors: ICompetitor[];
  createdAt: Date;
  updatedAt: Date;
}

const competitorSchema = new Schema<ICompetitor>(
  {
    username: { type: String, required: true, trim: true, lowercase: true },
    businessId: { type: String },
  },
  { _id: false }
);

const workspaceSchema = new Schema<IWorkspace>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    instagramUsername: { type: String, required: true, trim: true, lowercase: true },
    instagramBusinessId: { type: String },
    competitors: {
      type: [competitorSchema],
      validate: {
        validator: (v: ICompetitor[]) => v.length <= 20,
        message: "Maximum 20 competitors allowed",
      },
    },
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);
