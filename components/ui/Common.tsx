"use client";

import { motion } from "framer-motion";

/** 卡片入场淡入+缩放动效 */
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** 玻璃拟态卡片 */
export function GlassCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-card ${onClick ? "cursor-pointer transition active:scale-[0.98]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/** 空状态 */
export function EmptyState({ icon = "🗺️", title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-[15px] font-medium text-ink-500">{title}</p>
      {hint && <p className="text-[13px] text-ink-300">{hint}</p>}
    </div>
  );
}

/** 简易Markdown渲染器（攻略详情页）—— V2可替换为 react-markdown */
export function MarkdownView({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/\n\n+/);
  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i}>{p.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };
  return (
    <div className="md-body">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        if (lines.every((l) => l.startsWith("- ") || /^\d+\.\s/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^(- |\d+\.\s)/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (block.startsWith("## ")) return <h2 key={i}>{renderInline(block.slice(3))}</h2>;
        if (block.startsWith("### ")) return <h3 key={i}>{renderInline(block.slice(4))}</h3>;
        if (block.startsWith("> ")) return <blockquote key={i}>{renderInline(block.slice(2))}</blockquote>;
        return <p key={i}>{renderInline(block)}</p>;
      })}
    </div>
  );
}
