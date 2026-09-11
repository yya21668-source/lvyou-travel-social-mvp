"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * 底部导航栏：当前选中项用深墨绿圆形背景高亮图标，其余为线性图标
 */
const ICONS = {
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13.7 13.7 8.5 15.5l1.8-5.2z" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-7 w-7">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  companions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 19c.8-3.2 2.8-4.8 5.5-4.8s4.7 1.6 5.5 4.8M14.2 14.7c2.9-.8 5.3.7 6.3 3.8" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c1.5-3.5 4.2-5 7.5-5s6 1.5 7.5 5" />
    </svg>
  ),
};

const TABS = [
  { href: "/", label: "发现", icon: ICONS.compass, section: "home" },
  { href: "/square", label: "广场", icon: ICONS.square, section: "square" },
  { href: "/create", label: "创建", icon: ICONS.plus, center: true, section: "create" },
  { href: "/square?tab=recruit", label: "搭子", icon: ICONS.companions, section: "companions" },
  { href: "/profile", label: "我的", icon: ICONS.user, section: "profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const squareTab = searchParams.get("tab");

  const isActive = (section: string) => {
    if (section === "home") return pathname === "/";
    if (section === "square") return pathname === "/square" && squareTab !== "recruit" && squareTab !== "mine";
    if (section === "companions") return pathname === "/square" && (squareTab === "recruit" || squareTab === "mine");
    return pathname.startsWith(`/${section}`);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="glass-deep mx-4 mb-1 flex w-full max-w-md items-center justify-around rounded-full px-3 py-2">
        {TABS.map((tab) => {
          const active = isActive(tab.section);
          if (tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label="AI创建行程"
                className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-coral-500 to-coral-400 text-white shadow-glass-lg ring-4 ring-sand-100 transition active:scale-90"
              >
                {tab.icon}
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition ${
                active ? "text-ink-700" : "text-ink-300"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  active ? "bg-ink-700 text-sand-100" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span className={`text-[10px] ${active ? "font-semibold" : ""}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
