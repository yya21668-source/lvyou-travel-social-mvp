"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/ui/Common";
import { TypeTag } from "@/components/ui/Badges";
import { useToast } from "@/components/ui/Toast";
import { tripService } from "@/lib/services/trip.service";
import { groupService } from "@/lib/services/group.service";
import type { PoiItem, TripPlan } from "@/types";

/**
 * 行程详情页：可视化时间轴 + 单项编辑/删除/重新生成
 * 状态流转：planning → ongoing → completed
 */
const STATUS_LABEL: Record<TripPlan["status"], string> = {
  draft: "草稿",
  planning: "规划中",
  ongoing: "进行中",
  completed: "已完成",
};

export default function TripPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [pois, setPois] = useState<PoiItem[]>([]);
  const [editing, setEditing] = useState<PoiItem | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const justCreated = searchParams.get("created") === "1";

  const refresh = useCallback(() => {
    setTrip(tripService.getTrip(id));
    setPois(tripService.getPois(id));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const days = useMemo(() => {
    const map = new Map<number, PoiItem[]>();
    pois.forEach((p) => {
      if (!map.has(p.day_index)) map.set(p.day_index, []);
      map.get(p.day_index)!.push(p);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [pois]);

  if (!trip) {
    return (
      <div className="min-h-dvh bg-sand-100">
        <PageHeader title="行程" />
        <p className="pt-20 text-center text-sm text-ink-300">行程不存在</p>
      </div>
    );
  }

  const hasGroup = Boolean(groupService.getGroupByTrip(trip.id));

  /** 单项重新生成：调AI接口取候选替换 */
  async function regenerateItem(poi: PoiItem) {
    setRegenerating(poi.id);
    try {
      const res = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          destination: trip!.destination,
          days: 1,
          travelType: trip!.travel_type,
          startDate: trip!.start_date,
          notes: `替换「${poi.poi_name}」这一项，给我一个不同但类型相近的新选择`,
        }),
      });
      const data = await res.json();
      const items: PoiItem[] = (data.days?.[0]?.items ?? []).slice(0, 4);
      const pool = items.filter((it) => it.poi_name !== poi.poi_name);
      const chosen = pool[Math.floor(Math.random() * Math.max(pool.length, 1))];
      if (chosen) {
        tripService.replacePoi(poi.id, { ...poi, ...chosen, day_index: poi.day_index, sort_order: poi.sort_order });
        refresh();
        toast(`已换为「${chosen.poi_name}」`);
      } else {
        toast("AI暂时没有更好的建议", "info");
      }
    } catch {
      toast("重新生成失败", "error");
    } finally {
      setRegenerating(null);
    }
  }

  function saveEdit(patch: Partial<PoiItem>) {
    if (editing) tripService.updatePoi(editing.id, patch);
    setEditing(null);
    refresh();
    toast("已保存");
  }

  return (
    <div className="min-h-dvh bg-sand-100 pb-10">
      <PageHeader title={`${trip.destination}之行`} />

      {/* 封面信息 */}
      <div className="relative mx-4 mt-2 overflow-hidden rounded-cardlg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trip.cover} alt={trip.destination} className="h-40 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-medium text-ink-600 backdrop-blur">{trip.travel_type}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium backdrop-blur ${trip.status === "ongoing" ? "bg-coral-400 text-white" : "bg-white/85 text-ink-600"}`}>
              {STATUS_LABEL[trip.status]}
            </span>
            <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-medium text-ink-600 backdrop-blur">
              {trip.mode === "solo" ? "Solo独行" : "搭子同行"}
            </span>
          </div>
          <p className="mt-1.5 text-[15px] font-semibold text-white drop-shadow">
            {trip.start_date} ~ {trip.end_date} · 共{days.length || 1}天
          </p>
        </div>
      </div>

      {/* 创建成功提示 */}
      <AnimatePresence>
        {justCreated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 mt-3">
            <div className="glass flex items-center gap-3 rounded-2xl border-forest-200 bg-forest-50/80 px-4 py-3">
              <span className="text-xl">🎉</span>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-forest-700">行程生成完毕！</p>
                <p className="text-[12px] text-forest-500">可编辑调整每个安排，满意后分享或找搭子</p>
              </div>
              <Link href={`${id}/companions`} className="pill bg-forest-600 px-3.5 py-2 text-[12px] text-white">下一步</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 操作入口 */}
      <div className="no-scrollbar mx-4 mt-4 flex gap-2.5 overflow-x-auto pb-1">
        {trip.status === "planning" && (
          <>
            <ActionChip href={`${id}/companions`} primary icon="🧑‍🤝‍🧑" label={trip.mode === "solo" ? "选择出行方式" : "管理搭子"} />
            <ActionChip href={`/square?highlight=${trip.id}`} icon="📤" label="分享攻略" onClick={() => toast("可先完成行程再发布完整游记，或复制链接分享给好友", "info")} />
            <button
              onClick={() => {
                tripService.updateTrip(trip.id, { status: "ongoing" });
                router.push(`${id}/live`);
              }}
              className="glass flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium text-ink-600 transition active:scale-95"
            >
              🚀 开始行程
            </button>
          </>
        )}
        {trip.status === "ongoing" && (
          <>
            <ActionChip href={`${id}/live`} primary icon="📍" label="行程中" />
            {hasGroup && <ActionChip href={`/group/${groupService.getGroupByTrip(trip.id)!.id}`} icon="👥" label="我的小组" />}
          </>
        )}
        {trip.status === "completed" && (
          <ActionChip href={`${id}/recap`} primary icon="📖" label="游后回顾 · 生成游记" />
        )}
      </div>

      {/* 时间轴 */}
      <div className="mx-4 mt-6">
        {days.map(([day, items]) => (
          <FadeIn key={day} className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lake-600 to-lake-400 text-[13px] font-bold text-white shadow-soft">
                D{day}
              </span>
              <span className="text-[13px] text-ink-300">
                {new Date(new Date(trip.start_date).getTime() + (day - 1) * 86400000).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
              </span>
            </div>

            <div className="relative ml-[21px] border-l-2 border-dashed border-lake-200 pl-5">
              {items.map((poi, i) => (
                <motion.div
                  key={poi.id}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="relative mb-3.5"
                >
                  {/* 时间轴节点 */}
                  <span className={`absolute -left-[27px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-sand-100 ${poi.is_key_point ? "bg-coral-400" : "bg-lake-500"}`} />
                  <div className="glass rounded-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13px] font-bold text-lake-600">{poi.suggested_time}</span>
                          <h3 className="text-[15px] font-semibold text-ink-700">{poi.poi_name}</h3>
                          <TypeTag type={poi.type} />
                          {poi.is_key_point && (
                            <span className="rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-medium text-coral-600">关键时间点</span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[13px] leading-6 text-ink-400">{poi.description}</p>
                      </div>
                      <Link href={`/poi/${poi.id}`} aria-label="场所详情" className="shrink-0 text-ink-300 transition active:scale-90">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </Link>
                    </div>
                    <div className="mt-3 flex gap-4 border-t border-ink-700/5 pt-2.5">
                      <button onClick={() => setEditing(poi)} className="flex items-center gap-1 text-[12px] text-ink-400 transition active:scale-95">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M11 4H4v16h16v-7 M18.5 2.5l3 3L12 15l-4 1 1-4z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        编辑
                      </button>
                      <button
                        onClick={() => regenerateItem(poi)}
                        disabled={regenerating === poi.id}
                        className="flex items-center gap-1 text-[12px] text-lake-600 transition active:scale-95 disabled:opacity-50"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-3.5 w-3.5 ${regenerating === poi.id ? "animate-spin" : ""}`}><path d="M21 12a9 9 0 11-2.6-6.4 M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        {regenerating === poi.id ? "生成中…" : "换一个"}
                      </button>
                      <button
                        onClick={() => {
                          tripService.deletePoi(poi.id);
                          refresh();
                          toast("已删除");
                        }}
                        className="flex items-center gap-1 text-[12px] text-ink-300 transition active:scale-95 hover:text-red-500"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        删除
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        ))}
      </div>

      {/* 编辑弹层 */}
      <AnimatePresence>
        {editing && (
          <EditSheet key={editing.id} poi={editing} onSave={saveEdit} onClose={() => setEditing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionChip({ href, icon, label, primary, onClick }: { href: string; icon: string; label: string; primary?: boolean; onClick?: () => void }) {
  const cls = primary
    ? "bg-gradient-to-br from-coral-500 to-coral-400 text-white shadow-soft"
    : "glass text-ink-600";
  return (
    <Link href={href} onClick={onClick} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition active:scale-95 ${cls}`}>
      {icon} {label}
    </Link>
  );
}

/** 编辑单项底部弹层 */
function EditSheet({ poi, onSave, onClose }: { poi: PoiItem; onSave: (patch: Partial<PoiItem>) => void; onClose: () => void }) {
  const [name, setName] = useState(poi.poi_name);
  const [time, setTime] = useState(poi.suggested_time);
  const [desc, setDesc] = useState(poi.description);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end bg-ink-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-deep mx-auto w-full max-w-md rounded-t-cardlg bg-white/95 p-6 pb-10"
      >
        <h3 className="text-[16px] font-bold text-ink-700">编辑安排</h3>
        <label className="mt-4 block text-[13px] font-medium text-ink-500">名称</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input-base mt-1.5" />
        <label className="mt-3 block text-[13px] font-medium text-ink-500">建议时间</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-base mt-1.5" />
        <label className="mt-3 block text-[13px] font-medium text-ink-500">简介</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="input-base mt-1.5 resize-none" />
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="pill-ghost flex-1 py-3">取消</button>
          <button onClick={() => onSave({ poi_name: name, suggested_time: time, description: desc })} className="pill-primary flex-1 py-3">保存</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
