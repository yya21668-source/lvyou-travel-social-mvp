"use client";

/** 用户头像 */
export function Avatar({
  src,
  size = 40,
  ring = false,
  onClick,
}: {
  src: string;
  size?: number;
  ring?: boolean;
  onClick?: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="用户头像"
      onClick={onClick}
      className={`rounded-full object-cover ${ring ? "ring-2 ring-white/80" : ""} ${onClick ? "cursor-pointer" : ""}`}
      style={{ width: size, height: size }}
    />
  );
}

/** 实名认证徽章 —— MVP阶段mock状态展示，V2需接入真实认证服务 */
export function VerifiedBadge({ verified, small = false }: { verified: boolean; small?: boolean }) {
  if (!verified) return null;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-lake-600 to-lake-400 font-medium text-white ${
        small ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-[11px]"
      }`}
      title="已实名认证"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={small ? "h-2.5 w-2.5" : "h-3 w-3"}>
        <path d="M5 13l4 4L19 7" />
      </svg>
      已实名
    </span>
  );
}

/** POI类型标签 */
const TYPE_STYLES: Record<string, string> = {
  景点: "bg-lake-100 text-lake-700",
  餐厅: "bg-coral-100 text-coral-600",
  交通: "bg-sand-200 text-ink-600",
  住宿: "bg-forest-100 text-forest-600",
  商场: "bg-amber-100 text-amber-700",
  体验: "bg-[#FBEAF0] text-[#993556]",
  徒步路线: "bg-forest-200 text-forest-700",
  其他: "bg-sand-200 text-ink-500",
};

export function TypeTag({ type }: { type: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_STYLES[type] ?? TYPE_STYLES["其他"]}`}>
      {type}
    </span>
  );
}

/** 可见性标识 */
export function VisibilityTag({ visibility }: { visibility: "public" | "friends" | "private" }) {
  const map = {
    public: { label: "公开", icon: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 15a3 3 0 100-6 3 3 0 000 6z" },
    friends: { label: "仅好友", icon: "M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 10a4 4 0 100-8 4 4 0 000 8z M22 20v-2a4 4 0 00-3-3.9 M16 3.1a4 4 0 010 7.8" },
    private: { label: "仅自己", icon: "M6 10V7a6 6 0 0112 0v3 M5 10h14v11H5z" },
  }[visibility];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-ink-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
        <path d={map.icon} />
      </svg>
      {map.label}
    </span>
  );
}
