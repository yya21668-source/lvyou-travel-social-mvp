"use client";

import { GuideCard } from "@/components/guide-card";
import { guides } from "@/mocks/data";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

const filters = ["全部", "找搭子", "徒步", "穷游", "度假"];
export default function SquarePage() {
  const [filter, setFilter] = useState("全部"); const [query, setQuery] = useState("");
  const shown = useMemo(() => guides.filter(g => (filter === "全部" || (filter === "找搭子" ? g.recruiting : g.style === filter)) && (!query || `${g.destination}${g.title}`.includes(query))), [filter, query]);
  return <div className="pt-[max(1.5rem,env(safe-area-inset-top))]"><header className="page-pad"><p className="eyebrow">COMMUNITY</p><h1 className="mt-2 text-3xl font-black">去同一片远方的人</h1><p className="mt-2 text-sm text-ink/50">交换灵感，也找到同频旅伴。</p></header>
    <div className="page-pad mt-6"><div className="glass flex h-13 items-center gap-3 rounded-full px-4 py-3"><Search size={18} className="text-ink/40"/><input value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="搜索目的地或攻略"/><SlidersHorizontal size={18}/></div></div>
    <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto px-5 pb-5">{filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`pill shrink-0 ${filter === f ? "bg-ink text-white" : "bg-white"}`}>{f}</button>)}</div>
    <div className="columns-2 gap-3 px-4">{shown.map((g, i) => <GuideCard key={g.id} guide={g} index={i}/>)}</div>{!shown.length && <p className="py-20 text-center text-sm text-ink/45">换个关键词看看吧</p>}
  </div>;
}
