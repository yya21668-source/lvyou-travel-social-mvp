"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PostCard from "@/components/home/PostCard";
import { authService } from "@/lib/services/auth.service";
import { postService } from "@/lib/services/post.service";
import { matchService } from "@/lib/services/match.service";
import { getDb } from "@/lib/mock/db";
import { Avatar } from "@/components/ui/Badges";
import type { Post, User } from "@/types";

/**
 * 首页/发现页
 * - 顶部：AI创建行程大卡片（玻璃拟态渐变）
 * - 下方：推荐攻略瀑布流
 */
export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [me, setMe] = useState<User | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const me = authService.getCurrentUser();
    setMe(me);
    if (me) {
      setPosts(postService.getPublicFeed());
      const users = Object.fromEntries(getDb().users.map((u) => [u.id, u]));
      setUserMap(users);
      setPendingCount(matchService.getIncomingApplications(me.id).length);
    }
  }, []);

  return (
    <div className="px-4 pt-3">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-ink-700">
            旅遇<span className="ml-2 text-[12px] font-normal text-lake-600">遇见你的奇妙朋友</span>
          </h1>
        </div>
        <Link href="/profile" aria-label="个人主页">
          <Avatar src={me?.avatar ?? ""} size={40} ring />
        </Link>
      </div>

      {/* 收到的搭子申请提醒 */}
      {pendingCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/square?tab=mine"
            className="glass mt-4 flex items-center gap-3 rounded-2xl border-lake-200 px-4 py-3"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-lake-100 text-lake-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-ink-700">{pendingCount} 位旅行者申请加入你的行程</p>
              <p className="text-[12px] text-ink-300">查看对方资料并确认</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-ink-300"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </motion.div>
      )}

      {/* AI创建行程大卡片 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-4"
      >
        <Link href="/create" className="group relative block overflow-hidden rounded-cardlg bg-gradient-to-br from-lake-600 via-lake-400 to-forest-400 p-6 shadow-glass-lg transition active:scale-[0.98]">
          {/* 装饰性有机形态与星光 */}
          <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-forest-600/30 blur-2xl" />
          <svg viewBox="0 0 24 24" className="absolute right-8 top-6 h-4 w-4 animate-twinkle"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#fff" opacity="0.9" /></svg>
          <svg viewBox="0 0 24 24" className="absolute bottom-10 right-20 h-3 w-3 animate-twinkle" style={{ animationDelay: "1.2s" }}><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#fff" opacity="0.8" /></svg>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4z" strokeLinejoin="round" /></svg>
              AI 行程规划师
            </span>
            <h2 className="mt-3 text-[24px] font-bold leading-tight text-white drop-shadow-sm">
              去哪儿，怎么说
              <br />
              都听你的
            </h2>
            <p className="mt-2 text-[13px] font-light text-white/85">
              对话式创建 · 一键生成可视化攻略 · 遇见同路人
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-forest-600 shadow-md transition group-active:scale-95">
              开始规划旅程
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </Link>
      </motion.div>

      {/* 瀑布流 */}
      <div className="mt-7 flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-ink-700">为你推荐的攻略</h3>
        <Link href="/square" className="text-[13px] font-medium text-lake-600">
          逛广场 <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-4 columns-2 gap-3.5 [column-fill:_balance]">
        {posts.map((post, i) => (
          <div key={post.id} className="mb-3.5 break-inside-avoid">
            <PostCard post={post} author={userMap[post.author_id]} tall={i % 3 === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
