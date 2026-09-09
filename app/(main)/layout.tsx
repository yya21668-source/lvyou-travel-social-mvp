import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh pb-28">{children}<BottomNav /></div>;
}
