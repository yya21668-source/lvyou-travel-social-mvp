import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "旅遇 · 旅行，遇见你的奇妙朋友",
  description: "以人的连接为核心的旅行社交 App",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#F6F3EA" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><main className="relative mx-auto min-h-dvh max-w-[480px] overflow-x-hidden bg-sand md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-[34px] md:shadow-2xl">{children}</main></body></html>;
}
