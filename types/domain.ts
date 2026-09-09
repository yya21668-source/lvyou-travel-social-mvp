export type Visibility = "public" | "friends" | "private";
export type TripStyle = "徒步" | "穷游" | "度假" | "其他";

export interface PoiItem {
  id: string;
  poi_name: string;
  type: string;
  description: string;
  suggested_time: string;
  address?: string;
  opening_hours?: string;
  phone?: string;
  image?: string;
}

export interface TripDay { date: string; title: string; items: PoiItem[] }
export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  style: TripStyle;
  visibility: Visibility;
  status: "draft" | "planned" | "active" | "completed";
  days: TripDay[];
}

export interface GuidePost {
  id: string;
  title: string;
  destination: string;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  style: TripStyle;
  recruiting: boolean;
  visibility: Visibility;
  summary: string[];
}
