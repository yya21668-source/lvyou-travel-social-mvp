/**
 * 找搭子申请服务（match_applications 表）
 * 安全信任机制 —— 双方确认状态机：
 *   pending(owner_approved=false)  申请已提交，等待行程所有者审核
 *   pending(owner_approved=true, applicant_confirmed=false)  所有者已同意，等待申请者最终确认
 *   accepted  双方均确认 → 自动加入小组
 *   rejected  任一方拒绝
 * V2：真实场景为两条确认记录，此处以两个布尔字段等价实现
 */
import { getDb, mutate, uid } from "@/lib/mock/db";
import { groupService } from "./group.service";
import type { MatchApplication, UUID } from "@/types";

export const matchService = {
  /** 我收到的申请（我是行程所有者） */
  getIncomingApplications(userId: UUID): MatchApplication[] {
    const db = getDb();
    return db.match_applications.filter((ma) => {
      const trip = db.trip_plans.find((t) => t.id === ma.trip_plan_id);
      return trip?.owner_id === userId && ma.status === "pending";
    });
  },

  /** 我发出的申请 */
  getOutgoingApplications(userId: UUID): MatchApplication[] {
    return getDb().match_applications.filter((ma) => ma.applicant_id === userId && ma.status === "pending");
  },

  applyToTrip(tripPlanId: UUID, applicantId: UUID, message?: string) {
    return mutate((db) => {
      const existing = db.match_applications.find(
        (m) => m.trip_plan_id === tripPlanId && m.applicant_id === applicantId
      );
      if (existing) return existing;
      const ma: MatchApplication = {
        id: uid("ma"),
        trip_plan_id: tripPlanId,
        applicant_id: applicantId,
        owner_approved: false,
        applicant_confirmed: false,
        status: "pending",
        message,
        created_at: new Date().toISOString(),
      };
      db.match_applications.push(ma);
      return ma;
    });
  },

  /** 行程所有者同意申请 */
  ownerApprove(applicationId: UUID) {
    mutate((db) => {
      const ma = db.match_applications.find((m) => m.id === applicationId);
      if (ma && ma.status === "pending") ma.owner_approved = true;
    });
  },

  reject(applicationId: UUID) {
    mutate((db) => {
      const ma = db.match_applications.find((m) => m.id === applicationId);
      if (ma) ma.status = "rejected";
    });
  },

  /** 申请者最终确认（双方确认机制的最后一环）→ 自动入组 */
  applicantConfirm(applicationId: UUID) {
    mutate((db) => {
      const ma = db.match_applications.find((m) => m.id === applicationId);
      if (!ma || ma.status !== "pending" || !ma.owner_approved) return;
      ma.applicant_confirmed = true;
      ma.status = "accepted";
      const trip = db.trip_plans.find((t) => t.id === ma.trip_plan_id);
      if (trip) {
        let group = db.groups.find((g) => g.trip_plan_id === trip.id);
        if (!group) {
          group = {
            id: uid("g"),
            trip_plan_id: trip.id,
            name: `${trip.destination}同行小队`,
            members: [trip.owner_id],
            created_at: new Date().toISOString(),
          };
          db.groups.push(group);
        }
        if (!group.members.includes(ma.applicant_id)) group.members.push(ma.applicant_id);
      }
    });
  },
};

export { groupService };
