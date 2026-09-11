"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import { Avatar, VerifiedBadge } from "@/components/ui/Badges";
import { FadeIn } from "@/components/ui/Common";
import { useToast } from "@/components/ui/Toast";
import { authService } from "@/lib/services/auth.service";
import { tripService } from "@/lib/services/trip.service";
import { groupService } from "@/lib/services/group.service";
import { matchService } from "@/lib/services/match.service";
import { getDb } from "@/lib/mock/db";
import type { MatchApplication, TripPlan, User } from "@/types";

/**
 * 搭子选择页：Solo / 找搭子 二选一
 * 安全机制：找搭子需「所有者同意 + 申请者确认」双方确认后才能入组
 */
export default function CompanionsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [incoming, setIncoming] = useState<MatchApplication[]>([]);
  const [outgoing, setOutgoing] = useState<MatchApplication[]>([]);
  const [recruiting, setRecruiting] = useState<TripPlan[]>([]);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [confirmApp, setConfirmApp] = useState<MatchApplication | null>(null);

  const refresh = useCallback(() => {
    if (!me) return;
    setTrip(tripService.getTrip(id));
    setIncoming(matchService.getIncomingApplications(me.id));
    setOutgoing(matchService.getOutgoingApplications(me.id));
    setRecruiting(tripService.getRecruitingTrips(me.id));
  }, [id, me]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setMe(user);
    if (user) {
      setUserMap(Object.fromEntries(getDb().users.map((u) => [u.id, u])));
      refresh();
    }
  }, [refresh]);

  if (!trip || !me) {
    return (
      <div className="min-h-dvh bg-sand-100">
        <PageHeader title="搭子选择" />
        <div className="flex h-[50dvh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-lake-200 border-t-lake-600" />
        </div>
      </div>
    );
  }

  function chooseSolo() {
    tripService.updateTrip(trip!.id, { mode: "solo" });
    groupService.createSoloGroup(trip!.id, me!.id, trip!.destination);
    toast("Solo模式已就绪，祝你享受独行的自由 🌿");
    router.push(`/trip/${trip!.id}`);
  }

  function chooseCompanion() {
    tripService.updateTrip(trip!.id, { mode: "companion", visibility: "public" });
    toast("已切换为找搭子模式，你的行程将出现在社区广场");
    refresh();
  }

  const group = groupService.getGroupByTrip(trip.id);
  const tripMap = (appId: string) => {
    const app = [...incoming, ...outgoing].find((a) => a.id === appId);
    return app ? tripService.getTrip(app.trip_plan_id) : null;
  };

  return (
    <div className="min-h-dvh bg-sand-100 pb-10">
      <PageHeader title="怎么出发？" />
      <div className="mx-4 mt-3">
        <FadeIn>
          <p className="text-center text-[13px] leading-6 text-ink-400">
            一个人有一个人的自由
            <br />
            一群人有一群人的热闹
          </p>
        </FadeIn>

        {/* 二选一大卡片 */}
        {trip.mode === "solo" ? (
          <div className="mt-5 grid grid-cols-1 gap-4">
            <FadeIn delay={0.05}>
              <button onClick={chooseSolo} className="group relative w-full overflow-hidden rounded-cardlg bg-gradient-to-br from-forest-600 via-forest-400 to-lake-400 p-6 text-left shadow-glass-lg transition active:scale-[0.98]">
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                <span className="text-3xl">🌿</span>
                <h3 className="mt-3 text-[20px] font-bold text-white">Solo 独自出发</h3>
                <p className="mt-1.5 text-[13px] text-white/85">不被打扰的节奏，随心所欲的路线</p>
                <span className="mt-4 inline-block rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-forest-600">就这么定了</span>
              </button>
            </FadeIn>
            <FadeIn delay={0.12}>
              <button onClick={chooseCompanion} className="glass w-full rounded-cardlg p-6 text-left transition active:scale-[0.98]">
                <span className="text-3xl">🧭</span>
                <h3 className="mt-3 text-[20px] font-bold text-ink-700">找搭子同行</h3>
                <p className="mt-1.5 text-[13px] text-ink-400">遇见旅行搭子或本地地陪，AA明算账</p>
                <span className="mt-4 inline-block rounded-full bg-sand-200 px-4 py-2 text-[13px] font-medium text-ink-500">看看谁在同行</span>
              </button>
            </FadeIn>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* 已选找搭子模式 */}
            <FadeIn>
              <div className="glass flex items-center gap-3 rounded-2xl border-lake-200 bg-lake-50/70 px-4 py-3">
                <span className="text-xl">🧭</span>
                <p className="flex-1 text-[13px] text-lake-700">
                  <b>找搭子模式已开启</b> · 行程已公开到社区广场
                </p>
                <button onClick={() => { tripService.updateTrip(trip!.id, { mode: "solo" }); refresh(); toast("已切回Solo"); }} className="text-[12px] text-ink-300 underline">改为Solo</button>
              </div>
            </FadeIn>

            {/* 我的小组 */}
            {group && (
              <FadeIn>
                <div className="glass rounded-card p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-ink-700">{group.name}</h3>
                    <Link href={`/group/${group.id}`} className="pill bg-forest-600 px-3.5 py-1.5 text-[12px] text-white">进入小组</Link>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {group.members.map((mid) => (
                      <div key={mid} className="flex flex-col items-center gap-1">
                        <Avatar src={userMap[mid]?.avatar ?? ""} size={40} ring />
                        <span className="text-[10px] text-ink-400">{userMap[mid]?.nickname.slice(0, 4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* 入口1：邀请好友 */}
            <FadeIn delay={0.05}>
              <div className="glass rounded-card p-5">
                <h3 className="text-[15px] font-bold text-ink-700">邀请好友加入</h3>
                <p className="mt-1 text-[12px] text-ink-300">把行程链接发给微信好友，对方确认后即可入组</p>
                <button
                  onClick={() => {
                    // MVP阶段mock分享，V2需接入微信JS-SDK分享
                    const link = `${window.location.origin}/share/invite-${trip!.id}`;
                    navigator.clipboard?.writeText(link).catch(() => {});
                    toast("邀请链接已复制（演示）");
                  }}
                  className="pill-ghost mt-3 w-full py-3 text-lake-600"
                >
                  复制邀请链接
                </button>
              </div>
            </FadeIn>

            {/* 入口2：收到的申请（我是行程所有者，需双方确认） */}
            {incoming.length > 0 && (
              <FadeIn delay={0.08}>
                <div>
                  <h3 className="mb-3 text-[15px] font-bold text-ink-700">
                    收到的搭子申请 <span className="text-[12px] font-normal text-ink-300">（需双方确认后才入组）</span>
                  </h3>
                  <div className="space-y-3">
                    {incoming.map((app) => {
                      const applicant = userMap[app.applicant_id];
                      return (
                        <div key={app.id} className="glass rounded-card p-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={applicant?.avatar ?? ""} size={46} ring />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] font-bold text-ink-700">{applicant?.nickname}</span>
                                <VerifiedBadge verified={applicant?.verified ?? false} small />
                              </div>
                              <p className="text-[12px] text-ink-300">{applicant?.bio}</p>
                            </div>
                          </div>
                          {app.message && <p className="mt-2.5 rounded-xl bg-sand-200/60 px-3 py-2 text-[13px] italic text-ink-500">“{app.message}”</p>}
                          {app.owner_approved ? (
                            <p className="mt-3 text-center text-[13px] font-medium text-forest-600">✓ 你已同意 · 等待对方最终确认</p>
                          ) : (
                            <div className="mt-3 flex gap-3">
                              <button onClick={() => { matchService.reject(app.id); refresh(); toast("已拒绝"); }} className="pill-ghost flex-1 py-2.5">拒绝</button>
                              <button onClick={() => setConfirmApp(app)} className="pill-primary flex-1 py-2.5">查看并确认</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* 我发出的申请状态 */}
            {outgoing.length > 0 && (
              <FadeIn delay={0.1}>
                <div>
                  <h3 className="mb-3 text-[15px] font-bold text-ink-700">我申请加入的行程</h3>
                  <div className="space-y-3">
                    {outgoing.map((app) => {
                      const t = tripMap(app.id);
                      const owner = t ? userMap[t.owner_id] : null;
                      return (
                        <div key={app.id} className="glass rounded-card p-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={t?.cover} alt="" className="h-14 w-14 rounded-xl object-cover" />
                            <div className="flex-1">
                              <p className="text-[14px] font-semibold text-ink-700">{t?.destination} · {t?.travel_type}</p>
                              <p className="text-[12px] text-ink-300">发起人：{owner?.nickname}</p>
                            </div>
                          </div>
                          {app.owner_approved ? (
                            <div className="mt-3">
                              <p className="rounded-xl bg-forest-50 px-3 py-2 text-[12px] text-forest-700">
                                对方已同意你的申请！确认后即可加入小组
                              </p>
                              <button
                                onClick={() => { matchService.applicantConfirm(app.id); refresh(); toast("已加入小组 🎉"); }}
                                className="pill mt-2.5 w-full bg-gradient-to-br from-forest-600 to-forest-400 py-2.5 text-white"
                              >
                                我确认加入
                              </button>
                            </div>
                          ) : (
                            <p className="mt-2.5 text-[12px] text-ink-300">等待对方审核…</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* 入口3：社区广场相似行程 */}
            <FadeIn delay={0.12}>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-ink-700">行程相似的同路人</h3>
                  <Link href="/square" className="text-[13px] font-medium text-lake-600">逛广场 →</Link>
                </div>
                <div className="mt-3 space-y-3">
                  {recruiting.length === 0 && (
                    <p className="glass rounded-card p-4 text-center text-[13px] text-ink-300">暂时没有招募中的相似行程，去广场逛逛吧</p>
                  )}
                  {recruiting.slice(0, 4).map((t) => {
                    const owner = userMap[t.owner_id];
                    const applied = outgoing.some((a) => a.trip_plan_id === t.id);
                    const similar = t.destination === trip.destination || t.travel_type === trip.travel_type;
                    return (
                      <div key={t.id} className={`glass rounded-card p-4 ${similar ? "border-lake-200" : ""}`}>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.cover} alt="" className="h-16 w-16 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[14px] font-semibold text-ink-700">{t.destination} · {t.travel_type}</p>
                              {similar && <span className="rounded-full bg-lake-100 px-2 py-0.5 text-[10px] font-medium text-lake-700">相似</span>}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-300">{t.notes}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <Avatar src={owner?.avatar ?? ""} size={18} />
                              <span className="text-[11px] text-ink-400">{owner?.nickname}</span>
                              <VerifiedBadge verified={owner?.verified ?? false} small />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-3">
                          <Link href={`/trip/${t.id}`} className="pill-ghost flex-1 py-2 text-[12px]">看行程</Link>
                          <button
                            disabled={applied}
                            onClick={() => {
                              matchService.applyToTrip(t.id, me!.id, `我也喜欢${t.destination}！求带～`);
                              refresh();
                              toast("申请已发出，等待对方确认");
                            }}
                            className={`flex-1 rounded-full py-2 text-[12px] font-medium text-white transition active:scale-95 ${
                              applied ? "bg-ink-200" : "bg-gradient-to-br from-coral-500 to-coral-400"
                            }`}
                          >
                            {applied ? "已申请" : "申请加入"}
                          </button>
                        </div>
                        {/* MVP演示：模拟对方同意（真实场景为对方在TA的设备上操作） */}
                        {!applied && (
                          <button
                            onClick={() => {
                              const app = matchService.applyToTrip(t.id, me!.id, `我也喜欢${t.destination}！求带～`);
                              matchService.ownerApprove(app.id);
                              refresh();
                              toast("【演示】已模拟对方同意，请确认加入", "info");
                            }}
                            className="mt-2 w-full text-[11px] text-ink-300 underline"
                          >
                            MVP演示：模拟对方同意我的申请
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </div>

      {/* 所有者确认弹层：展示对方完整资料 */}
      <AnimatePresence>
        {confirmApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-ink-900/45 backdrop-blur-sm"
            onClick={() => setConfirmApp(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-deep mx-auto w-full max-w-md rounded-t-cardlg bg-white/95 p-6 pb-10"
            >
              {(() => {
                const applicant = userMap[confirmApp.applicant_id];
                return (
                  <>
                    <p className="text-center text-[12px] font-medium text-ink-300">对方申请加入你的行程</p>
                    <div className="mt-4 flex flex-col items-center">
                      <Avatar src={applicant?.avatar ?? ""} size={72} ring />
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[18px] font-bold text-ink-700">{applicant?.nickname}</span>
                        <VerifiedBadge verified={applicant?.verified ?? false} />
                      </div>
                      <p className="mt-1 text-[13px] text-ink-400">{applicant?.bio}</p>
                      <div className="mt-3 flex gap-5 text-center">
                        <div><p className="text-[16px] font-bold text-ink-700">{applicant?.followers}</p><p className="text-[11px] text-ink-300">粉丝</p></div>
                        <div><p className="text-[16px] font-bold text-ink-700">{applicant?.following}</p><p className="text-[11px] text-ink-300">关注</p></div>
                      </div>
                    </div>
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => { matchService.reject(confirmApp.id); setConfirmApp(null); refresh(); toast("已拒绝"); }}
                        className="pill-ghost flex-1 py-3"
                      >
                        拒绝
                      </button>
                      <button
                        onClick={() => { matchService.ownerApprove(confirmApp.id); setConfirmApp(null); refresh(); toast("已同意，等待对方最终确认"); }}
                        className="pill-primary flex-1 py-3"
                      >
                        同意申请
                      </button>
                    </div>
                    <p className="mt-3 text-center text-[11px] text-ink-300">
                      双方确认后才会互相进入小组，保护双方安全
                    </p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
