import { TripTimeline } from "@/components/trip-timeline";
import { demoTrip } from "@/mocks/data";
import { ArrowLeft, CalendarDays, MapPin, Share2, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";

export default function TripPage() {
  return <div className="pb-8"><div className="grain relative overflow-hidden bg-gradient-to-br from-lake-500 to-forest-700 px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] text-white"><div className="flex items-center justify-between"><Link href="/discover" className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur"><ArrowLeft size={19}/></Link><span className="text-sm font-bold">我的行程</span><Link href="/guides/dali-wind" className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur"><Share2 size={18}/></Link></div><div className="mt-12"><p className="text-xs font-bold tracking-[.18em] text-white/60">NEXT ADVENTURE</p><h1 className="mt-2 text-4xl font-black">风从大理来</h1><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/15 px-3 py-2"><MapPin size={13} className="mr-1 inline"/>云南 · 大理</span><span className="rounded-full bg-white/15 px-3 py-2"><CalendarDays size={13} className="mr-1 inline"/>9.18–9.21</span><span className="rounded-full bg-white/15 px-3 py-2">度假</span></div></div></div>
    <div className="page-pad -mt-1 pt-7"><div className="mb-7 grid grid-cols-2 gap-3"><Link href="/trips/yunnan-summer/mode" className="rounded-glass bg-coral p-4 text-white shadow-soft"><UsersRound/><p className="mt-5 text-sm font-bold">选择同行方式</p><p className="mt-1 text-[11px] text-white/70">Solo 或遇见搭子</p></Link><button className="rounded-glass bg-white p-4 text-left shadow-soft"><Sparkles className="text-lake-500"/><p className="mt-5 text-sm font-bold">AI 优化路线</p><p className="mt-1 text-[11px] text-ink/40">避开拥挤，更顺路</p></button></div><TripTimeline initialDays={demoTrip.days} editable/></div>
  </div>;
}
