/**
 * Claude API 调用层（服务端）
 * - 有 ANTHROPIC_API_KEY 时走真实 Claude API
 * - 无 key 时优雅降级到本地 mock 生成器（source 字段标注来源）
 * - JSON解析三重容错：剥markdown围栏 → JSON.parse → 字段校验+默认值
 */
import { generateMockItinerary, generateMockRecap, generateMockSummary } from "./mock-generator";
import { ITINERARY_SYSTEM_PROMPT, ITINERARY_USER_PROMPT, RECAP_SYSTEM_PROMPT, RECAP_USER_PROMPT, SUMMARY_SYSTEM_PROMPT } from "./prompts";
import type { AiItineraryDay, AiItineraryResult, PoiType } from "@/types";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const VALID_TYPES: PoiType[] = ["景点", "餐厅", "交通", "住宿", "商场", "体验", "徒步路线", "其他"];

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function callClaude(system: string, user: string, maxTokens = 4096): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Claude API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return (data.content?.[0]?.text ?? "") as string;
}

/** 剥掉 ```json 围栏等噪声 */
function stripFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  // 截取第一个 { 或 [ 到最后一个 } 或 ]
  const first = Math.min(
    ...["{", "["].map((c) => raw.indexOf(c)).filter((i) => i >= 0)
  );
  const last = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
  if (!isFinite(first) || last < 0) return raw;
  return raw.slice(first, last + 1);
}

/** 字段校验 + 默认值兜底 */
function sanitizeItinerary(days: unknown): AiItineraryDay[] {
  if (!Array.isArray(days)) throw new Error("days不是数组");
  const result: AiItineraryDay[] = [];
  days.forEach((d: { day?: unknown; items?: unknown }, di) => {
    const day = typeof d?.day === "number" ? d.day : di + 1;
    const items = Array.isArray(d?.items) ? (d.items as Record<string, unknown>[]) : [];
    const validItems = items
      .filter((it) => it && typeof it.poi_name === "string" && it.poi_name.trim())
      .map((it) => ({
        poi_name: String(it.poi_name).slice(0, 50),
        type: (VALID_TYPES.includes(it.type as PoiType) ? it.type : "其他") as PoiType,
        description: typeof it.description === "string" ? it.description : "",
        suggested_time: /^\d{1,2}:\d{2}$/.test(String(it.suggested_time)) ? String(it.suggested_time) : "10:00",
      }));
    if (validItems.length) result.push({ day, items: validItems });
  });
  if (!result.length) throw new Error("无有效行程项");
  return result;
}

/** 行程生成入口（API路由调用） */
export async function generateItinerary(input: {
  destination: string;
  days: number;
  travelType: string;
  startDate: string;
  notes?: string;
}): Promise<AiItineraryResult> {
  if (!hasApiKey()) {
    // 优雅降级：本地mock生成
    return { days: generateMockItinerary(input), source: "mock" };
  }
  const user = ITINERARY_USER_PROMPT(input);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callClaude(ITINERARY_SYSTEM_PROMPT, user, 4096);
      const parsed = JSON.parse(stripFences(text));
      return { days: sanitizeItinerary(parsed.days), source: "claude" };
    } catch (err) {
      if (attempt === 1) {
        console.error("[ai] itinerary 解析失败，降级mock:", err);
        return { days: generateMockItinerary(input), source: "mock" };
      }
    }
  }
  return { days: generateMockItinerary(input), source: "mock" };
}

/** 游后游记生成（Markdown输出，无需JSON解析） */
export async function generateRecap(ctx: {
  destination: string;
  travelType: string;
  poiNames: string[];
  expenseLines: string[];
  userNotes: string;
  category?: string;
}): Promise<{ markdown: string; source: "claude" | "mock" }> {
  if (!hasApiKey()) {
    return { markdown: generateMockRecap(ctx), source: "mock" };
  }
  try {
    const user = RECAP_USER_PROMPT({
      ...ctx,
      poiList: ctx.poiNames.map((n, i) => `${i + 1}. ${n}`).join("\n") || "（未记录）",
      expenseSummary: ctx.expenseLines.join("\n") || "（未记账）",
    });
    const markdown = await callClaude(RECAP_SYSTEM_PROMPT, user, 4096);
    return { markdown, source: "claude" };
  } catch (err) {
    console.error("[ai] recap 失败，降级mock:", err);
    return { markdown: generateMockRecap(ctx), source: "mock" };
  }
}

/** 攻略要点摘要（3-5条，JSON数组输出） */
export async function generateSummary(markdown: string): Promise<{ summary: string[]; source: "claude" | "mock" }> {
  if (!hasApiKey()) {
    return { summary: generateMockSummary(markdown), source: "mock" };
  }
  try {
    const text = await callClaude(SUMMARY_SYSTEM_PROMPT, `游记内容：\n${markdown.slice(0, 6000)}`, 512);
    const arr = JSON.parse(stripFences(text));
    const summary = (Array.isArray(arr) ? arr : [])
      .filter((s: unknown) => typeof s === "string")
      .map((s: string) => s.slice(0, 24))
      .slice(0, 5);
    if (!summary.length) throw new Error("空摘要");
    return { summary, source: "claude" };
  } catch (err) {
    console.error("[ai] summary 失败，降级mock:", err);
    return { summary: generateMockSummary(markdown), source: "mock" };
  }
}
