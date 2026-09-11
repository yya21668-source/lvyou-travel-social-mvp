"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Post } from "@/types";
import { Avatar } from "@/components/ui/Badges";

/** 攻略卡片：目的地图片 + 标题 + 摘要 + 作者 + 点赞 */
export default function PostCard({ post, author, tall }: { post: Post; author?: { nickname: string; avatar: string } | null; tall?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 14 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-16px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/share/${post.id}`} className="glass block overflow-hidden rounded-card transition active:scale-[0.98]">
        <div className={`relative overflow-hidden ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt={post.title} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
          <span className="absolute bottom-2.5 left-3 rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-medium text-ink-600 backdrop-blur">
            📍 {post.destination}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[11px] text-white backdrop-blur">
            {post.travel_type}
          </span>
        </div>
        <div className="p-3.5">
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink-700">{post.title}</h3>
          {post.summary.length > 0 && (
            <p className="mt-1.5 line-clamp-1 text-[12px] text-ink-300">· {post.summary[0]}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {author && <Avatar src={author.avatar} size={22} />}
              <span className="text-[11px] text-ink-400">{author?.nickname ?? "旅行者"}</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-medium text-coral-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M12 21s-7.5-4.9-9.8-9.2C.7 8.7 2.4 5 5.9 5c2 0 3.4 1.1 4.1 2.3h4c.7-1.2 2.1-2.3 4.1-2.3 3.5 0 5.2 3.7 3.7 6.8C19.5 16.1 12 21 12 21z" transform="scale(0.9) translate(1.3 1.3)" />
              </svg>
              {post.likes > 999 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
