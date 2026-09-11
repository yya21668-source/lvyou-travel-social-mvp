"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setInstalled(standalone);
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); };
    const markInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", markInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", markInstalled); };
  }, []);

  if (installed) return <div className="flex items-center gap-3 rounded-2xl bg-forest-500/10 p-4 text-sm font-bold text-forest-700"><Download size={18}/>旅遇已作为 App 运行</div>;

  const install = async () => {
    if (prompt) { await prompt.prompt(); const result = await prompt.userChoice; if (result.outcome === "accepted") setInstalled(true); setPrompt(null); }
    else setIosHint(true);
  };

  return <div className="rounded-card bg-gradient-to-br from-lake-500 to-forest-700 p-5 text-white shadow-soft"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15"><Download size={20}/></span><div><b className="text-sm">安装旅遇 App</b><p className="mt-1 text-xs leading-5 text-white/70">添加到主屏幕，获得全屏体验与基础离线访问。</p></div></div><button onClick={install} className="mt-4 w-full rounded-full bg-white py-3 text-sm font-bold text-ink-700">立即安装</button>{iosHint && <p className="mt-3 flex items-start gap-2 rounded-2xl bg-white/10 p-3 text-xs leading-5"><Share size={16} className="mt-0.5 shrink-0"/>iPhone 请点击 Safari 底部“分享”，再选择“添加到主屏幕”。</p>}</div>;
}
