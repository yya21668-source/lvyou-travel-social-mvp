"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import { TypeTag } from "@/components/ui/Badges";
import { FadeIn } from "@/components/ui/Common";
import { useToast } from "@/components/ui/Toast";
import { tripService } from "@/lib/services/trip.service";
import { groupService } from "@/lib/services/group.service";
import type { TripPlan } from "@/types";

/**
 * 行程中页：时间轴 + 关键时间点 + 社区求助入口
 * 求助帖：MVP阶段UI占位，V2接入社区帖子服务
 */
export default function LivePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [now, setNow] = useState(new Date());
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpText, setHelpText] = useState("");

  useEffect(() => {
    setTrip(tripService.getTrip(id));
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, [id]);

  const pois = useMemo(() => (trip ? tripService.getPois(trip.id) : []), [trip]);

  /** 当前进行到的POI（按建议时间与当前时间比较，模拟） */
  const activePoi = useMemo(() => {
    if (!trip) return null;
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    return (
      pois.find((p) => {
        const [h, m] = p.suggested_time.split(":").map(Number);
        return h * 60 + m <= minutesNow + 60 && h * 60 + m >= minutesNow - 90;
      }) ?? null
    );
  }, [pois, now, trip]);

  if (!trip) {
    return (
      <div className="min-h-dvh bg-sand-100">
        <PageHeader title="行程中" />
        <p className="pt-20 text-center text-sm text-ink-300">行程不存在</p>
      </div>
    );
  }

  const group = groupService.getGroupByTrip(trip.id);

  return (
    <div className="min-h-dvh bg-sand-100 pb-32">
      <PageHeader
        title="行程中"
        right={
          group ? (
            <Link href={`/group/${group.id}`} className="text-[12px] font-medium text-lake-600">小组</Link>
          ) : undefined
        }
      />

      {/* 当前状态卡 */}
      <div className="mx-4 mt-2">
        <FadeIn>
          <div className="relative overflow-hidden rounded-cardlg bg-gradient-to-br from-lake-600 via-lake-400 to-forest-400 p-5 shadow-glass-lg">
            <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
            <svg viewBox="0 0 24 24" className="absolute right-6 top-5 h-4 w-4 animate-twinkle"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#fff" opacity="0.85" /></svg>
            <p className="text-[12px] font-medium text-white/80">现在 · {now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</p>
            <h2 className="mt-1 text-[20px] font-bold text-white">{trip.destination} · 进行中</h2>
            {activePoi ? (
              <div className="mt-3 rounded-2xl bg-white/20 px-4 py-3 backdrop-blur">
                <p className="text-[11px] text-white/80">即将 / 正在进行</p>
                <p className="mt-0.5 text-[15px] font-semibold text-white">
                  {activePoi.suggested_time} {activePoi.poi_name}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-white/85">当前时段没有安排，享受旅途的留白吧 ☁️</p>
            )}
          </div>
        </FadeIn>
      </div>

      {/* 今日时间轴（含关键时间点高亮） */}
      <div className="mx-4 mt-5">
        <h3 className="mb-3 text-[15px] font-bold text-ink-700">行程时间轴</h3>
        <div className="relative border-l-2 border-dashed border-lake-200 pl-5">
          {pois.map((poi, i) => {
            const key = Boolean(poi.is_key_point);
            const isActive = activePoi?.id === poi.id;
            return (
              <motion.div
                key={poi.id}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="relative mb-3"
              >
                <span className={`absolute -left-[27px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-sand-100 ${key ? "bg-coral-400" : isActive ? "bg-forest-500" : "bg-lake-400/60"}`} />
                <div className={`glass rounded-card p-4 ${key ? "border-coral-200 bg-coral-50/60" : isActive ? "border-forest-300" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-bold text-lake-600">D{poi.day_index} {poi.suggested_time}</span>
                    <h4 className="text-[14px] font-semibold text-ink-700">{poi.poi_name}</h4>
                    <TypeTag type={poi.type} />
                    {key && <span className="rounded-full bg-coral-400 px-2 py-0.5 text-[10px] font-bold text-white">⏰ 关键时间点 · 勿迟到</span>}
                    {isActive && <span className="rounded-full bg-forest-500 px-2 py-0.5 text-[10px] font-bold text-white">当前</span>}
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-ink-400">{poi.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 底部操作区：保留社区求助帖入口 */}
      <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-md px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="glass-deep rounded-full p-1.5 shadow-glass-lg">
          <button
            onClick={() => setHelpOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lake-600 to-forest-500 py-3.5 text-[14px] font-semibold text-white transition active:scale-[0.98]"
          >
            <span className="text-base">📣</span>
            发布旅途求助帖
          </button>
        </div>
      </div>

      {/* 求助帖弹窗（UI占位，V2接入社区帖子服务） */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-ink-900/40 backdrop-blur-sm" onClick={() => setHelpOpen(false)}>
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-deep mx-auto w-full max-w-md rounded-t-cardlg bg-white/95 p-6 pb-10"
            >
              <h3 className="text-[16px] font-bold text-ink-700">发布求助帖</h3>
              <p className="mt-1 text-[12px] text-ink-300">附近的旅友和小组成员都能看到你的求助</p>
              <textarea
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                rows={4}
                placeholder="描述你的情况，如：在喜洲附近电动车没电了，求助附近的朋友…"
                className="input-base mt-4 resize-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {["🚗 需要搭车", "🔋 物资求助", "🏥 就医求助", "🧭 迷路了"].map((t) => (
                  <button key={t} onClick={() => setHelpText((s) => (s ? `${s} ${t}` : t))} className="rounded-full bg-sand-200 px-3 py-1.5 text-[12px] text-ink-500">
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (!helpText.trim()) { toast("写点内容再发布吧", "error"); return; }
                  setHelpOpen(false);
                  setHelpText("");
                  toast("求助帖已发布到附近（演示）");
                }}
                className="pill-coral mt-5 w-full py-3.5"
              >
                发布求助
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
