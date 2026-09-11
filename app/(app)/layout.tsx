"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import { authService } from "@/lib/services/auth.service";

/**
 * 主框架：手机viewport优先（max-w-md 居中），底部导航
 * 未登录用户自动引导至 Onboarding
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authService.getCurrentUser()) {
      router.replace("/onboarding");
    } else {
      setReady(true);
    }
  }, [router]);

  return (
    <div className="min-h-dvh bg-sand-100">
      <div className="relative mx-auto w-full max-w-md min-h-dvh pb-28">
        {ready ? children : (
          <div className="flex h-[60dvh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-lake-200 border-t-lake-600" />
          </div>
        )}
      </div>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
