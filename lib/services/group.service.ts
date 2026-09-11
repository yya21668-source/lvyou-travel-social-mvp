/**
 * 小组服务（groups 表）
 * 安全机制：入组必须经过 match.service 的「双方确认」流程，禁止单向直接拉群
 */
import { getDb, mutate, uid } from "@/lib/mock/db";
import type { Group, UUID } from "@/types";

export const groupService = {
  getGroupByTrip(tripPlanId: UUID): Group | null {
    return getDb().groups.find((g) => g.trip_plan_id === tripPlanId) ?? null;
  },

  getGroup(id: UUID): Group | null {
    return getDb().groups.find((g) => g.id === id) ?? null;
  },

  getMyGroups(userId: UUID): Group[] {
    return getDb().groups.filter((g) => g.members.includes(userId));
  },

  /** 当前用户参与的搭子小组（排除 Solo 个人记账小组） */
  getCompanionGroups(userId: UUID): Group[] {
    const db = getDb();
    return db.groups.filter((group) => {
      if (!group.members.includes(userId)) return false;
      const trip = db.trip_plans.find((item) => item.id === group.trip_plan_id);
      return trip?.mode === "companion";
    });
  },

  /** Solo模式：仅为自己创建小组（用于记账/回顾） */
  createSoloGroup(tripPlanId: UUID, ownerId: UUID, tripName: string): Group {
    return mutate((db) => {
      const existing = db.groups.find((g) => g.trip_plan_id === tripPlanId);
      if (existing) return existing;
      const group: Group = {
        id: uid("g"),
        trip_plan_id: tripPlanId,
        name: `${tripName}·独行之旅`,
        members: [ownerId],
        created_at: new Date().toISOString(),
      };
      db.groups.push(group);
      return group;
    });
  },

  /** 双方确认完成后，由 matchService 调用将成员加入小组 */
  addMember(groupId: UUID, userId: UUID) {
    mutate((db) => {
      const g = db.groups.find((x) => x.id === groupId);
      if (g && !g.members.includes(userId)) g.members.push(userId);
    });
  },
};
