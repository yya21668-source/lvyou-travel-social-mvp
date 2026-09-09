"use client";

import { Button, FadeCard } from "@/components/ui";
import { ArrowLeft, ArrowRight, Link2, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TripModePage() {
  const [mode, setMode] = useState<"solo"|"buddy"|null>(null);
  return <div className="min-h-dvh px-5 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]"><header className="flex items-center justify-between"><Link href="/trips/yunnan-summer" className="grid size-10 place-items-center rounded-full bg-white"><ArrowLeft size={19}/></Link><span className="text-sm font-bold">选择同行方式</span><span className="w-10"/></header><section className="mt-10"><p className="eyebrow">YOUR WAY</p><h1 className="mt-2 text-4xl font-black leading-tight">这段风景，<br/>想和谁一起看？</h1></section>
    <div className="mt-7 grid gap-4"><FadeCard><button onClick={() => setMode("solo")} className={`w-full rounded-card border-2 p-6 text-left transition ${mode === "solo" ? "border-ink bg-ink text-white" : "border-transparent bg-white"}`}><span className={`grid size-12 place-items-center rounded-2xl ${mode === "solo" ? "bg-white/15" : "bg-sand"}`}><UserRound/></span><h2 className="mt-6 text-2xl font-black">Solo，自由出发</h2><p className={`mt-2 text-sm leading-6 ${mode === "solo" ? "text-white/60" : "text-ink/50"}`}>和自己相处，也随时对新的相遇保持开放。</p></button></FadeCard><FadeCard delay={.08}><button onClick={() => setMode("buddy")} className={`w-full rounded-card border-2 p-6 text-left transition ${mode === "buddy" ? "border-lake-500 bg-lake-500 text-white" : "border-transparent bg-white"}`}><span className={`grid size-12 place-items-center rounded-2xl ${mode === "buddy" ? "bg-white/15" : "bg-lake-300/15 text-lake-500"}`}><UsersRound/></span><h2 className="mt-6 text-2xl font-black">找搭子，一起出发</h2><p className={`mt-2 text-sm leading-6 ${mode === "buddy" ? "text-white/70" : "text-ink/50"}`}>邀请熟悉的朋友，或认识路线与节奏相似的新朋友。</p></button></FadeCard></div>
    {mode === "buddy" && <div className="mt-5 space-y-3"><button className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left"><Link2 className="text-coral"/><span className="flex-1"><b className="text-sm">邀请好友加入</b><small className="block text-ink/40">生成专属邀请链接</small></span><ArrowRight size={18}/></button><Link href="/matches" className="flex w-full items-center gap-3 rounded-2xl bg-white p-4"><UsersRound className="text-lake-500"/><span className="flex-1"><b className="text-sm">浏览相似行程</b><small className="block text-ink/40">在社区寻找同频旅伴</small></span><ArrowRight size={18}/></Link><div className="flex gap-2 rounded-2xl bg-forest-500/10 p-4 text-xs leading-5 text-forest-700"><ShieldCheck className="shrink-0" size={18}/><span>申请通过后，双方还需要查看资料并确认，确认完成才会进入旅行小组。</span></div></div>}
    {mode === "solo" && <Link href="/trips/yunnan-summer/live"><Button className="mt-6 w-full">确认 Solo 出发 <ArrowRight size={18}/></Button></Link>}
  </div>;
}
