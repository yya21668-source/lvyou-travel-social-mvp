/**
 * 旅遇 核心数据类型 —— 与 Supabase 表结构一一对应
 * MVP阶段：由 lib/mock/db.ts 提供 localStorage 实现
 * V2：替换为 @supabase/supabase-js 生成类型即可，service 层签名不变
 */

export type UUID = string;
export type ISODate = string;

/** 旅行形式 */
export type TravelType = "徒步" | "穷游" | "度假" | "其他";

/** 出行方式 */
export type TripMode = "solo" | "companion";

/** 行程状态 */
export type TripStatus = "draft" | "planning" | "ongoing" | "completed";

/** 攻略可见性 */
export type Visibility = "public" | "friends" | "private";

/** 游记内容类型 */
export type PostContentType = "full" | "transport" | "spot" | "restaurant" | "mall";

/** 找搭子申请状态 */
export type MatchStatus = "pending" | "accepted" | "rejected";

/** POI 类型 */
export type PoiType =
  | "景点"
  | "餐厅"
  | "交通"
  | "住宿"
  | "商场"
  | "体验"
  | "徒步路线"
  | "其他";

/** 币种 */
export type Currency = "CNY" | "USD" | "EUR" | "JPY" | "THB" | "HKD";

/** users 表 */
export interface User {
  id: UUID;
  phone?: string;
  email?: string;
  nickname: string;
  avatar: string;
  bio: string;
  /** 实名认证状态 —— MVP阶段mock，V2需接入真实身份认证服务 */
  verified: boolean;
  followers: number;
  following: number;
  created_at: string;
}

/** trip_plans 表 */
export interface TripPlan {
  id: UUID;
  owner_id: UUID;
  destination: string;
  start_date: ISODate;
  end_date: ISODate;
  travel_type: TravelType;
  mode: TripMode;
  visibility: Visibility;
  status: TripStatus;
  notes?: string;
  cover: string;
  created_at: string;
}

/** poi_items 表 */
export interface PoiItem {
  id: UUID;
  trip_plan_id: UUID;
  day_index: number;
  sort_order: number;
  poi_name: string;
  type: PoiType;
  description: string;
  suggested_time: string;
  address?: string;
  phone?: string;
  opening_hours?: string;
  external_url?: string;
  rating?: number;
  is_key_point?: boolean;
}

/** groups 表 */
export interface Group {
  id: UUID;
  trip_plan_id: UUID;
  name: string;
  members: UUID[];
  created_at: string;
}

/** chat_messages（groups 的消息子表，Realtime 订阅目标） */
export interface ChatMessage {
  id: UUID;
  group_id: UUID;
  sender_id: UUID;
  content: string;
  created_at: string;
}

/** expenses 表 */
export interface Expense {
  id: UUID;
  group_id: UUID;
  payer_id: UUID;
  title: string;
  amount: number;
  currency: Currency;
  /** 分摊成员 */
  split_members: UUID[];
  note?: string;
  created_at: string;
}

/** posts 表 */
export interface Post {
  id: UUID;
  author_id: UUID;
  trip_plan_id?: UUID;
  title: string;
  cover: string;
  content_type: PostContentType;
  markdown: string;
  /** AI生成的3-5条要点摘要，用于卡片预览 */
  summary: string[];
  destination: string;
  travel_type: TravelType;
  visibility: Visibility;
  likes: number;
  created_at: string;
}

/** match_applications 表 —— 找搭子申请 */
export interface MatchApplication {
  id: UUID;
  trip_plan_id: UUID;
  /** 申请加入者 */
  applicant_id: UUID;
  /** 行程所有者是否已同意 */
  owner_approved: boolean;
  /** 申请者是否已最终确认（双方确认机制） */
  applicant_confirmed: boolean;
  status: MatchStatus;
  message?: string;
  created_at: string;
}

/** reviews 表 —— 对用户或场所的评价 */
export interface Review {
  id: UUID;
  author_id: UUID;
  target_type: "user" | "poi";
  target_id: UUID;
  rating: number;
  content: string;
  created_at: string;
}

/** AI 行程生成的结构化输出 */
export interface AiItineraryItem {
  poi_name: string;
  type: PoiType;
  description: string;
  suggested_time: string;
}
export interface AiItineraryDay {
  day: number;
  items: AiItineraryItem[];
}
export interface AiItineraryResult {
  days: AiItineraryDay[];
  source: "claude" | "mock";
}

/** 结算视图：每人应付/应收 */
export interface SettlementEntry {
  user_id: UUID;
  /** 已付金额（折合CNY） */
  paid: number;
  /** 应摊金额（折合CNY） */
  share: number;
  /** >0 应收，<0 应付 */
  net: number;
}
