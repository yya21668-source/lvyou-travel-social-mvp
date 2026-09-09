import Anthropic from "@anthropic-ai/sdk";
import { itinerarySystemPrompt } from "@/lib/ai/prompts";
import { parseAiJson } from "@/lib/ai/schemas";
import { demoTrip } from "@/mocks/data";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const input = await request.json().catch(() => ({}));
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ ...demoTrip, source: "mock", notice: "ANTHROPIC_API_KEY 未配置，已返回演示行程" });
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({ model: "claude-3-5-sonnet-latest", max_tokens: 3000, temperature: .5, system: itinerarySystemPrompt, messages: [{ role: "user", content: `目的地：${input.destination || "大理"}\n时间：${input.startDate || "待定"} 至 ${input.endDate || "待定"}\n旅行形式：${input.style || "其他"}\n补充：${input.notes || "无"}` }] });
    const text = message.content.find(block => block.type === "text"); if (!text || text.type !== "text") throw new Error("empty response");
    return NextResponse.json({ ...parseAiJson(text.text), source: "claude" });
  } catch (error) { return NextResponse.json({ error: "AI 行程生成失败", detail: error instanceof Error ? error.message : "unknown" }, { status: 502 }); }
}
