import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-lake-600 to-forest-600 px-8 text-center text-white"><span className="grid size-20 place-items-center rounded-[28px] bg-white/15 backdrop-blur"><WifiOff size={34}/></span><h1 className="mt-7 text-3xl font-black">暂时走到了信号之外</h1><p className="mt-3 max-w-xs text-sm leading-6 text-white/70">已保存的旅遇仍会留在这里。恢复网络后，再继续探索新的远方。</p><Link href="/" className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink-700">重试连接</Link></div>;
}
