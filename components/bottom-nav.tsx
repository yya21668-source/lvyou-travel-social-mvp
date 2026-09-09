"use client";

import Link from "next/link";
import { Compass, Map, Plus, Sparkles, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/discover", label: "发现", icon: Compass },
  { href: "/square", label: "广场", icon: Sparkles },
  { href: "/trips/new", label: "创建", icon: Plus, primary: true },
  { href: "/trips/yunnan-summer", label: "行程", icon: Map },
  { href: "/profile", label: "我的", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();
  return <nav className="fixed bottom-3 left-1/2 z-40 flex w-[calc(100%-24px)] max-w-[456px] -translate-x-1/2 items-center justify-around rounded-full border border-white/80 bg-white/80 px-2 pb-[max(.55rem,env(safe-area-inset-bottom))] pt-2 shadow-glass backdrop-blur-xl">
    {items.map(({ href, label, icon: Icon, primary }) => {
      const active = pathname === href || (href !== "/discover" && pathname.startsWith(href));
      return <Link key={href} href={href} className="flex min-w-14 flex-col items-center gap-1 text-[10px] font-medium text-ink/55">
        <span className={`grid size-9 place-items-center rounded-full transition ${primary ? "-mt-5 size-12 bg-coral text-white shadow-lg" : active ? "bg-ink text-white" : ""}`}><Icon size={primary ? 22 : 19} strokeWidth={2}/></span>
        <span className={active ? "text-ink" : ""}>{label}</span>
      </Link>;
    })}
  </nav>;
}
