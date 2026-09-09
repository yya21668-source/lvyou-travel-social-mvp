import { GuideCard } from "@/components/guide-card";
import { Avatar, FadeCard } from "@/components/ui";
import { guides } from "@/mocks/data";
import { ArrowUpRight, Bell, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DiscoverPage() {
  return <div className="pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
    <header className="page-pad flex items-center justify-between"><div><p className="text-xs text-ink/45">下午好，陈曦</p><h1 className="mt-1 text-2xl font-black">想去哪里透透气？</h1></div><div className="flex items-center gap-2"><button className="grid size-10 place-items-center rounded-full bg-white shadow-sm"><Bell size={18}/></button><Avatar label="曦"/></div></header>
    <div className="page-pad mt-6"><FadeCard><Link href="/trips/new" className="grain relative block overflow-hidden rounded-card bg-gradient-to-br from-lake-500 via-lake-300 to-forest-500 p-6 text-white shadow-glass">
      <div className="absolute -right-10 -top-12 size-40 rounded-full bg-white/20 blur-xl"/><Sparkles className="mb-10" size={28}/><p className="text-xs font-bold tracking-[.18em] text-white/70">AI TRIP MAKER</p><h2 className="mt-2 max-w-[280px] text-[28px] font-black leading-tight">把想去的地方，变成一段旅程</h2><div className="mt-6 flex items-center justify-between"><span className="rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur">和 AI 聊聊你的期待</span><span className="grid size-11 place-items-center rounded-full bg-white text-ink"><ArrowUpRight/></span></div>
    </Link></FadeCard></div>
    <section className="mt-8"><div className="page-pad mb-4 flex items-end justify-between"><div><p className="eyebrow">DISCOVER</p><h2 className="mt-1 text-2xl font-black">灵感正在发生</h2></div><Link href="/square" className="text-xs font-bold text-lake-500">查看全部</Link></div>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto px-5 pb-4">{["为你推荐", "大理", "成都", "徒步", "周末出发"].map((item, i) => <span key={item} className={`pill shrink-0 ${i === 0 ? "bg-ink text-white" : "bg-white"}`}>{item}</span>)}</div>
      <div className="columns-2 gap-3 px-4">{guides.map((g, i) => <GuideCard key={g.id} guide={g} index={i}/>)}</div>
    </section>
    <div className="mx-5 mt-3 flex items-center gap-3 rounded-glass bg-forest-700 p-4 text-white"><span className="grid size-11 place-items-center rounded-full bg-white/15"><MapPin size={20}/></span><div className="flex-1"><p className="text-sm font-bold">附近也有新鲜事</p><p className="mt-1 text-xs text-white/60">看看 3km 内正在发生的旅遇</p></div><ArrowUpRight size={18}/></div>
  </div>;
}
