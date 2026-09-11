"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, VerifiedBadge, TypeTag } from "@/components/ui/Badges";
import { MarkdownView, FadeIn } from "@/components/ui/Common";
import { postService } from "@/lib/services/post.service";
import { tripService } from "@/lib/services/trip.service";
import { authService } from "@/lib/services/auth.service";
import { getDb } from "@/lib/mock/db";
import type { PoiItem, Post, User } from "@/types";

/**
 * 攻略分享页（公开可访问，非登录用户只读）
 * 分享链接：/share/{postId}
 */
export default function SharePage({ params }: { params: { postId: string } }) {
  const { postId } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [pois, setPois] = useState<PoiItem[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const p = postService.getPost(postId);
    if (!p) return;
    setPost(p);
    setLikes(p.likes);
    setAuthor(authService.getUserById(p.author_id) ?? getDb().users.find((u) => u.id === p.author_id) ?? null);
    if (p.trip_plan_id) setPois(tripService.getPois(p.trip_plan_id));
    setLoggedIn(Boolean(authService.getCurrentUser()));
  }, [postId]);

  if (!post) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-sand-100">
        <p className="text-sm text-ink-300">攻略不存在或已删除</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-sand-100 pb-28">
      {/* 封面 */}
      <div className="relative h-64 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20" />
        <Link href={loggedIn ? "/" : "/onboarding"} className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 backdrop-blur transition active:scale-90" aria-label="返回">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-ink-700"><path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <div className="absolute inset-x-5 bottom-4">
          <div className="flex gap-2">
            <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-600 backdrop-blur">📍 {post.destination}</span>
            <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-600 backdrop-blur">{post.travel_type}</span>
          </div>
          <h1 className="mt-2 text-[22px] font-bold leading-snug text-white drop-shadow">{post.title}</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-4">
        {/* 作者 */}
        <FadeIn>
          <div className="glass -mt-6 relative z-10 flex items-center gap-3 rounded-card p-4">
            <Avatar src={author?.avatar ?? ""} size={44} ring />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-ink-700">{author?.nickname ?? "旅行者"}</span>
                <VerifiedBadge verified={author?.verified ?? false} small />
              </div>
              <p className="text-[12px] text-ink-300">{author?.bio}</p>
            </div>
            {loggedIn && author && (
              <Link href={`/profile/${author.id}`} className="pill-ghost px-4 py-2 text-[13px] text-lake-600">
                主页
              </Link>
            )}
          </div>
        </FadeIn>

        {/* 要点摘要 */}
        <FadeIn delay={0.05}>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.summary.map((s, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="rounded-full bg-lake-100/80 px-3 py-1.5 text-[12px] font-medium text-lake-700"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </FadeIn>

        {/* 正文 */}
        <FadeIn delay={0.1}>
          <div className="glass mt-4 rounded-card p-5">
            <MarkdownView markdown={post.markdown} />
          </div>
        </FadeIn>

        {/* 行程POI时间轴（来自trip_plan） */}
        {pois.length > 0 && (
          <FadeIn delay={0.15}>
            <div className="mt-6">
              <h3 className="mb-3 text-[15px] font-bold text-ink-700">同款行程路线</h3>
              <div className="glass rounded-card p-5">
                {Array.from(new Set(pois.map((p) => p.day_index))).sort((a, b) => a - b).map((day) => (
                  <div key={day} className="relative pb-4 last:pb-0">
                    <p className="mb-2 text-[12px] font-bold text-lake-600">DAY {day}</p>
                    <div className="ml-1.5 space-y-2 border-l-2 border-lake-200 pl-4">
                      {pois.filter((p) => p.day_index === day).map((p) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-lake-400" />
                          <span className="text-[13px] text-ink-600">{p.poi_name}</span>
                          <TypeTag type={p.type} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* 底部信息 */}
        <div className="mt-6 flex items-center justify-between px-1">
          <span className="text-[11px] text-ink-300">发布于 {new Date(post.created_at).toLocaleDateString("zh-CN")}</span>
          {loggedIn ? (
            <button
              onClick={() => {
                if (liked) return;
                setLiked(true);
                setLikes((l) => l + 1);
                postService.likePost(post.id);
              }}
              className={`pill px-4 py-2 text-[13px] ${liked ? "bg-coral-500 text-white" : "pill-ghost"}`}
            >
              ❤ {likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}
            </button>
          ) : (
            <Link href="/onboarding" className="pill-primary px-4 py-2 text-[13px]">
              登录后互动
            </Link>
          )}
        </div>

        {/* 未登录提示 */}
        {!loggedIn && (
          <FadeIn delay={0.2}>
            <Link href="/onboarding" className="mt-6 block overflow-hidden rounded-cardlg bg-gradient-to-br from-lake-600 via-lake-400 to-forest-400 p-5 shadow-glass-lg">
              <p className="text-[16px] font-bold text-white">喜欢这份攻略？</p>
              <p className="mt-1 text-[13px] text-white/85">登录旅遇，创建你的同款行程，遇见你的奇妙朋友</p>
              <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-forest-600">立即体验</span>
            </Link>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
