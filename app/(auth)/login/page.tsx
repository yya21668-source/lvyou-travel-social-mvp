"use client";

import { Button } from "@/components/ui";
import { ArrowLeft, BadgeCheck, Mail, MessageCircle, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [method, setMethod] = useState<"phone" | "email">("phone");
  return <div className="relative min-h-dvh overflow-hidden px-6 pb-10 pt-8">
    <div className="absolute -right-24 -top-24 size-72 rounded-full bg-lake-300/35 blur-3xl"/><div className="absolute -bottom-24 -left-20 size-72 rounded-full bg-coral/20 blur-3xl"/>
    <Link href="/onboarding" className="relative grid size-10 place-items-center rounded-full bg-white/70"><ArrowLeft size={19}/></Link>
    <section className="relative mt-14"><p className="eyebrow">WELCOME ABOARD</p><h1 className="mt-3 text-4xl font-black tracking-tight">下一站，去遇见。</h1><p className="mt-3 text-sm leading-6 text-ink/55">登录后保存你的路线，也让同频的旅行者找到你。</p></section>
    <section className="glass relative mt-10 rounded-card p-5">
      <div className="mb-5 flex rounded-full bg-ink/5 p-1"><button onClick={() => setMethod("phone")} className={`pill flex-1 ${method === "phone" ? "bg-white shadow-sm" : "text-ink/50"}`}>手机号</button><button onClick={() => setMethod("email")} className={`pill flex-1 ${method === "email" ? "bg-white shadow-sm" : "text-ink/50"}`}>邮箱</button></div>
      <label className="mb-2 block text-xs font-bold text-ink/60">{method === "phone" ? "手机号码" : "邮箱地址"}</label>
      <div className="flex h-14 items-center gap-3 rounded-2xl bg-white px-4">{method === "phone" ? <Smartphone size={19} className="text-ink/40"/> : <Mail size={19} className="text-ink/40"/>}<input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink/30" placeholder={method === "phone" ? "输入手机号" : "name@example.com"}/></div>
      <Link href="/discover"><Button className="mt-5 w-full">获取验证码并登录</Button></Link>
      <div className="my-5 flex items-center gap-3 text-xs text-ink/35"><span className="h-px flex-1 bg-ink/10"/>或<span className="h-px flex-1 bg-ink/10"/></div>
      <Link href="/discover" className="flex h-12 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white text-sm font-semibold"><MessageCircle size={18} className="text-[#49a565]"/>微信一键登录 <span className="text-[10px] text-ink/35">MOCK</span></Link>
    </section>
    <Link href="/settings/verification" className="relative mt-6 flex items-center gap-3 rounded-2xl bg-forest-500/10 p-4"><BadgeCheck className="text-forest-500"/><span className="text-sm"><b>实名认证让同行更安心</b><small className="mt-1 block text-ink/45">登录后即可完成，MVP 阶段模拟认证</small></span></Link>
    <p className="relative mt-7 text-center text-[11px] leading-5 text-ink/40">继续即表示你同意《用户协议》和《隐私政策》</p>
  </div>;
}
