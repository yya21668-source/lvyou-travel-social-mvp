"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import { Avatar, TypeTag } from "@/components/ui/Badges";
import { FadeIn, GlassCard } from "@/components/ui/Common";
import { useToast } from "@/components/ui/Toast";
import { tripService } from "@/lib/services/trip.service";
import { reviewService } from "@/lib/services/review.service";
import { authService } from "@/lib/services/auth.service";
import { getDb } from "@/lib/mock/db";
import { mapProvider } from "@/lib/map/provider";
import type { PoiItem, Review, TripPlan, User } from "@/types";

/**
 * 场所详情页（POI）
 * 地图：当前为占位图（MapProvider mock），V2接入高德后自动切换真实静态图
 */
export default function PoiPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [poi, setPoi] = useState<PoiItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [myTrips, setMyTrips] = useState<TripPlan[]>([]);
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [mapUrl, setMapUrl] = useState("/map-placeholder.svg");

  useEffect(() => {
    const p = tripService.getPoi(id);
    if (!p) return;
    setPoi(p);
    setReviews(reviewService.getReviewsFor("poi", id));
    const db = getDb();
    setUserMap(Object.fromEntries(db.users.map((u) => [u.id, u])));
    const me = authService.getCurrentUser();
    if (me) setMyTrips(tripService.getMyTrips(me.id));
    // 地图：mock provider返回静态占位图
    mapProvider
      .geocode(p.address || p.poi_name)
      .then((c) => c && setMapUrl(mapProvider.staticMap(c, 14)));
  }, [id]);

  const avgRating = useMemo(
    () => (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : poi?.rating ?? 0),
    [reviews, poi]
  );

  if (!poi) {
    return (
      <div className="min-h-dvh bg-sand-100">
        <PageHeader title="场所详情" />
        <p className="pt-20 text-center text-sm text-ink-300">未找到该场所</p>
      </div>
    );
  }

  function handleAddToChecklist(trip: TripPlan) {
    tripService.addPoiToTrip(trip.id, poi!);
    setShowTripPicker(false);
    toast(`已加入「${trip.destination}」清单`);
  }

  return (
    <div className="min-h-dvh bg-sand-100 pb-6">
      <PageHeader title={poi.poi_name} />

      {/* 封面 */}
      <div className="relative mx-4 mt-2 overflow-hidden rounded-cardlg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?q=80&w=900&auto=format&fit=crop`}
          alt={poi.poi_name}
          className="h-48 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <TypeTag type={poi.type} />
            <div className="mt-1.5 flex items-center gap-1 text-white">
              <svg viewBox="0 0 24 24" fill="#FFB400" className="h-4 w-4"><path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.7 5.8 21.2l1.4-7L2 9.4l7-.8z" /></svg>
              <span className="text-[14px] font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-[11px] opacity-80">（{reviews.length || 1}条评价）</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4">
        {/* 简介 */}
        <FadeIn>
          <GlassCard className="p-5">
            <h3 className="text-[15px] font-bold text-ink-700">简介</h3>
            <p className="mt-2 text-[14px] leading-7 text-ink-500">{poi.description}</p>
            {poi.rating && (
              <p className="mt-2 text-[12px] text-ink-300">建议游玩时长参考：{poi.suggested_time} 开始，预留2-3小时</p>
            )}
          </GlassCard>
        </FadeIn>

        {/* 地图占位 */}
        <FadeIn delay={0.05}>
          <GlassCard className="mt-3.5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mapUrl} alt="位置示意图" className="h-32 w-full object-cover" />
            <div className="flex items-start gap-2 p-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-4 w-4 shrink-0 text-lake-600"><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <div>
                <p className="text-[13px] text-ink-600">{poi.address ?? "暂无地址信息"}</p>
                <p className="mt-0.5 text-[11px] text-ink-300">地图能力为占位演示 · V2接入高德地图</p>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* 信息 */}
        <FadeIn delay={0.1}>
          <GlassCard className="mt-3.5 divide-y divide-ink-700/5 p-5">
            <InfoRow label="营业时间" value={poi.opening_hours ?? "全天开放"} />
            <InfoRow label="联系电话" value={poi.phone ?? "暂无"} />
            <InfoRow
              label="外部链接"
              value="查看更多（占位）"
              link
              onClick={() => toast("外部链接跳转为占位功能", "info")}
            />
          </GlassCard>
        </FadeIn>

        {/* 评价 */}
        <FadeIn delay={0.15}>
          <div className="mt-5">
            <h3 className="mb-3 text-[15px] font-bold text-ink-700">
              旅行者评价 <span className="text-[12px] font-normal text-ink-300">（{reviews.length}）</span>
            </h3>
            {reviews.length === 0 && (
              <p className="glass rounded-card p-4 text-center text-[13px] text-ink-300">还没有评价，去过的第一条评价等你来写</p>
            )}
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="glass rounded-card p-4"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={userMap[r.author_id]?.avatar ?? ""} size={32} />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-ink-600">{userMap[r.author_id]?.nickname ?? "旅行者"}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <svg key={s} viewBox="0 0 24 24" fill={s < r.rating ? "#FFB400" : "#E0D6BC"} className="h-3 w-3"><path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.7 5.8 21.2l1.4-7L2 9.4l7-.8z" /></svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-ink-300">{r.created_at.slice(5, 10)}</span>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-6 text-ink-500">{r.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* 添加到清单 */}
      <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center">
        <button
          onClick={() => {
            if (myTrips.length === 0) {
              toast("先去创建一个行程吧", "info");
              router.push("/create");
            } else {
              setShowTripPicker(true);
            }
          }}
          className="pill-coral w-[88%] max-w-md py-3.5 text-[15px]"
        >
          + 添加到我的行程清单
        </button>
      </div>

      {/* 选择行程弹层 */}
      {showTripPicker && (
        <div className="fixed inset-0 z-50 flex items-end bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowTripPicker(false)}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-deep mx-auto w-full max-w-md rounded-t-cardlg bg-white/90 p-6 pb-10"
          >
            <h3 className="text-[16px] font-bold text-ink-700">加入哪个行程？</h3>
            <div className="mt-4 space-y-2.5">
              {myTrips.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleAddToChecklist(t)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/80 p-3.5 text-left transition active:scale-[0.98]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.cover} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-ink-700">{t.destination}</p>
                    <p className="text-[12px] text-ink-300">{t.start_date} 出发 · {t.travel_type}</p>
                  </div>
                  <span className="text-[12px] font-medium text-lake-600">加入</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, link, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!link} className="flex w-full items-center justify-between py-3 first:pt-0 last:pb-0">
      <span className="text-[13px] text-ink-400">{label}</span>
      <span className={`text-[13px] ${link ? "font-medium text-lake-600 underline underline-offset-2" : "text-ink-600"}`}>{value}</span>
    </button>
  );
}
