"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import PostCard from "@/components/home/PostCard";
import { Avatar, VerifiedBadge } from "@/components/ui/Badges";
import { FadeIn } from "@/components/ui/Common";
import { useToast } from "@/components/ui/Toast";
import { authService } from "@/lib/services/auth.service";
import { postService } from "@/lib/services/post.service";
import { tripService } from "@/lib/services/trip.service";
import { matchService } from "@/lib/services/match.service";
import { getDb } from "@/lib/mock/db";
import type { MatchApplication, Post, TripPlan, User } from "@/types";

/**
 * 社区广场：攻略feed + 招募搭子 + 我的搭子消息
 * 筛选：目的地 / 旅行形式 / 是否招募搭子
 */
const DESTINATIONS = ["全部", "大理", "重庆", "京都", "成都", "青岛", "清迈", "四姑娘山", "雨崩"];
const TYPES = ["全部", "徒步", "穷游", "度假", "其他"];

function SquareInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [me, setMe] = useState<User | null>(null);
  const requestedTab = searchParams.get("tab");
  const initialTab = requestedTab === "recruit" || requestedTab === "mine" ? requestedTab : "feed";
  const [tab, setTab] = useState<"feed" | "recruit" | "mine">(initialTab);
  const [dest, setDest] = useState("全部");
  const [type, setType] = useState("全部");
  const [recruitingOnly, setRecruitingOnly] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [recruiting, setRecruiting] = useState<TripPlan[]>([]);
  const [incoming, setIncoming] = useState<MatchApplication[]>([]);
  const [outgoing, setOutgoing] = useState<MatchApplication[]>([]);
  const [userMap, setUserMap] = useState<Record<string, User>>({});

  const refresh = useCallback(() => {
    if (!me) return;
    setPosts(
      postService.getSquareFeed({
        destination: dest === "全部" ? undefined : dest,
        travelType: type === "全部" ? undefined : type,
        recruiting: recruitingOnly || tab === "recruit",
      })
    );
    setRecruiting(tripService.getRecruitingTrips(me.id));
    setIncoming(matchService.getIncomingApplications(me.id));
    setOutgoing(matchService.getOutgoingApplications(me.id));
  }, [me, dest, type, recruitingOnly, tab]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setMe(user);
    setUserMap(Object.fromEntries(getDb().users.map((u) => [u.id, u])));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  function switchTab(nextTab: "feed" | "recruit" | "mine") {
    setTab(nextTab);
    router.replace(nextTab === "feed" ? "/square" : `/square?tab=${nextTab}`, { scroll: false });
  }

  return (
    <div className="pt-3">
      <h1 className="px-4 text-[22px] font-bold text-ink-700">社区广场</h1>
      <p className="px-4 mt-1 text-[13px] text-ink-300">攻略、搭子、同路人，都在这里遇见</p>

      {/* Tab */}
      <div className="sticky top-0 z-30 mt-4 bg-sand-100/85 px-4 pb-2 pt-1 backdrop-blur-lg">
        <div className="glass flex rounded-full p-1">
          {([
            ["feed", "攻略"],
            ["recruit", "招募搭子"],
            ["mine", `搭子消息${incoming.length ? ` ${incoming.length}` : ""}`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`relative flex-1 rounded-full py-2 text-[13px] font-medium transition ${
                tab === key ? "text-white" : "text-ink-500"
              }`}
            >
              {tab === key && (
                <motion.span layoutId="square-tab" className="absolute inset-0 rounded-full bg-ink-700" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "feed" && (
        <>
          {/* 筛选 */}
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {DESTINATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDest(d)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition active:scale-95 ${
                  dest === d ? "bg-lake-600 text-white shadow-soft" : "bg-white/70 text-ink-500"
                }`}
              >
                {d === "全部" ? "🌍 全部目的地" : `📍 ${d}`}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 px-4">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full px-3 py-1 text-[12px] transition active:scale-95 ${
                  type === t ? "bg-forest-600 text-white" : "bg-white/70 text-ink-400"
                }`}
              >
                {t}
              </button>
            ))}
            <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[12px] text-ink-500">
              <input
                type="checkbox"
                checked={recruitingOnly}
                onChange={(e) => setRecruitingOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-coral-500"
              />
              招募搭子
            </label>
          </div>

          {/* feed */}
          <div className="mt-4 columns-2 gap-3.5 px-4 pb-4 [column-fill:_balance]">
            {posts.map((post, i) => (
              <div key={post.id} className="mb-3.5 break-inside-avoid">
                <PostCard post={post} author={userMap[post.author_id]} tall={i % 3 === 0} />
              </div>
            ))}
            {posts.length === 0 && (
              <p className="col-span-2 py-16 text-center text-[13px] text-ink-300">没有符合条件的攻略，换个筛选试试</p>
            )}
          </div>
        </>
      )}

      {tab === "recruit" && (
        <div className="space-y-3 px-4 pt-3 pb-4">
          {recruiting.length === 0 && (
            <p className="glass rounded-card p-6 text-center text-[13px] text-ink-300">暂时没有招募中的行程</p>
          )}
          {recruiting.map((t, i) => {
            const owner = userMap[t.owner_id];
            const applied = outgoing.some((a) => a.trip_plan_id === t.id);
            return (
              <FadeIn key={t.id} delay={i * 0.05}>
                <div className="glass overflow-hidden rounded-card">
                  <div className="relative h-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.cover} alt={t.destination} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2.5 left-4 flex items-center gap-2">
                      <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-medium text-ink-600">📍 {t.destination}</span>
                      <span className="rounded-full bg-coral-400/90 px-2.5 py-0.5 text-[11px] font-medium text-white">{t.travel_type}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[14px] font-semibold text-ink-700">{t.start_date} 出发 · {t.end_date} 返程</p>
                    {t.notes && <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-ink-400">{t.notes}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={owner?.avatar ?? ""} size={26} />
                        <span className="text-[12px] text-ink-500">{owner?.nickname}</span>
                        <VerifiedBadge verified={owner?.verified ?? false} small />
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/trip/${t.id}`} className="pill-ghost px-3.5 py-1.5 text-[12px]">看行程</Link>
                        <button
                          disabled={applied}
                          onClick={() => {
                            matchService.applyToTrip(t.id, me!.id, "想加入你们的行程！");
                            refresh();
                            toast("申请已发出，等待对方确认");
                          }}
                          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white transition active:scale-95 ${
                            applied ? "bg-ink-200" : "bg-gradient-to-br from-coral-500 to-coral-400"
                          }`}
                        >
                          {applied ? "已申请" : "申请加入"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}

      {tab === "mine" && (
        <div className="space-y-5 px-4 pt-3 pb-4">
          <div>
            <h3 className="mb-3 text-[15px] font-bold text-ink-700">收到的申请</h3>
            {incoming.length === 0 && <p className="glass rounded-card p-4 text-center text-[13px] text-ink-300">暂无收到的申请</p>}
            {incoming.map((app) => {
              const applicant = userMap[app.applicant_id];
              const t = tripService.getTrip(app.trip_plan_id);
              return (
                <div key={app.id} className="glass mb-3 rounded-card p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={applicant?.avatar ?? ""} size={44} ring />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-ink-700">{applicant?.nickname}</span>
                        <VerifiedBadge verified={applicant?.verified ?? false} small />
                      </div>
                      <p className="text-[12px] text-ink-300">申请加入你的「{t?.destination}」行程</p>
                    </div>
                  </div>
                  {app.message && <p className="mt-2.5 rounded-xl bg-sand-200/60 px-3 py-2 text-[13px] italic text-ink-500">“{app.message}”</p>}
                  {app.owner_approved ? (
                    <p className="mt-3 text-center text-[13px] font-medium text-forest-600">✓ 已同意 · 等待对方确认</p>
                  ) : (
                    <div className="mt-3 flex gap-3">
                      <button onClick={() => { matchService.reject(app.id); refresh(); }} className="pill-ghost flex-1 py-2.5">拒绝</button>
                      <button onClick={() => { matchService.ownerApprove(app.id); refresh(); toast("已同意，等待对方最终确认"); }} className="pill-primary flex-1 py-2.5">同意</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="mb-3 text-[15px] font-bold text-ink-700">我发出的申请</h3>
            {outgoing.length === 0 && <p className="glass rounded-card p-4 text-center text-[13px] text-ink-300">还没有申请过别人的行程</p>}
            {outgoing.map((app) => {
              const t = tripService.getTrip(app.trip_plan_id);
              const owner = t ? userMap[t.owner_id] : null;
              return (
                <div key={app.id} className="glass mb-3 rounded-card p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t?.cover} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-ink-700">{t?.destination} · {t?.travel_type}</p>
                      <p className="text-[12px] text-ink-300">发起人：{owner?.nickname}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${app.owner_approved ? "bg-forest-100 text-forest-700" : "bg-sand-200 text-ink-400"}`}>
                      {app.owner_approved ? "待我确认" : "待对方审核"}
                    </span>
                  </div>
                  {app.owner_approved && (
                    <button
                      onClick={() => { matchService.applicantConfirm(app.id); refresh(); toast("已加入小组 🎉"); }}
                      className="pill mt-3 w-full bg-gradient-to-br from-forest-600 to-forest-400 py-2.5 text-white"
                    >
                      我确认加入
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SquarePage() {
  return (
    <Suspense fallback={<div className="flex h-[50dvh] items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-[3px] border-lake-200 border-t-lake-600" /></div>}>
      <SquareInner />
    </Suspense>
  );
}
