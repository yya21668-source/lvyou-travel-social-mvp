import { NextResponse } from "next/server";
import { generateItinerary } from "@/lib/ai/claude";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const destination = String(body.destination ?? "").trim();
    const startDate = String(body.startDate ?? "");
    const days = Math.min(Math.max(Number(body.days) || 3, 1), 10);
    const travelType = String(body.travelType ?? "其他");
    const notes = body.notes ? String(body.notes) : undefined;

    if (!destination) {
      return NextResponse.json({ error: "目的地不能为空" }, { status: 400 });
    }

    const result = await generateItinerary({ destination, days, travelType, startDate, notes });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/ai/itinerary]", err);
    return NextResponse.json({ error: "生成失败，请重试" }, { status: 500 });
  }
}
