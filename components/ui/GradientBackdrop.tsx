"use client";

/**
 * 有机形态渐变背景（Onboarding / 完成页用）
 * 湖蓝 → 森林绿渐变 + SVG噪点颗粒 + 星光点缀，营造"奇妙感"
 */
export default function GradientBackdrop({ variant = "hero" }: { variant?: "hero" | "sand" }) {
  const grad =
    variant === "hero"
      ? "linear-gradient(150deg,#4A8B9C 0%,#7DC4CE 45%,#5A8768 100%)"
      : "linear-gradient(150deg,#F6F3EA 0%,#E8F0E9 55%,#D8EDF1 100%)";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: grad }}>
      {/* 噪点颗粒质感（feTurbulence） */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.16] mix-blend-overlay">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* 有机形态色块 */}
      <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl animate-float-slow" />
      <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#2F4A3D]/25 blur-3xl" />
      <div className="absolute right-10 top-1/4 h-36 w-36 rounded-full bg-[#FF8B6B]/20 blur-2xl" />

      {/* 星光点缀 */}
      {STARS.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute animate-twinkle"
          style={{ left: s.x, top: s.y, width: s.size, animationDelay: `${s.delay}s` }}
        >
          <path
            d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"
            fill={s.color}
            opacity="0.9"
          />
        </svg>
      ))}
    </div>
  );
}

const STARS = [
  { x: "12%", y: "18%", size: 16, delay: 0, color: "#FFFFFF" },
  { x: "78%", y: "12%", size: 12, delay: 0.8, color: "#FFF3EF" },
  { x: "62%", y: "30%", size: 8, delay: 1.4, color: "#FFFFFF" },
  { x: "22%", y: "52%", size: 10, delay: 0.4, color: "#F6F3EA" },
  { x: "86%", y: "58%", size: 14, delay: 1.9, color: "#FFFFFF" },
  { x: "40%", y: "76%", size: 9, delay: 1.1, color: "#FFF3EF" },
  { x: "8%", y: "82%", size: 12, delay: 2.2, color: "#FFFFFF" },
];
