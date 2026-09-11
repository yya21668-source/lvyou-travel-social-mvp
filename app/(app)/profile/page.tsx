"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, VerifiedBadge, VisibilityTag } from "@/components/ui/Badges";
import { FadeIn } from "@/components/ui/Common";
import { useToast } from "@/components/ui/Toast";
import { InstallApp } from "@/components/install-app";
import { authService } from "@/lib/services/auth.service";
import { tripService } from "@/lib/services/trip.service";
import { postService } from "@/lib/services/post.service";
import { matchService } from "@/lib/services/match.service";
import { groupService } from "@/lib/services/group.service";
import type { Group, Post, TripPlan, User } from "@/types";

/**
 * 个人主页：认证状态徽章、攻略列表（可见性标识）、粉丝/关注数
 * 实名认证：MVP阶段mock通过，V2需接入真实身份认证服务
 */
export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [me, setMe] = useState<User | null>(null);
  const [myTrips, setMyTrips] = useState<TripPlan[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [vName, setVName] = useState("");
  const [vId, setVId] = useState("");

  const refresh = () => {
    const user = authService.getCurrentUser();
    if (!user) return;
    setMe(authService.getUserById(user.id));
    setMyTrips(tripService.getMyTrips(user.id));
    setMyPosts(postService.getPostsByAuthor(user.id));
    setMyGroups(groupService.getCompanionGroups(user.id));
    setMatchCount(
      matchService.getIncomingApplications(user.id).length +
      matchService.getOutgoingApplications(user.id).length
    );
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!me) return null;

  return (
    <div className="pb-10">
      {/* 头部 */}
      <div className="relative overflow-hidden rounded-b-cardlg bg-gradient-to-br from-lake-600 via-lake-400 to-forest-400 px-5 pb-14 pt-10">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <svg viewBox="0 0 24 24" className="absolute right-8 top-8 h-5 w-5 animate-twinkle"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#fff" opacity="0.9" /></svg>
        <div className="relative flex items-center gap-4">
          <Avatar src={me.avatar} size={68} ring />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-white">{me.nickname}</h1>
              <VerifiedBadge verified={me.verified} />
            </div>
            <p className="mt-0.5 text-[12px] text-white/80">{me.bio}</p>
          </div>
          <button
            onClick={() => { authService.signOut(); router.replace("/onboarding"); }}
            className="rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur"
          >
            退出
          </button>
        </div>
        <div className="relative mt-5 flex gap-8 text-white">
          <div><p className="text-[18px] font-bold">{me.followers}</p><p className="text-[11px] text-white/75">粉丝</p></div>
          <div><p className="text-[18px] font-bold">{me.following}</p><p className="text-[11px] text-white/75">关注</p></div>
          <div><p className="text-[18px] font-bold">{myPosts.length}</p><p className="text-[11px] text-white/75">攻略</p></div>
          <div><p className="text-[18px] font-bold">{myTrips.length}</p><p className="text-[11px] text-white/75">行程</p></div>
        </div>
      </div>

      <div className="mx-4 -mt-8">
        {/* 实名认证 */}
        <FadeIn>
          <div className="glass-deep rounded-cardlg p-4">
            <button
              onClick={() => (me!.verified ? toast("你已完成实名认证 ✓") : setVerifyOpen(true))}
              className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition active:scale-[0.98] ${me.verified ? "bg-forest-100" : "bg-coral-100"}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${me.verified ? "bg-forest-500 text-white" : "bg-white/70 text-coral-500"}`}>
                {me.verified ? "✓" : "◇"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-ink-700">{me.verified ? "已完成实名认证" : "完成实名认证"}</span>
                <span className="mt-1 block text-[11px] leading-4 text-ink-400">
                  {me.verified ? "认证徽章已展示，帮助同行者建立信任" : "认证后点亮徽章，找搭子更安心"}
                </span>
              </span>
              <span className="text-ink-300">›</span>
            </button>
          </div>
        </FadeIn>

        {/* PWA 安装入口 */}
        <FadeIn delay={0.03}>
          <div className="mt-4">
            <InstallApp />
          </div>
        </FadeIn>

        {/* 我的搭子：沿用 groups + match_applications 架构 */}
        <FadeIn delay={0.04}>
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-ink-700">我的搭子</h3>
              <Link href="/square?tab=mine" className="flex items-center gap-1 text-[12px] font-medium text-lake-600">
                搭子消息
                {matchCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1.5 text-[10px] font-bold text-white">
                    {matchCount}
                  </span>
                )}
                <span aria-hidden>›</span>
              </Link>
            </div>

            {myGroups.length > 0 ? (
              <div className="space-y-3">
                {myGroups.map((group) => {
                  const groupTrip = tripService.getTrip(group.trip_plan_id);
                  const members = group.members
                    .map((memberId) => authService.getUserById(memberId))
                    .filter((member): member is User => Boolean(member));

                  return (
                    <Link
                      key={group.id}
                      href={`/group/${group.id}`}
                      className="glass group flex items-center gap-3 rounded-card p-4 transition active:scale-[0.98]"
                    >
                      <div className="flex min-w-[58px] -space-x-3">
                        {members.slice(0, 3).map((member) => (
                          <span key={member.id} className="rounded-full bg-sand-100 p-0.5 ring-2 ring-white/80">
                            <Avatar src={member.avatar} size={34} />
                          </span>
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-ink-700">{group.name}</p>
                        <p className="mt-1 text-[11px] text-ink-300">
                          {groupTrip?.destination ?? "同行旅程"} · {group.members.length} 人 · 群聊与 AA 记账
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-forest-100 px-3 py-1.5 text-[11px] font-semibold text-forest-600 transition group-active:scale-95">
                        进入小组
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Link href="/square?tab=recruit" className="glass flex items-center gap-3 rounded-card p-4 transition active:scale-[0.98]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lake-100 text-xl">🧭</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-ink-700">遇见同路的旅行搭子</span>
                  <span className="mt-1 block text-[11px] text-ink-300">浏览相似行程，双方确认后进入小组</span>
                </span>
                <span className="text-ink-300">›</span>
              </Link>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/square?tab=recruit" className="glass rounded-2xl px-4 py-3 text-center text-[12px] font-medium text-ink-500 transition active:scale-95">
                🧑‍🤝‍🧑 找旅行搭子
              </Link>
              <Link href="/square?tab=mine" className="glass rounded-2xl px-4 py-3 text-center text-[12px] font-medium text-ink-500 transition active:scale-95">
                💬 申请与确认
              </Link>
            </div>
          </section>
        </FadeIn>

        {/* 我的行程 */}
        <FadeIn delay={0.08}>
          <div className="mt-6">
            <h3 className="mb-3 text-[15px] font-bold text-ink-700">我的行程</h3>
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              <Link href="/create" className="glass flex h-24 w-32 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl text-ink-300 transition active:scale-95">
                <span className="text-2xl">+</span>
                <span className="text-[12px]">AI创建行程</span>
              </Link>
              {myTrips.map((t) => (
                <Link key={t.id} href={`/trip/${t.id}`} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-2xl transition active:scale-95">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.cover} alt={t.destination} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute bottom-2 left-2.5">
                    <p className="text-[13px] font-bold text-white">{t.destination}</p>
                    <p className="text-[10px] text-white/80">{t.status === "completed" ? "已完成" : t.status === "ongoing" ? "进行中" : "规划中"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 我的攻略 */}
        <FadeIn delay={0.12}>
          <div className="mt-6">
            <h3 className="mb-3 text-[15px] font-bold text-ink-700">我的攻略 {myPosts.length}</h3>
            {myPosts.length === 0 && (
              <p className="glass rounded-card p-4 text-center text-[13px] text-ink-300">
                还没有发布攻略，完成一次旅行后让AI帮你写游记吧
              </p>
            )}
            <div className="space-y-3">
              {myPosts.map((p) => (
                <Link key={p.id} href={`/share/${p.id}`} className="glass flex items-center gap-3 rounded-card p-3 transition active:scale-[0.98]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[14px] font-semibold text-ink-700">{p.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-[11px] text-ink-300">
                      📍 {p.destination} · ❤ {p.likes}
                    </p>
                    <div className="mt-1.5"><VisibilityTag visibility={p.visibility} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* 实名认证弹窗（MVP mock，V2接入真实认证服务） */}
      <AnimatePresence>
        {verifyOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-ink-900/45 backdrop-blur-sm" onClick={() => setVerifyOpen(false)}>
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-deep mx-auto w-full max-w-md rounded-t-cardlg bg-white/95 p-6 pb-10"
            >
              <h3 className="text-[16px] font-bold text-ink-700">实名认证</h3>
              <p className="mt-1 text-[12px] leading-5 text-ink-400">
                认证信息仅用于身份核验，展示时只显示认证徽章，不公开个人信息
              </p>
              <label className="mt-4 block text-[13px] font-medium text-ink-500">真实姓名</label>
              <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="与证件一致" className="input-base mt-1.5" />
              <label className="mt-3 block text-[13px] font-medium text-ink-500">身份证号</label>
              <input value={vId} onChange={(e) => setVId(e.target.value.replace(/\s/g, "").slice(0, 18))} placeholder="18位身份证号" className="input-base mt-1.5" />
              <p className="mt-3 rounded-xl bg-sand-200/70 px-3 py-2 text-[11px] text-ink-400">
                {/* MVP阶段mock，V2需接入真实身份认证服务（如腾讯云慧眼） */}
                MVP演示：认证流程为mock，提交即通过
              </p>
              <button
                onClick={() => {
                  if (authService.verifyIdentity(vName, vId)) {
                    setVerifyOpen(false);
                    refresh();
                    toast("实名认证通过 ✓");
                  } else {
                    toast("信息格式有误", "error");
                  }
                }}
                className="pill-primary mt-4 w-full py-3.5"
              >
                提交认证
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
