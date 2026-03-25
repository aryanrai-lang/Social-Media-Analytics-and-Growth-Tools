import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserApiKeys {
  claudeKey?: string;
  openaiKey?: string;
  perplexityKey?: string;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  avatar?: string;
  apiKeys?: IUserApiKeys;
  preferredAiModel?: "gemini" | "claude" | "openai";
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  name: { type: String, required: true, trim: true },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  apiKeys: {
    claudeKey: { type: String, select: false },
    openaiKey: { type: String, select: false },
    perplexityKey: { type: String, select: false },
  },
  preferredAiModel: { type: String, enum: ["gemini", "claude", "openai"], default: "gemini" },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
