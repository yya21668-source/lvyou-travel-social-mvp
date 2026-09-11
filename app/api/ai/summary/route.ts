import { NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai/claude";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const markdown = String(body.markdown ?? "");
    if (!markdown.trim()) {
      return NextResponse.json({ error: "内容为空" }, { status: 400 });
    }
    const result = await generateSummary(markdown);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/ai/summary]", err);
    return NextResponse.json({ error: "摘要生成失败" }, { status: 500 });
  }
}
