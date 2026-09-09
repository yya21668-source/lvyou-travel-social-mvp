"use client";

import { Button } from "@/components/ui";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTripPage() {
  const router = useRouter(); const [mode, setMode] = useState<"chat"|"form">("chat"); const [value, setValue] = useState(""); const [loading, setLoading] = useState(false); const [style, setStyle] = useState("度假");
  const generate = async () => { setLoading(true); try { await fetch("/api/ai/itinerary", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ destination: value || "大理", style }) }); } finally { setTimeout(() => router.push("/trips/yunnan-summer"), 650); } };
  return <div className="relative min-h-dvh overflow-hidden px-5 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]"><div className="absolute -right-24 top-32 size-64 rounded-full bg-lake-300/25 blur-3xl"/>
    <header className="relative flex items-center justify-between"><Link href="/discover" className="grid size-10 place-items-center rounded-full bg-white"><ArrowLeft size={19}/></Link><span className="text-sm font-bold">创建旅程</span><span className="rounded-full bg-lake-300/20 px-3 py-1 text-[10px] font-bold text-lake-500">AI POWERED</span></header>
    <section className="relative mt-10"><span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-lake-500 to-forest-500 text-white"><Sparkles/></span><h1 className="mt-5 text-4xl font-black leading-tight tracking-tight">你想把下一段<br/>故事写在哪里？</h1><p className="mt-3 text-sm leading-6 text-ink/50">给我一点线索，剩下的路线、节奏和惊喜交给我。</p></section>
    <div className="relative mt-7 flex rounded-full bg-ink/5 p-1"><button onClick={() => setMode("chat")} className={`pill flex flex-1 items-center justify-center gap-2 ${mode === "chat" ? "bg-white shadow-sm" : "text-ink/45"}`}><MessageCircle size={16}/>对话创建</button><button onClick={() => setMode("form")} className={`pill flex flex-1 items-center justify-center gap-2 ${mode === "form" ? "bg-white shadow-sm" : "text-ink/45"}`}><SlidersHorizontal size={16}/>快捷表单</button></div>
    {mode === "chat" ? <div className="relative mt-5"><div className="glass rounded-card p-5"><p className="text-sm font-semibold">旅遇 AI</p><p className="mt-2 text-sm leading-6 text-ink/60">嗨，先告诉我：你想去哪里、什么时候出发，以及更喜欢怎样的旅行？</p></div><textarea value={value} onChange={e => setValue(e.target.value)} className="mt-4 min-h-32 w-full resize-none rounded-card border border-white bg-white/75 p-5 text-sm leading-6 outline-none focus:ring-2 focus:ring-lake-300" placeholder="例如：9 月去大理玩 4 天，想轻松一点，喜欢骑行、咖啡和看日落……"/></div> : <div className="glass relative mt-5 space-y-4 rounded-card p-5"><Field icon={<MapPin size={17}/>} label="目的地"><input value={value} onChange={e => setValue(e.target.value)} placeholder="大理" className="w-full bg-transparent outline-none"/></Field><Field icon={<CalendarDays size={17}/>} label="出行时间"><input type="date" defaultValue="2026-09-18" className="w-full bg-transparent outline-none"/></Field><div><p className="mb-2 text-xs font-bold text-ink/55">旅行形式</p><div className="flex flex-wrap gap-2">{["徒步","穷游","度假","其他"].map(s => <button key={s} onClick={() => setStyle(s)} className={`pill ${style === s ? "bg-ink text-white" : "bg-white"}`}>{s}</button>)}</div></div></div>}
    <Button onClick={generate} disabled={loading} className="relative mt-5 w-full bg-coral hover:bg-coral">{loading ? "正在编织路线…" : <><Sparkles size={18}/>生成我的奇妙行程</>}</Button>
    <p className="mt-3 text-center text-[11px] text-ink/35">AI 生成内容仅供参考，出发前请确认开放时间与交通信息</p>
  </div>;
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) { return <label className="flex items-center gap-3 rounded-2xl bg-white p-4"><span className="text-lake-500">{icon}</span><span className="w-16 text-xs font-bold text-ink/50">{label}</span>{children}</label>; }
