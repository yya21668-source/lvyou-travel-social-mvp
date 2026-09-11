/**
 * AA记账服务（expenses 表）+ mock汇率
 * 多币种：所有金额按 mock 汇率折算 CNY 结算
 * V2：真实汇率接入（如 exchangerate-api），结算走真实支付/代收付服务
 */
import { getDb, mutate, uid } from "@/lib/mock/db";
import type { Currency, Expense, SettlementEntry, UUID } from "@/types";

/** MVP阶段mock汇率（以CNY为基准），V2需接入真实汇率API */
export const FX_RATES: Record<Currency, number> = {
  CNY: 1,
  USD: 7.24,
  EUR: 7.85,
  JPY: 0.048,
  THB: 0.2,
  HKD: 0.92,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CNY: "¥", USD: "$", EUR: "€", JPY: "¥", THB: "฿", HKD: "HK$",
};

export function toCNY(amount: number, currency: Currency): number {
  return Math.round(amount * FX_RATES[currency] * 100) / 100;
}

export const expenseService = {
  getExpenses(groupId: UUID): Expense[] {
    return getDb()
      .expenses.filter((e) => e.group_id === groupId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  addExpense(input: Omit<Expense, "id" | "created_at">): Expense {
    return mutate((db) => {
      const e: Expense = { ...input, id: uid("e"), created_at: new Date().toISOString() };
      db.expenses.push(e);
      return e;
    });
  },

  deleteExpense(id: UUID) {
    mutate((db) => {
      db.expenses = db.expenses.filter((e) => e.id !== id);
    });
  },

  /** 结算：每人应付/应收（折合CNY）。net>0 应收（别人欠TA），net<0 应付 */
  settleUp(groupId: UUID): SettlementEntry[] {
    const db = getDb();
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) return [];
    const paid = new Map<UUID, number>();
    const share = new Map<UUID, number>();
    group.members.forEach((m) => {
      paid.set(m, 0);
      share.set(m, 0);
    });
    this.getExpenses(groupId).forEach((e) => {
      paid.set(e.payer_id, (paid.get(e.payer_id) ?? 0) + toCNY(e.amount, e.currency));
      const per = toCNY(e.amount, e.currency) / e.split_members.length;
      e.split_members.forEach((m) => share.set(m, (share.get(m) ?? 0) + per));
    });
    return group.members.map((m) => {
      const p = Math.round((paid.get(m) ?? 0) * 100) / 100;
      const s = Math.round((share.get(m) ?? 0) * 100) / 100;
      return { user_id: m, paid: p, share: s, net: Math.round((p - s) * 100) / 100 };
    });
  },
};
