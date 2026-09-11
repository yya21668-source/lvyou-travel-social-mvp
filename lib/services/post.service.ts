/**
 * 攻略/游记服务（posts 表）
 * V2：替换为 supabase.from('posts')...
 */
import { getDb, mutate, uid } from "@/lib/mock/db";
import type { Post, UUID, Visibility } from "@/types";

export const postService = {
  getPost(id: UUID): Post | null {
    return getDb().posts.find((p) => p.id === id) ?? null;
  },

  /** 发现页feed：公开攻略（MVP简化：好友可见也展示，V2按关注关系过滤） */
  getPublicFeed(): Post[] {
    return getDb()
      .posts.filter((p) => p.visibility !== "private")
      .sort((a, b) => b.likes - a.likes);
  },

  /** 社区广场：支持筛选 */
  getSquareFeed(filter: { destination?: string; travelType?: string; recruiting?: boolean }): Post[] {
    let list = getDb().posts.filter((p) => p.visibility === "public");
    if (filter.destination) list = list.filter((p) => p.destination === filter.destination);
    if (filter.travelType) list = list.filter((p) => p.travel_type === filter.travelType);
    if (filter.recruiting) {
      const db = getDb();
      const recruitingTripIds = db.trip_plans
        .filter((t) => t.mode === "companion" && t.status === "planning")
        .map((t) => t.id);
      list = list.filter((p) => p.trip_plan_id && recruitingTripIds.includes(p.trip_plan_id));
    }
    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  getPostsByAuthor(authorId: UUID): Post[] {
    return getDb().posts.filter((p) => p.author_id === authorId);
  },

  createPost(input: {
    authorId: UUID;
    tripPlanId?: UUID;
    title: string;
    cover: string;
    contentType: Post["content_type"];
    markdown: string;
    summary: string[];
    destination: string;
    travelType: Post["travel_type"];
    visibility: Visibility;
  }): Post {
    return mutate((db) => {
      const post: Post = {
        id: uid("post"),
        author_id: input.authorId,
        trip_plan_id: input.tripPlanId,
        title: input.title,
        cover: input.cover,
        content_type: input.contentType,
        markdown: input.markdown,
        summary: input.summary,
        destination: input.destination,
        travel_type: input.travelType,
        visibility: input.visibility,
        likes: 0,
        created_at: new Date().toISOString(),
      };
      db.posts.unshift(post);
      return post;
    });
  },

  likePost(id: UUID) {
    mutate((db) => {
      const p = db.posts.find((x) => x.id === id);
      if (p) p.likes += 1;
    });
  },
};
