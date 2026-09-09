"use client";

import type { TripDay } from "@/types/domain";
import { Clock3, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function TripTimeline({ initialDays, editable = false }: { initialDays: TripDay[]; editable?: boolean }) {
  const [days, setDays] = useState(initialDays);
  const remove = (dayIndex: number, id: string) => setDays(days.map((d, i) => i === dayIndex ? { ...d, items: d.items.filter(item => item.id !== id) } : d));
  return <div className="space-y-8">{days.map((day, dayIndex) => <section key={day.date}><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">DAY {dayIndex + 1} · {day.date}</p><h2 className="mt-1 text-xl font-black">{day.title}</h2></div><span className="text-xs text-ink/35">{day.items.length} 站</span></div><div className="relative ml-3 border-l border-dashed border-lake-500/30 pl-6">{day.items.map((item, index) => <article key={item.id} className="relative mb-4 rounded-glass bg-white p-4 shadow-soft"><span className="absolute -left-[31px] top-5 size-3 rounded-full border-[3px] border-sand bg-lake-500 ring-2 ring-lake-500/20"/><div className="flex items-start justify-between"><div><span className="flex items-center gap-1 text-[11px] font-bold text-coral"><Clock3 size={12}/>{item.suggested_time}</span><Link href={`/places/${item.id}`}><h3 className="mt-1 text-base font-bold">{item.poi_name}</h3></Link><span className="mt-1 inline-block rounded-full bg-lake-300/15 px-2 py-1 text-[10px] font-bold text-lake-500">{item.type}</span></div>{editable && <div className="flex gap-1"><button title="重新生成" className="grid size-8 place-items-center rounded-full bg-sand text-forest-500"><Sparkles size={14}/></button><button title="删除" onClick={() => remove(dayIndex, item.id)} className="grid size-8 place-items-center rounded-full bg-sand text-coral"><Trash2 size={14}/></button></div>}</div><p className="mt-3 text-sm leading-6 text-ink/55">{item.description}</p>{!editable && <MoreHorizontal className="mt-2 text-ink/25" size={18}/>}</article>)}</div></section>)}</div>;
}
