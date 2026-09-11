"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, VerifiedBadge, VisibilityTag } from "@/components/ui/Badges";
import { FadeIn } from "@/components/ui/Common";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { authService } from "@/lib/services/auth.service";
import { postService } from "@/lib/services/post.service";
import { reviewService } from "@/lib/services/review.service";
import type { Post, Review, User } from "@/types";

/**
 * 他人个人主页：公开攻略 + 搭子评价 + 关注（mock）
 */
export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    const u = authService.getUserById(id);
    setUser(u);
    if (u) {
      // 仅展示公开攻略
      setPosts(postService.getPostsByAuthor(u.id).filter((p) => p.visibility === "public"));
      setReviews(reviewService.getReviewsFor("user", u.id));
    }
  }, [id]);

  if (!user) {
    return (
      <div className="min-h-dvh bg-sand-100">
        <PageHeader title="用户主页" />
        <p className="pt-20 text-center text-sm text-ink-300">用户不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-sand-100 pb-10">
      <PageHeader title="用户主页" />

      {/* 头部 */}
      <div className="relative mx-4 -mt-1 overflow-hidden rounded-cardlg bg-gradient-to-br from-forest-600 via-forest-400 to-lake-400 p-5">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <Avatar src={user.avatar} size={64} ring />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[19px] font-bold text-white">{user.nickname}</h1>
              <VerifiedBadge verified={user.verified} />
            </div>
            <p className="mt-0.5 text-[12px] text-white/80">{user.bio}</p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-8 text-white">
          <div><p className="text-[16px] font-bold">{user.followers + (followed ? 1 : 0)}</p><p className="text-[11px] text-white/75">粉丝</p></div>
          <div><p className="text-[16px] font-bold">{user.following}</p><p className="text-[11px] text-white/75">关注</p></div>
          <button
            onClick={() => {
              setFollowed((f) => !f);
              toast(followed ? "已取消关注" : `已关注 ${user.nickname}`);
            }}
            className={`ml-auto rounded-full px-5 py-2 text-[13px] font-semibold transition active:scale-95 ${
              followed ? "bg-white/25 text-white backdrop-blur" : "bg-white text-forest-600"
            }`}
          >
            {followed ? "已关注" : "+ 关注"}
          </button>
        </div>
      </div>

      <div className="mx-4">
        {/* 搭子评价 */}
        {reviews.length > 0 && (
          <FadeIn delay={0.05}>
            <div className="mt-5">
              <h3 className="mb-3 text-[15px] font-bold text-ink-700">同行过的旅伴说</h3>
              <div className="space-y-2.5">
                {reviews.map((r) => {
                  const author = authService.getUserById(r.author_id);
                  return (
                    <div key={r.id} className="glass flex gap-3 rounded-card p-4">
                      <Avatar src={author?.avatar ?? ""} size={34} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-ink-600">{author?.nickname}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <svg key={s} viewBox="0 0 24 24" fill={s < r.rating ? "#FFB400" : "#E0D6BC"} className="h-3 w-3"><path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.7 5.8 21.2l1.4-7L2 9.4l7-.8z" /></svg>
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-[13px] leading-6 text-ink-500">{r.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        )}

        {/* TA的攻略 */}
        <FadeIn delay={0.1}>
          <div className="mt-6">
            <h3 className="mb-3 text-[15px] font-bold text-ink-700">TA的公开攻略 {posts.length}</h3>
            {posts.length === 0 && <p className="glass rounded-card p-4 text-center text-[13px] text-ink-300">暂无公开攻略</p>}
            <div className="space-y-3">
              {posts.map((p) => (
                <Link key={p.id} href={`/share/${p.id}`} className="glass flex items-center gap-3 rounded-card p-3 transition active:scale-[0.98]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[14px] font-semibold text-ink-700">{p.title}</p>
                    <p className="mt-1 text-[11px] text-ink-300">📍 {p.destination} · ❤ {p.likes}</p>
                    <div className="mt-1.5"><VisibilityTag visibility={p.visibility} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
