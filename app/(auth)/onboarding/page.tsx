"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GradientBackdrop from "@/components/ui/GradientBackdrop";

/**
 * Onboarding：3屏理念展示 + 手机号/邮箱登录注册
 * 微信登录：MVP阶段mock，V2需接入微信开放平台OAuth
 */
const SCREENS = [
  {
    title: "旅行，遇见你的\n奇妙朋友",
    sub: "有些相遇，只发生在路上",
    icon: (
      <svg viewBox="0 0 120 120" className="h-36 w-36 drop-shadow-xl">
        <circle cx="60" cy="60" r="52" fill="rgba(255,255,255,0.18)" />
        <circle cx="60" cy="60" r="38" fill="rgba(255,255,255,0.22)" />
        <path d="M38 72c6-18 22-28 38-24-2 14-12 26-26 30-6 2-10-2-12-6z" fill="#F6F3EA" opacity="0.95" />
        <circle cx="72" cy="46" r="5" fill="#FF8B6B" />
        <path d="M50 44l1.5 4.5L56 50l-4.5 1.5L50 56l-1.5-4.5L44 50l4.5-1.5z" fill="#fff" />
        <path d="M78 66l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#fff" opacity="0.9" />
      </svg>
    ),
  },
  {
    title: "AI帮你规划\n每一程惊喜",
    sub: "说走就走的目的地，一键生成可视化攻略",
    icon: (
      <svg viewBox="0 0 120 120" className="h-36 w-36 drop-shadow-xl">
        <rect x="18" y="30" width="84" height="64" rx="14" fill="rgba(255,255,255,0.18)" />
        <rect x="28" y="42" width="30" height="8" rx="4" fill="#fff" opacity="0.85" />
        <rect x="28" y="58" width="52" height="6" rx="3" fill="#fff" opacity="0.6" />
        <rect x="28" y="70" width="40" height="6" rx="3" fill="#fff" opacity="0.6" />
        <circle cx="88" cy="46" r="8" fill="#FF8B6B" />
        <path d="M84 46l3 3 5-6" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "独行的自由\n或同行的热闹",
    sub: "Solo出发，或遇见你的旅行搭子与地陪",
    icon: (
      <svg viewBox="0 0 120 120" className="h-36 w-36 drop-shadow-xl">
        <circle cx="46" cy="46" r="16" fill="#F6F3EA" opacity="0.95" />
        <circle cx="78" cy="58" r="13" fill="#fff" opacity="0.9" />
        <path d="M26 88c4-14 14-22 28-22 5 0 9 1 13 3" stroke="#F6F3EA" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.95" />
        <path d="M64 90c3-10 10-16 20-16 4 0 8 1 11 3" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M92 34l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#FF8B6B" />
      </svg>
    ),
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [screen, setScreen] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoginScreen = useMemo(() => screen >= SCREENS.length, [screen]);

  async function handleLogin(method: "identifier" | "wechat") {
    setLoading(true);
    // MVP阶段mock：本地session；V2需接入 Supabase Auth / 微信OAuth
    const { authService } = await import("@/lib/services/auth.service");
    await new Promise((r) => setTimeout(r, 600));
    if (method === "wechat") {
      authService.signInWithWechat();
    } else {
      if (!/^1\d{10}$/.test(identifier) && !/^\S+@\S+\.\S+$/.test(identifier)) {
        setLoading(false);
        return;
      }
      authService.signIn(identifier);
    }
    router.replace("/");
  }

  const current = isLoginScreen ? null : SCREENS[screen];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-sand-100">
      <GradientBackdrop variant={isLoginScreen ? "sand" : "hero"} />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-8">
        {!isLoginScreen ? (
          <>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen}
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center"
                >
                  {current!.icon}
                  <h1 className="mt-10 whitespace-pre-line text-[32px] font-bold leading-snug text-white drop-shadow-md">
                    {current!.title}
                  </h1>
                  <p className="mt-4 text-[15px] font-light tracking-wide text-white/85">{current!.sub}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pb-14">
              <div className="mb-8 flex justify-center gap-2">
                {SCREENS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === screen ? "w-7 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setScreen((s) => s + 1)}
                className="w-full rounded-full bg-white/95 py-4 text-[16px] font-semibold text-forest-600 shadow-glass-lg transition active:scale-[0.97]"
              >
                {screen === SCREENS.length - 1 ? "开始遇见" : "下一步"}
              </button>
              {screen < SCREENS.length - 1 && (
                <button
                  onClick={() => setScreen(SCREENS.length)}
                  className="mt-3 w-full py-2 text-sm font-light text-white/75"
                >
                  跳过
                </button>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col justify-center"
          >
            <div className="mb-2 text-[13px] font-medium tracking-widest text-lake-600">LÜYU · 旅遇</div>
            <h1 className="text-[28px] font-bold leading-tight text-ink-700">
              登录 / 注册
              <span className="ml-2 align-middle text-[13px] font-normal text-ink-300">遇见你的奇妙朋友</span>
            </h1>

            <div className="glass-deep mt-10 rounded-cardlg p-6">
              <label className="text-[13px] font-medium text-ink-500">手机号 / 邮箱</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="输入手机号或邮箱"
                className="input-base mt-2"
                inputMode="email"
              />
              <label className="mt-4 block text-[13px] font-medium text-ink-500">
                验证码
                <span className="ml-2 text-[11px] font-normal text-ink-300">（MVP演示：任意4位数字）</span>
              </label>
              <div className="mt-2 flex gap-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="4位验证码"
                  className="input-base flex-1"
                  inputMode="numeric"
                />
                <button className="pill-ghost shrink-0 px-4 text-[13px] text-lake-600">
                  获取验证码
                </button>
              </div>

              <button
                disabled={loading}
                onClick={() => handleLogin("identifier")}
                className="mt-6 w-full rounded-full bg-gradient-to-br from-lake-600 to-lake-400 py-4 text-[16px] font-semibold text-white shadow-glass transition active:scale-[0.97] disabled:opacity-60"
              >
                {loading ? "登录中…" : "登录 / 注册"}
              </button>

              <div className="my-5 flex items-center gap-3 text-[11px] text-ink-300">
                <span className="h-px flex-1 bg-ink-700/10" />
                或
                <span className="h-px flex-1 bg-ink-700/10" />
              </div>

              {/* 微信登录：MVP阶段mock，V2需接入微信开放平台OAuth */}
              <button
                disabled={loading}
                onClick={() => handleLogin("wechat")}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#07C160] py-3.5 text-[15px] font-semibold text-white shadow-soft transition active:scale-[0.97]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M9.3 4C5.3 4 2 6.7 2 10c0 1.9 1 3.5 2.6 4.6l-.7 2.1 2.4-1.2c.6.2 1.2.3 1.9.4A5.6 5.6 0 0 1 8 14.2c0-3 3-5.4 6.6-5.4h.6C14.5 6.1 12.1 4 9.3 4zM7 8.2a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8zm4.6 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8zM16 9.6c-3.3 0-6 2.2-6 5s2.7 5 6 5c.7 0 1.4-.1 2-.3l2 1-0.6-1.8A5.4 5.4 0 0 0 22 14.6c0-2.8-2.7-5-6-5zm-2.2 3.4a.8.8 0 1 1 0-1.5.8.8 0 0 1 0 1.5zm4.4 0a.8.8 0 1 1 0-1.5.8.8 0 0 1 0 1.5z" />
                </svg>
                微信一键登录（演示）
              </button>
            </div>

            <p className="mt-6 text-center text-[11px] leading-5 text-ink-300">
              登录即同意《用户协议》与《隐私政策》
              <br />
              未成年人请在监护人陪同下使用实名认证功能
            </p>
            <button onClick={() => setScreen(0)} className="mt-4 text-center text-[13px] text-lake-600">
              返回
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
