/**
 * 行程与POI服务（trip_plans / poi_items 表）
 * V2：替换为 supabase.from('trip_plans')...，函数签名不变
 */
import { getDb, mutate, uid } from "@/lib/mock/db";
import type { AiItineraryDay, PoiItem, TripPlan, UUID } from "@/types";

const COVER_POOL = [
  "photo-1508804185872-d7badad00f7d",
  "photo-1476514525535-07fb3b4ae5f1",
  "photo-1537531383499-e772f042f422",
  "photo-1506905925346-21bda4d32df4",
  "photo-1524850011238-e3d235c7d4c9",
  "photo-1523906834658-6e24ef2386f9",
];

export function coverFor(destination: string): string {
  let h = 0;
  for (const c of destination) h = (h * 31 + c.charCodeAt(0)) % 997;
  const id = COVER_POOL[h % COVER_POOL.length];
  return `https://images.unsplash.com/${id}?q=80&w=900&auto=format&fit=crop`;
}

export const tripService = {
  getTrip(id: UUID): TripPlan | null {
    return getDb().trip_plans.find((t) => t.id === id) ?? null;
  },

  getMyTrips(userId: UUID): TripPlan[] {
    return getDb().trip_plans.filter((t) => t.owner_id === userId);
  },

  /** 广场：所有公开且招募搭子的行程 */
  getRecruitingTrips(excludeOwnerId: UUID): TripPlan[] {
    return getDb().trip_plans.filter(
      (t) => t.visibility === "public" && t.mode === "companion" && t.status === "planning" && t.owner_id !== excludeOwnerId
    );
  },

  /** 用AI生成结果创建行程 + POI */
  createTripFromAi(
    ownerId: UUID,
    input: { destination: string; startDate: string; endDate: string; travelType: TripPlan["travel_type"]; notes?: string },
    aiDays: AiItineraryDay[]
  ): TripPlan {
    const tripId = uid("t");
    return mutate((db) => {
      const trip: TripPlan = {
        id: tripId,
        owner_id: ownerId,
        destination: input.destination,
        start_date: input.startDate,
        end_date: input.endDate,
        travel_type: input.travelType,
        mode: "solo",
        visibility: "private",
        status: "planning",
        notes: input.notes,
        cover: coverFor(input.destination),
        created_at: new Date().toISOString(),
      };
      db.trip_plans.push(trip);
      aiDays.forEach((d) => {
        d.items.forEach((item, i) => {
          db.poi_items.push({
            id: uid("poi"),
            trip_plan_id: tripId,
            day_index: d.day,
            sort_order: i + 1,
            poi_name: item.poi_name,
            type: item.type,
            description: item.description,
            suggested_time: item.suggested_time,
            rating: 4 + Math.random() * 0.9,
            is_key_point: item.type === "交通" && /航班|返程|登机|火车/.test(item.poi_name),
          });
        });
      });
      return trip;
    });
  },

  updateTrip(id: UUID, patch: Partial<TripPlan>) {
    mutate((db) => {
      const t = db.trip_plans.find((x) => x.id === id);
      if (t) Object.assign(t, patch);
    });
  },

  deleteTrip(id: UUID) {
    mutate((db) => {
      db.trip_plans = db.trip_plans.filter((t) => t.id !== id);
      db.poi_items = db.poi_items.filter((p) => p.trip_plan_id !== id);
      db.groups = db.groups.filter((g) => g.trip_plan_id !== id);
    });
  },

  getPois(tripPlanId: UUID): PoiItem[] {
    return getDb()
      .poi_items.filter((p) => p.trip_plan_id === tripPlanId)
      .sort((a, b) => a.day_index - b.day_index || a.sort_order - b.sort_order);
  },

  getPoi(id: UUID): PoiItem | null {
    return getDb().poi_items.find((p) => p.id === id) ?? null;
  },

  updatePoi(id: UUID, patch: Partial<PoiItem>) {
    mutate((db) => {
      const p = db.poi_items.find((x) => x.id === id);
      if (p) Object.assign(p, patch);
    });
  },

  deletePoi(id: UUID) {
    mutate((db) => {
      db.poi_items = db.poi_items.filter((p) => p.id !== id);
    });
  },

  /** 单项重新生成：替换某个POI（AI能力在 api 层，此处只落库） */
  replacePoi(id: UUID, newItem: PoiItem) {
    mutate((db) => {
      const idx = db.poi_items.findIndex((p) => p.id === id);
      if (idx >= 0) db.poi_items[idx] = { ...newItem, id };
    });
  },

  /** 添加到清单：把任意POI加入我的某个行程 */
  addPoiToTrip(tripPlanId: UUID, poi: Partial<PoiItem>) {
    return mutate((db) => {
      const existing = db.poi_items.filter((p) => p.trip_plan_id === tripPlanId);
      const day = existing.length ? Math.max(...existing.map((p) => p.day_index)) : 1;
      const sameDay = existing.filter((p) => p.day_index === day);
      const item: PoiItem = {
        id: uid("poi"),
        trip_plan_id: tripPlanId,
        day_index: day,
        sort_order: sameDay.length + 1,
        poi_name: poi.poi_name ?? "未命名地点",
        type: poi.type ?? "其他",
        description: poi.description ?? "",
        suggested_time: poi.suggested_time ?? "随时",
        address: poi.address,
        phone: poi.phone,
        opening_hours: poi.opening_hours,
        external_url: poi.external_url,
        rating: poi.rating,
      };
      db.poi_items.push(item);
      return item;
    });
  },
};
