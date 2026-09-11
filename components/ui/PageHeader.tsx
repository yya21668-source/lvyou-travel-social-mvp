"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/** 页面顶部导航（带返回） */
export default function PageHeader({
  title,
  back = true,
  right,
}: {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-sand-100/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 w-full max-w-md items-center px-4">
        {back ? (
          <button
            onClick={() => router.back()}
            aria-label="返回"
            className="-ml-1.5 flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition active:scale-90"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-9" />
        )}
        <h1 className="flex-1 text-center text-[17px] font-bold text-ink-700">{title}</h1>
        <div className="flex w-9 justify-end">{right}</div>
      </div>
    </header>
  );
}

/** 小圆图标按钮（右上角） */
export function HeaderIconButton({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-ink-600 transition active:scale-90">
      {children}
    </Link>
  );
}
