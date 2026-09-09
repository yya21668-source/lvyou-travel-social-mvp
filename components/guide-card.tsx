import { FadeCard, Avatar } from "@/components/ui";
import type { GuidePost } from "@/types/domain";
import { Heart, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function GuideCard({ guide, index = 0 }: { guide: GuidePost; index?: number }) {
  return <FadeCard delay={(index % 4) * .06} className="mb-4 break-inside-avoid">
    <Link href={`/guides/${guide.id}`} className="block overflow-hidden rounded-glass bg-white shadow-soft">
      <div className={`relative ${index % 3 === 1 ? "aspect-[4/5]" : "aspect-[4/3]"}`}><Image src={guide.image} alt={guide.title} fill sizes="(max-width: 480px) 50vw, 220px" className="object-cover"/>{guide.recruiting && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-coral px-2.5 py-1 text-[10px] font-bold text-white"><Users size={11}/>找搭子</span>}</div>
      <div className="p-3"><p className="text-[10px] font-bold text-lake-500">{guide.destination} · {guide.style}</p><h3 className="mt-1.5 text-sm font-bold leading-5">{guide.title}</h3><div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] text-ink/50"><Avatar label={guide.avatar} className="size-6 text-[10px]"/>{guide.author}</span><span className="flex items-center gap-1 text-[11px] text-ink/45"><Heart size={13}/>{guide.likes}</span></div></div>
    </Link>
  </FadeCard>;
}
