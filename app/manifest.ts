import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "旅遇 · 旅行，遇见你的奇妙朋友",
    short_name: "旅遇",
    description: "用 AI 生成旅行攻略，遇见同频的旅行朋友。",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F3EA",
    theme_color: "#4A8B9C",
    orientation: "portrait",
    categories: ["travel", "social", "lifestyle"],
    lang: "zh-CN",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "AI 创建行程", short_name: "创建行程", url: "/create", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "寻找旅行搭子", short_name: "找搭子", url: "/square?tab=recruit", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
