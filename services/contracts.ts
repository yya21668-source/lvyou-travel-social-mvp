import type { GuidePost, TripPlan } from "@/types/domain";

export interface AuthService { signInWithOtp(identifier: string): Promise<void>; signInWithWechat(): Promise<void>; signOut(): Promise<void> }
export interface TripService { list(): Promise<TripPlan[]>; get(id: string): Promise<TripPlan | null>; save(trip: TripPlan): Promise<TripPlan> }
export interface PostService { listPublic(): Promise<GuidePost[]>; publish(post: Partial<GuidePost>): Promise<GuidePost> }
export interface MapService { searchPoi(keyword: string, city?: string): Promise<Array<{ id: string; name: string; address: string }>> }
