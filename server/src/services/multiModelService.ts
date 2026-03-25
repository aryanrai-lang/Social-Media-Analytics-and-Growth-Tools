import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { env } from "../config/env";

export type AiModelType = "gemini" | "claude" | "openai";

interface GenerateOptions {
  model: AiModelType;
  apiKey?: string; // user-provided key (for claude/openai)
  prompt: string;
}

async function generateWithGemini(prompt: string, apiKey?: string): Promise<string> {
  const key = apiKey || env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini API key not configured");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithClaude(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("Claude API key not provided. Add your key in Settings.");
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("OpenAI API key not provided. Add your key in Settings.");
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content || "";
}

export async function generateContent(options: GenerateOptions): Promise<string> {
  switch (options.model) {
    case "claude":
      return generateWithClaude(options.prompt, options.apiKey!);
    case "openai":
      return generateWithOpenAI(options.prompt, options.apiKey!);
    case "gemini":
    default:
      return generateWithGemini(options.prompt, options.apiKey);
  }
}

export function getModelDisplayName(model: AiModelType): string {
  switch (model) {
    case "gemini": return "gemini-2.5-flash";
    case "claude": return "claude-sonnet-4-20250514";
    case "openai": return "gpt-4o-mini";
  }
}
