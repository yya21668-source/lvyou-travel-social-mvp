"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import GradientBackdrop from "@/components/ui/GradientBackdrop";
import { FadeIn } from "@/components/ui/Common";
import { useToast } from "@/components/ui/Toast";
import { authService } from "@/lib/services/auth.service";
import { tripService } from "@/lib/services/trip.service";
import { groupService } from "@/lib/services/group.service";
import { expenseService, CURRENCY_SYMBOLS, toCNY } from "@/lib/services/expense.service";
import { postService } from "@/lib/services/post.service";
import type { Expense, PoiItem, TripPlan, Visibility } from "@/types";

/**
 * 游后回顾页：AI基于真实行程数据（POI + 花费）生成游记
 * 生成模式：整篇 / 按分类（交通/景点/餐厅/商场）
 * 发布：可见性（公开/仅好友/仅自己）→ posts 表 → 社区feed
 */
const CATEGORIES = [
  { key: "full", label: "整篇游记", icon: "📖" },
  { key: "transport", label: "交通专题", icon: "🚗" },
  { key: "spot", label: "景点专题", icon: "🏞️" },
  { key: "restaurant", label: "餐厅专题", icon: "🍜" },
  { key: "mall", label: "商场专题", icon: "🛍️" },
] as const;

const VISIBILITIES: { key: Visibility; label: string; desc: string }[] = [
  { key: "public", label: "公开", desc: "所有人可见，进入社区广场" },
  { key: "friends", label: "仅好友", desc: "只有关注你的人可见" },
  { key: "private", label: "仅自己", desc: "仅作为私人游记保存" },
];

