import { NextResponse } from "next/server";
import { generateRecap } from "@/lib/ai/claude";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateRecap({
      destination: String(body.destination ?? ""),
      travelType: String(body.travelType ?? "其他"),
      poiNames: Array.isArray(body.poiNames) ? body.poiNames.map(String) : [],
      expenseLines: Array.isArray(body.expenseLines) ? body.expenseLines.map(String) : [],
      userNotes: String(body.userNotes ?? ""),
      category: body.category ? String(body.category) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/ai/recap]", err);
    return NextResponse.json({ error: "游记生成失败，请重试" }, { status: 500 });
  }
}
