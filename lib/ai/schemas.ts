import { z } from "zod";

export const itinerarySchema = z.object({ days: z.array(z.object({ date: z.string(), title: z.string().default("今日漫游"), items: z.array(z.object({ poi_name: z.string(), type: z.string(), description: z.string(), suggested_time: z.string() })) })).min(1) });
export type GeneratedItinerary = z.infer<typeof itinerarySchema>;

export function parseAiJson(text: string): GeneratedItinerary {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try { return itinerarySchema.parse(JSON.parse(cleaned)); } catch {
    const start = cleaned.indexOf("{"); const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("AI response does not contain a JSON object");
    return itinerarySchema.parse(JSON.parse(cleaned.slice(start, end + 1)));
  }
}
