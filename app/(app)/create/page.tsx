"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import GradientBackdrop from "@/components/ui/GradientBackdrop";
import { useToast } from "@/components/ui/Toast";
import { authService } from "@/lib/services/auth.service";
import { tripService } from "@/lib/services/trip.service";
import type { AiItineraryResult, TravelType } from "@/types";

/**
 * AI行程创建流程：表单式 / 对话式 二选一
 * 生成：POST /api/ai/itinerary（Claude JSON，无key时本地mock降级）
 */
const TRAVEL_TYPES: TravelType[] = ["徒步", "穷游", "度假", "其他"];
const HOT_DESTINATIONS = ["大理", "成都", "重庆", "西安", "青岛", "厦门", "京都", "清迈", "四姑娘山"];

const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<"form" | "chat">("form");
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  /* ---------- 表单态 ---------- */
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(addDays(3));
  const [endDate, setEndDate] = useState(addDays(5));
  const [travelType, setTravelType] = useState<TravelType>("度假");
  const [notes, setNotes] = useState("");

  const days = Math.max(
    1,
    Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1
  );

  /* ---------- 对话态 ---------- */
  type ChatMsg = { role: "ai" | "user"; text: string };
  const [chat, setChat] = useState<ChatMsg[]>([
    { role: "ai", text: "嗨～我是旅遇AI规划师 ✨ 想去哪儿玩？直接告诉我目的地就行，比如「下个月想去大理躺三天」" },
  ]);
  const [chatInput, setChatInput] = useState("");
  // 对话中抽取的参数
  const [chatCtx, setChatCtx] = useState<{ destination?: string; days?: number; travelType?: TravelType }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function generate(input: { destination: string; days: number; travelType: TravelType; startDate: string; notes?: string }) {
    setGenerating(true);
    setGenStep(0);
    const timer = setInterval(() => setGenStep((s) => Math.min(s + 1, 3)), 900);
    try {
      const res = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as AiItineraryResult & { error?: string };
      if (data.error || !data.days) throw new Error(data.error ?? "生成失败");

      const me = authService.getCurrentUser();
      if (!me) {
        router.push("/onboarding");
        return;
      }
      const endDate = new Date(new Date(input.startDate).getTime() + (input.days - 1) * 86400000)
        .toISOString()
        .slice(0, 10);
      const trip = tripService.createTripFromAi(
        me.id,
        { ...input, endDate },
        data.days
      );
      clearInterval(timer);
      router.push(`/trip/${trip.id}?created=1`);
    } catch (err) {
      clearInterval(timer);
      setGenerating(false);
      toast("生成失败，请稍后重试", "error");
    }
  }

  function submitForm() {
    if (!destination.trim()) {
      toast("先填个目的地吧", "error");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast("结束日期不能早于出发日期", "error");
      return;
    }
    generate({ destination: destination.trim(), days, travelType, startDate, notes: notes.trim() || undefined });
  }

  /* ---------- 对话式：轻量意图抽取（MVP演示，V2走Claude多轮对话） ---------- */
  function extractIntent(text: string): { destination?: string; days?: number; travelType?: TravelType } {
    const next = { ...chatCtx };
    const destMatch = text.match(/去([\u4e00-\u9fa5A-Za-z]{2,6}?)(玩|旅|游|躺|走|出发|，|,|。|$)/);
    if (destMatch) next.destination = destMatch[1];
    const dayMatch = text.match(/(\d+)\s*天/);
    if (dayMatch) next.days = Math.min(Number(dayMatch[1]), 10);
    if (text.includes("徒步") || text.includes("爬山") || text.includes("登山")) next.travelType = "徒步";
    else if (text.includes("穷游") || text.includes("省钱") || text.includes("特种兵")) next.travelType = "穷游";
    else if (text.includes("度假") || text.includes("躺") || text.includes("休闲") || text.includes("放松")) next.travelType = "度假";
    return next;
  }

  function sendChat(text?: string) {
    const content = (text ?? chatInput).trim();
    if (!content) return;
    setChat((c) => [...c, { role: "user", text: content }]);
    setChatInput("");

    const ctx = extractIntent(content);
    setChatCtx(ctx);

    setTimeout(() => {
      if (!ctx.destination) {
        setChat((c) => [...c, { role: "ai", text: "好嘞！去哪儿呀？可以直接说目的地，比如「大理」「京都」「四姑娘山」" }]);
      } else if (!ctx.days) {
        setChat((c) => [...c, { role: "ai", text: `${ctx.destination}好选择！打算玩几天？（1-10天都行）` }]);
      } else if (!ctx.travelType) {
        setChat((c) => [...c, { role: "ai", text: `收到～${ctx.destination}${ctx.days}天。想要什么旅行风格？` }]);
      } else {
        setChat((c) => [...c, { role: "ai", text: `明白了：${ctx.destination} · ${ctx.days}天 · ${ctx.travelType}风格，AI这就开始规划行程 ✨` }]);
        setTimeout(() => {
          generate({ destination: ctx.destination!, days: ctx.days!, travelType: ctx.travelType!, startDate: addDays(3) });
        }, 700);
      }
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 450);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <GradientBackdrop variant="sand" />
      <div className="relative z-10 mx-auto w-full max-w-md px-5 pb-32 pt-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[26px] font-bold text-ink-700">AI 行程规划师</h1>
          <p className="mt-1 text-[13px] text-ink-300">告诉我你的想法，可视化攻略一分钟后见</p>
        </motion.div>

        {/* 模式切换 */}
        <div className="glass mt-5 flex rounded-full p-1">
          {(["form", "chat"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`relative flex-1 rounded-full py-2.5 text-[14px] font-medium transition ${
                mode === m ? "text-white" : "text-ink-500"
              }`}
            >
              {mode === m && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-lake-600 to-lake-400 shadow-soft"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{m === "form" ? "📝 表单式" : "💬 对话式"}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="glass-deep mt-5 rounded-cardlg p-5"
            >
              <label className="text-[13px] font-medium text-ink-500">目的地</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="想去哪里？"
                className="input-base mt-2"
              />
              <div className="mt-2.5 flex flex-wrap gap-2">
                {HOT_DESTINATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDestination(d)}
                    className={`rounded-full px-3 py-1.5 text-[12px] transition active:scale-95 ${
                      destination === d
                        ? "bg-lake-600 text-white"
                        : "bg-white/70 text-ink-500 hover:bg-lake-100"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <label className="mt-5 block text-[13px] font-medium text-ink-500">
                出行日期 <span className="text-ink-300">（共 {days} 天）</span>
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input type="date" value={startDate} min={todayStr()} onChange={(e) => setStartDate(e.target.value)} className="input-base flex-1 px-3 py-2.5 text-[13px]" />
                <span className="text-ink-300">→</span>
                <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="input-base flex-1 px-3 py-2.5 text-[13px]" />
              </div>

              <label className="mt-5 block text-[13px] font-medium text-ink-500">旅行形式</label>
              <div className="mt-2 flex gap-2">
                {TRAVEL_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTravelType(t)}
                    className={`flex-1 rounded-2xl py-2.5 text-[13px] font-medium transition active:scale-95 ${
                      travelType === t
                        ? "bg-gradient-to-br from-forest-600 to-forest-400 text-white shadow-soft"
                        : "bg-white/70 text-ink-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <label className="mt-5 block text-[13px] font-medium text-ink-500">
                偏好补充 <span className="text-ink-300">（可选）</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="比如：想看日出、不吃辣、预算3k、带爸妈…"
                rows={3}
                className="input-base mt-2 resize-none"
              />

              <button onClick={submitForm} disabled={generating} className="pill-coral mt-6 w-full py-4 text-[16px] disabled:opacity-60">
                ✨ AI 生成行程
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="glass-deep mt-5 flex h-[58dvh] flex-col rounded-cardlg p-4"
            >
              <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto">
                {chat.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-6 ${
                        m.role === "user"
                          ? "rounded-br-md bg-gradient-to-br from-lake-600 to-lake-400 text-white"
                          : "rounded-bl-md bg-white/85 text-ink-600"
                      }`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {!chatCtx.travelType && (
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  {["去大理躺平", "徒步四姑娘山4天", "穷游重庆3天"].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendChat(q)}
                      className="shrink-0 rounded-full bg-lake-100 px-3.5 py-2 text-[12px] font-medium text-lake-700 transition active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="说说你的旅行想法…"
                  className="input-base flex-1 rounded-full py-2.5"
                />
                <button
                  onClick={() => sendChat()}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-lake-600 to-lake-400 text-white shadow-soft transition active:scale-90"
                  aria-label="发送"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 生成中遮罩 */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink-900/60 backdrop-blur-md"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="h-32 w-32"
              >
                <svg viewBox="0 0 120 120" className="h-full w-full">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  <path d="M38 72c6-18 22-28 38-24-2 14-12 26-26 30-6 2-10-2-12-6z" fill="#F6F3EA" opacity="0.9" />
                  <circle cx="72" cy="46" r="5" fill="#FF8B6B" />
                </svg>
              </motion.div>
              <svg viewBox="0 0 24 24" className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-twinkle"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#fff" /></svg>
            </div>
            <div className="mt-8 h-6 text-center text-[15px] font-medium text-white">
              <AnimatePresence mode="wait">
                <motion.div key={genStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {["正在理解你的旅行心愿…", "搜索目的地好玩的地方…", "安排每日节奏与动线…", "行程马上就好…"][genStep]}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-white/20">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                className="h-full w-1/2 rounded-full bg-white/80"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
