"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`pill inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-6 font-semibold text-white shadow-soft hover:bg-forest-700 disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

export function FadeCard({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div initial={{ opacity: 0, scale: .97, y: 10 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "-20px" }} transition={{ duration: .42, delay }} className={className}>{children}</motion.div>;
}

export function Avatar({ label, className = "" }: { label: string; className?: string }) {
  return <span className={`inline-grid size-9 place-items-center rounded-full bg-gradient-to-br from-lake-300 to-forest-500 text-sm font-bold text-white ${className}`}>{label.slice(0, 1)}</span>;
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-3 backdrop-blur-sm" onClick={onClose}>
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-[456px] rounded-[28px] bg-sand p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button aria-label="关闭" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-white"><X size={18}/></button></div>
      {children}
    </motion.div>
  </div>;
}

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-lake-300/20 px-2 py-1 text-[10px] font-bold text-lake-500">✓ {compact ? "已认证" : "实名认证"}</span>;
}
