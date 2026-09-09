"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Compass, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const slides = [
  { icon: Sparkles, tag: "HELLO, WORLD", title: "旅行，遇见你的\n奇妙朋友", copy: "不只抵达一个地方，也抵达一段意料之外的关系。", gradient: "from-lake-500 via-lake-300 to-[#d7d5a4]" },
  { icon: Compass, tag: "AI TRIP MAKER", title: "一句话，长出一段\n有生命的旅程", copy: "告诉 AI 你想去哪里，把更多时间留给真实的风景。", gradient: "from-forest-700 via-forest-500 to-lake-300" },
  { icon: UsersRound, tag: "MEET & GO", title: "同频的人，刚好也\n在去往那里", copy: "Solo 或结伴都自由。先确认，再同行，每段关系都有安全边界。", gradient: "from-[#dba878] via-coral to-lake-300" },
];

export default function OnboardingPage() {
  const [index, setIndex] = useState(0); const slide = slides[index]; const Icon = slide.icon;
  return <div className={`grain relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-br ${slide.gradient} p-6 text-white transition-colors duration-700`}>
    <div className="absolute -right-20 top-24 size-64 rounded-full bg-white/15 blur-2xl"/><div className="absolute -left-20 bottom-28 size-56 rounded-full bg-forest-700/20 blur-3xl"/>
    <header className="relative z-10 flex items-center justify-between"><span className="text-xl font-black tracking-tight">旅遇<span className="text-coral">.</span></span><Link href="/login" className="text-sm text-white/80">跳过</Link></header>
    <div className="relative z-10 flex flex-1 items-center">
      <AnimatePresence mode="wait"><motion.section key={index} initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: .4 }}>
        <span className="mb-8 grid size-16 place-items-center rounded-[22px] border border-white/30 bg-white/20 backdrop-blur-xl"><Icon size={30}/></span>
        <p className="mb-3 text-xs font-bold tracking-[.22em] text-white/70">{slide.tag}</p>
        <h1 className="whitespace-pre-line text-[42px] font-black leading-[1.08] tracking-[-.04em]">{slide.title}</h1>
        <p className="mt-6 max-w-sm text-base leading-7 text-white/80">{slide.copy}</p>
      </motion.section></AnimatePresence>
    </div>
    <footer className="relative z-10 flex items-center justify-between pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex gap-2">{slides.map((_, i) => <span key={i} className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-2 bg-white/40"}`}/>)}</div>
      {index < 2 ? <button onClick={() => setIndex(index + 1)} className="grid size-14 place-items-center rounded-full bg-white text-ink shadow-lg"><ArrowRight/></button> : <Link href="/login" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-7 font-bold text-ink shadow-lg">开始旅遇 <ArrowRight size={19}/></Link>}
    </footer>
  </div>;
}
