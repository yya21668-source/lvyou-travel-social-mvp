import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "旅遇 · 旅行，遇见你的奇妙朋友",
  description: "以人的连接为核心的旅行社交App：AI生成旅行攻略，独自出发或遇见你的旅行搭子。",
  applicationName: "旅遇",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "旅遇" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#F6F3EA" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <PwaRegister />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
