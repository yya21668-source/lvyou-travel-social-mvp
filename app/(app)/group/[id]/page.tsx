"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import { Avatar, VerifiedBadge } from "@/components/ui/Badges";
import { FadeIn } from "@/components/ui/Common";
import { useToast } from "@/components/ui/Toast";
import { authService } from "@/lib/services/auth.service";
import { groupService } from "@/lib/services/group.service";
import { chatService } from "@/lib/services/chat.service";
import { expenseService, CURRENCY_SYMBOLS, toCNY } from "@/lib/services/expense.service";
import { tripService } from "@/lib/services/trip.service";
import { getDb } from "@/lib/mock/db";
import type { ChatMessage, Currency, Group, SettlementEntry, User } from "@/types";

/**
 * 小组页：成员列表 / 群聊 / AA记账
 * - 群聊：MVP用BroadcastChannel模拟Supabase Realtime
 * - 记账：多币种，mock汇率折算CNY结算
 */
const CURRENCIES: Currency[] = ["CNY", "USD", "EUR", "JPY", "THB", "HKD"];

export default function GroupPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [tab, setTab] = useState<"members" | "chat" | "expense">("members");
  const [userMap, setUserMap] = useState<Record<string, User>>({});

  const load = useCallback(() => {
    setGroup(groupService.getGroup(id));
  }, [id]);

  useEffect(() => {
    setMe(authService.getCurrentUser());
    setUserMap(Object.fromEntries(getDb().users.map((u) => [u.id, u])));
    load();
  }, [load]);

  if (!group || !me) {
    return (
      <div className="min-h-dvh bg-sand-100">
        <PageHeader title="小组" />
        <p className="pt-20 text-center text-sm text-ink-300">小组不存在</p>
      </div>
    );
  }

  const trip = tripService.getTrip(group.trip_plan_id);

  return (
    <div className="min-h-dvh bg-sand-100 pb-8">
      <PageHeader title={group.name} />

      {/* 行程信息条 */}
      {trip && (
        <Link href={`/trip/${trip.id}`} className="glass mx-4 mt-2 flex items-center gap-3 rounded-2xl p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={trip.cover} alt="" className="h-11 w-11 rounded-xl object-cover" />
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-ink-700">{trip.destination} · {trip.travel_type}</p>
            <p className="text-[11px] text-ink-300">{trip.start_date} 出发 · {trip.status === "ongoing" ? "进行中" : "规划中"}</p>
          </div>
          <span className="text-[12px] font-medium text-lake-600">查看行程 →</span>
        </Link>
      )}

      {/* Tabs */}
      <div className="sticky top-14 z-30 mt-4 bg-sand-100/85 px-4 pb-2 backdrop-blur-lg">
        <div className="glass flex rounded-full p-1">
          {([["members", "成员"], ["chat", "群聊"], ["expense", "AA记账"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex-1 rounded-full py-2 text-[13px] font-medium transition ${tab === key ? "text-white" : "text-ink-500"}`}
            >
              {tab === key && <motion.span layoutId="group-tab" className="absolute inset-0 rounded-full bg-gradient-to-r from-lake-600 to-lake-400" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "members" && (
        <div className="px-4 pt-4">
          <FadeIn>
            <div className="glass rounded-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-ink-700">成员 {group.members.length} 人</h3>
                <span className="text-[11px] text-ink-300">入组需双方确认</span>
              </div>
              <div className="mt-4 space-y-3.5">
                {group.members.map((mid) => {
                  const u = userMap[mid];
                  const isOwner = trip && trip.owner_id === mid;
                  return (
                    <div key={mid} className="flex items-center gap-3">
                      <Avatar src={u?.avatar ?? ""} size={44} ring />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-ink-700">{u?.nickname}{mid === me.id && "（我）"}</span>
                          <VerifiedBadge verified={u?.verified ?? false} small />
                          {isOwner && <span className="rounded-full bg-lake-100 px-2 py-0.5 text-[10px] font-medium text-lake-700">发起人</span>}
                        </div>
                        <p className="text-[12px] text-ink-300">{u?.bio}</p>
                      </div>
                      <Link href={`/profile/${mid}`} className="pill-ghost px-3 py-1.5 text-[12px]">主页</Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="glass mt-4 rounded-card p-5">
              <h3 className="text-[14px] font-bold text-ink-700">🛡️ 安全提示</h3>
              <ul className="mt-2 space-y-1.5 text-[12px] leading-6 text-ink-400">
                <li>· 出发前请完成实名认证，认证徽章可见</li>
                <li>· 初次见面请选择公共场所，并保持小组沟通</li>
                <li>· AA记账透明公开，避免金钱纠纷</li>
                <li>· 需要旅途协助时，可在行程中发布求助帖</li>
              </ul>
            </div>
          </FadeIn>
        </div>
      )}

      {tab === "chat" && <ChatPanel groupId={group.id} meId={me.id} userMap={userMap} />}
      {tab === "expense" && <ExpensePanel group={group} meId={me.id} userMap={userMap} onToast={toast} />}
    </div>
  );
}

/* ---------------- 群聊 ---------------- */
function ChatPanel({ groupId, meId, userMap }: { groupId: string; meId: string; userMap: Record<string, User> }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setMessages(chatService.getMessages(groupId));
  }, [groupId]);

  useEffect(() => {
    load();
    // 订阅Realtime（MVP：BroadcastChannel模拟；V2：supabase.channel订阅）
    const unsubscribe = chatService.subscribe(groupId, load);
    return unsubscribe;
  }, [groupId, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function send() {
    const content = input.trim();
    if (!content) return;
    chatService.sendMessage(groupId, meId, content);
    setInput("");
    load();
  }

  return (
    <div className="flex h-[calc(100dvh-320px)] min-h-80 flex-col px-4 pt-3">
      <div className="glass no-scrollbar flex-1 space-y-3 overflow-y-auto rounded-cardlg p-4">
        <p className="text-center text-[11px] text-ink-300">—— 旅途愉快，文明聊天 ——</p>
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <Avatar src={userMap[m.sender_id]?.avatar ?? ""} size={30} />
              <div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-6 ${mine ? "rounded-br-md bg-gradient-to-br from-lake-600 to-lake-400 text-white" : "rounded-bl-md bg-white/85 text-ink-600"}`}>
                {!mine && <p className="mb-0.5 text-[11px] font-medium text-ink-300">{userMap[m.sender_id]?.nickname}</p>}
                {m.content}
              </div>
              <span className="text-[10px] text-ink-200">{new Date(m.created_at).toTimeString().slice(0, 5)}</span>
            </motion.div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="说点什么…"
          className="input-base flex-1 rounded-full py-2.5"
        />
        <button onClick={send} className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-lake-600 to-lake-400 text-white shadow-soft transition active:scale-90" aria-label="发送">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ---------------- AA记账 ---------------- */
function ExpensePanel({
  group, meId, userMap, onToast,
}: {
  group: Group;
  meId: string;
  userMap: Record<string, User>;
  onToast: (t: string, k?: "success" | "error" | "info") => void;
}) {
  const [expenses, setExpenses] = useState(expenseService.getExpenses(group.id));
  const [settlement, setSettlement] = useState<SettlementEntry[]>(expenseService.settleUp(group.id));
  const [showAdd, setShowAdd] = useState(false);
  // 添加表单
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("CNY");
  const [payer, setPayer] = useState(meId);
  const [split, setSplit] = useState<string[]>([...group.members]);

  const refresh = useCallback(() => {
    setExpenses(expenseService.getExpenses(group.id));
    setSettlement(expenseService.settleUp(group.id));
  }, [group.id]);

  function addExpense() {
    const amt = Number(amount);
    if (!title.trim() || !amt || amt <= 0) {
      onToast("请填写名称和金额", "error");
      return;
    }
    if (split.length === 0) {
      onToast("至少选择一位分摊成员", "error");
      return;
    }
    expenseService.addExpense({
      group_id: group.id,
      payer_id: payer,
      title: title.trim(),
      amount: Math.round(amt * 100) / 100,
      currency,
      split_members: split,
    });
    refresh();
    setShowAdd(false);
    setTitle("");
    setAmount("");
    onToast("记账成功");
  }

  const totalCNY = settlement.reduce((s, x) => s + x.paid, 0);

  return (
    <div className="px-4 pt-3">
      {/* 汇总 */}
      <FadeIn>
        <div className="glass rounded-card p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[15px] font-bold text-ink-700">总支出</h3>
            <p className="text-[24px] font-bold text-forest-600">
              ¥{totalCNY.toFixed(2)}
              <span className="ml-1 text-[11px] font-normal text-ink-300">（折合CNY）</span>
            </p>
          </div>
          <div className="mt-1 text-[11px] text-ink-300">
            {/* MVP阶段mock汇率，V2需接入真实汇率API与支付结算 */}
            汇率：1 USD = 7.24 CNY · 100 JPY = 4.8 CNY（演示汇率）
          </div>
        </div>
      </FadeIn>

      {/* 结算视图 */}
      <FadeIn delay={0.05}>
        <div className="glass mt-3.5 rounded-card p-5">
          <h3 className="text-[15px] font-bold text-ink-700">怎么结算</h3>
          <div className="mt-3 space-y-2.5">
            {settlement.map((s) => {
              const u = userMap[s.user_id];
              const isCredit = s.net > 0.01;
              const isDebt = s.net < -0.01;
              return (
                <div key={s.user_id} className="flex items-center gap-3 rounded-2xl bg-white/60 px-3.5 py-2.5">
                  <Avatar src={u?.avatar ?? ""} size={34} />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-ink-600">{u?.nickname}{s.user_id === meId ? "（我）" : ""}</p>
                    <p className="text-[11px] text-ink-300">已付 ¥{s.paid.toFixed(2)} / 应摊 ¥{s.share.toFixed(2)}</p>
                  </div>
                  <span className={`text-[14px] font-bold ${isCredit ? "text-forest-600" : isDebt ? "text-coral-500" : "text-ink-300"}`}>
                    {isCredit ? `应收 ¥${s.net.toFixed(2)}` : isDebt ? `应付 ¥${Math.abs(s.net).toFixed(2)}` : "已平账"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-ink-300">
            {/* MVP阶段mock，V2需接入真实支付/代收付服务 */}
            结算建议为演示功能 · V2接入真实转账
          </p>
        </div>
      </FadeIn>

      {/* 消费记录 */}
      <div className="mt-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink-700">消费记录 {expenses.length} 笔</h3>
        <button onClick={() => setShowAdd(true)} className="pill bg-gradient-to-br from-coral-500 to-coral-400 px-4 py-2 text-[12px] text-white shadow-soft">
          + 记一笔
        </button>
      </div>
      <div className="mt-3 space-y-2.5">
        {expenses.length === 0 && <p className="glass rounded-card p-4 text-center text-[13px] text-ink-300">还没有记录，第一笔消费记下来吧</p>}
        {expenses.map((e, i) => {
          const payerU = userMap[e.payer_id];
          const cny = toCNY(e.amount, e.currency);
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass flex items-center gap-3 rounded-card px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand-200 text-[15px]">
                {e.title.includes("餐") || e.title.includes("饭") ? "🍜" : e.title.includes("车") || e.title.includes("租") || e.title.includes("票") ? "🚗" : "🧾"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-ink-700">{e.title}</p>
                <p className="text-[11px] text-ink-300">
                  {payerU?.nickname} 付 · {e.split_members.length}人分摊 · 折合 ¥{cny.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold text-ink-700">{CURRENCY_SYMBOLS[e.currency]}{e.amount}</p>
                <button onClick={() => { expenseService.deleteExpense(e.id); refresh(); }} className="text-[11px] text-ink-200 hover:text-red-400">删除</button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 添加弹层 */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(ev) => ev.stopPropagation()}
            className="glass-deep mx-auto w-full max-w-md rounded-t-cardlg bg-white/95 p-6 pb-10"
          >
            <h3 className="text-[16px] font-bold text-ink-700">记一笔</h3>
            <label className="mt-4 block text-[13px] font-medium text-ink-500">消费名称</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：晚餐、门票、打车" className="input-base mt-1.5" />
            <div className="mt-3 flex gap-3">
              <div className="flex-1">
                <label className="block text-[13px] font-medium text-ink-500">金额</label>
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" inputMode="decimal" className="input-base mt-1.5" />
              </div>
              <div className="w-28">
                <label className="block text-[13px] font-medium text-ink-500">币种</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="input-base mt-1.5">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <label className="mt-3 block text-[13px] font-medium text-ink-500">付款人</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.members.map((mid) => (
                <button key={mid} onClick={() => setPayer(mid)} className={`rounded-full px-3 py-1.5 text-[12px] transition ${payer === mid ? "bg-lake-600 text-white" : "bg-white/70 text-ink-500"}`}>
                  {userMap[mid]?.nickname}
                </button>
              ))}
            </div>
            <label className="mt-3 block text-[13px] font-medium text-ink-500">分摊成员</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.members.map((mid) => (
                <button
                  key={mid}
                  onClick={() => setSplit((s) => (s.includes(mid) ? s.filter((x) => x !== mid) : [...s, mid]))}
                  className={`rounded-full px-3 py-1.5 text-[12px] transition ${split.includes(mid) ? "bg-forest-600 text-white" : "bg-white/70 text-ink-400"}`}
                >
                  {split.includes(mid) ? "✓ " : ""}{userMap[mid]?.nickname}
                </button>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAdd(false)} className="pill-ghost flex-1 py-3">取消</button>
              <button onClick={addExpense} className="pill-primary flex-1 py-3">保存</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