export default function RecapPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [pois, setPois] = useState<PoiItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notes, setNotes] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [aiSource, setAiSource] = useState<"claude" | "mock" | null>(null);
  const [lastCategory, setLastCategory] = useState<(typeof CATEGORIES)[number]["key"]>("full");

  useEffect(() => {
    const t = tripService.getTrip(id);
    setTrip(t);
    setPois(tripService.getPois(id));
    const group = t ? groupService.getGroupByTrip(t.id) : null;
    if (group) setExpenses(expenseService.getExpenses(group.id));
    if (t && t.status === "ongoing") tripService.updateTrip(t.id, { status: "completed" });
  }, [id]);

  const totalCNY = useMemo(() => expenses.reduce((s, e) => s + toCNY(e.amount, e.currency), 0), [expenses]);
  const expenseLines = useMemo(
    () => expenses.map((e) => `${e.title}：${CURRENCY_SYMBOLS[e.currency]}${e.amount}（约¥${toCNY(e.amount, e.currency).toFixed(0)}）`),
    [expenses]
  );

  if (!trip) {
    return (
      <div className="min-h-dvh bg-sand-100">
        <p className="pt-24 text-center text-sm text-ink-300">行程不存在</p>
      </div>
    );
  }

  async function generate(category: string) {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/recap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          destination: trip!.destination,
          travelType: trip!.travel_type,
          poiNames: pois.map((p) => p.poi_name),
          expenseLines,
          userNotes: notes,
          category: category === "full" ? undefined : category,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error();
      setMarkdown(data.markdown);
      setAiSource(data.source);
      toast("游记初稿已生成，可以编辑后再发布");
    } catch {
      toast("生成失败，请重试", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function publish() {
    if (!markdown.trim()) return;
    setPublishing(true);
    try {
      const me = authService.getCurrentUser();
      if (!me) { router.push("/onboarding"); return; }
      // AI生成卡片摘要（无key时本地降级）
      const sumRes = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      const sumData = await sumRes.json();
      const post = postService.createPost({
        authorId: me.id,
        tripPlanId: trip!.id,
        title: `${trip!.destination}${trip!.travel_type}之旅 · ${CATEGORIES.find((c) => c.key === lastCategory)?.label ?? "游记"}`,
        cover: trip!.cover,
        contentType: lastCategory,
        markdown,
        summary: Array.isArray(sumData.summary) ? sumData.summary : [],
        destination: trip!.destination,
        travelType: trip!.travel_type,
        visibility,
      });
      setPublishing(false);
      setShowPublish(false);
      toast("发布成功，攻略已进入社区 🎉");
      router.push(`/share/${post.id}`);
    } catch {
      setPublishing(false);
      toast("发布失败", "error");
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-sand-100">
      <GradientBackdrop variant="sand" />
      <div className="relative z-10 mx-auto w-full max-w-md px-4 pb-12 pt-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[12px] font-medium tracking-widest text-lake-600">TRIP RECAP · 游后回顾</p>
          <h1 className="mt-1 text-[26px] font-bold text-ink-700">
            {trip.destination}的故事
            <br />
            让AI帮你讲完
          </h1>
        </motion.div>

        {/* 真实数据回顾 */}
        <FadeIn delay={0.05}>
          <div className="glass-deep mt-6 rounded-cardlg p-5">
            <h3 className="text-[14px] font-bold text-ink-700">本次行程数据</h3>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/70 py-3">
                <p className="text-[18px] font-bold text-ink-700">{pois.length}</p>
                <p className="text-[11px] text-ink-300">去过的地方</p>
              </div>
              <div className="rounded-2xl bg-white/70 py-3">
                <p className="text-[18px] font-bold text-ink-700">¥{totalCNY.toFixed(0)}</p>
                <p className="text-[11px] text-ink-300">总花费</p>
              </div>
              <div className="rounded-2xl bg-white/70 py-3">
                <p className="text-[18px] font-bold text-ink-700">{expenses.length}</p>
                <p className="text-[11px] text-ink-300">记账笔数</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pois.slice(0, 8).map((p) => (
                <span key={p.id} className="rounded-full bg-lake-100/70 px-2.5 py-1 text-[11px] text-lake-700">{p.poi_name}</span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 补充心得 */}
        <FadeIn delay={0.1}>
          <div className="glass-deep mt-4 rounded-cardlg p-5">
            <h3 className="text-[14px] font-bold text-ink-700">补充你的心得 <span className="text-[11px] font-normal text-ink-300">（会作为AI素材）</span></h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="旅途中印象最深的事、踩过的坑、想吐槽或想安利的…"
              className="input-base mt-3 resize-none"
            />
          </div>
        </FadeIn>

        {/* 生成模式 */}
        <FadeIn delay={0.15}>
          <div className="mt-4">
            <h3 className="mb-3 text-[14px] font-bold text-ink-700">选择生成方式</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => { setLastCategory(c.key); generate(c.key); }}
                  disabled={generating}
                  className="glass rounded-2xl p-4 text-left transition active:scale-95 disabled:opacity-50"
                >
                  <span className="text-xl">{c.icon}</span>
                  <p className="mt-1.5 text-[13px] font-semibold text-ink-700">{c.label}</p>
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 生成结果（可编辑） */}
        <AnimatePresence>
          {markdown && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-deep mt-4 rounded-cardlg p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-ink-700">游记初稿</h3>
                <span className="text-[10px] text-ink-300">
                  {aiSource === "claude" ? "Claude生成" : "本地演示生成 · 配置API Key后走Claude"}
                </span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={14}
                className="input-base mt-3 resize-none font-mono text-[12px] leading-6"
              />
              <div className="mt-4 flex gap-3">
                <button onClick={() => generate(lastCategory)} className="pill-ghost flex-1 py-3">重新生成</button>
                <button onClick={() => setShowPublish(true)} className="pill-coral flex-1 py-3">发布到社区</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 生成中 */}
      <AnimatePresence>
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink-900/55 backdrop-blur-md">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
            <p className="mt-5 text-[14px] font-medium text-white">AI正在回忆你的旅程…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 发布弹层 */}
      <AnimatePresence>
        {showPublish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-ink-900/45 backdrop-blur-sm" onClick={() => setShowPublish(false)}>
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-deep mx-auto w-full max-w-md rounded-t-cardlg bg-white/95 p-6 pb-10"
            >
              <h3 className="text-[16px] font-bold text-ink-700">发布设置</h3>
              <p className="mt-2 space-y-2">
                {VISIBILITIES.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setVisibility(v.key)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                      visibility === v.key ? "bg-lake-100" : "bg-white/70"
                    }`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${visibility === v.key ? "border-lake-600" : "border-ink-200"}`}>
                      {visibility === v.key && <span className="h-2.5 w-2.5 rounded-full bg-lake-600" />}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[14px] font-medium text-ink-700">{v.label}</span>
                      <span className="block text-[11px] text-ink-300">{v.desc}</span>
                    </span>
                  </button>
                ))}
              </p>
              <button onClick={publish} disabled={publishing} className="pill-coral mt-5 w-full py-3.5 disabled:opacity-60">
                {publishing ? "发布中…" : "确认发布"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
