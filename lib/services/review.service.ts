/**
 * 评价服务（reviews 表：对用户或场所的评价）
 */
import { getDb } from "@/lib/mock/db";
import type { Review } from "@/types";

export const reviewService = {
  getReviewsFor(targetType: Review["target_type"], targetId: string): Review[] {
    return getDb()
      .reviews.filter((r) => r.target_type === targetType && r.target_id === targetId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
};
