/**
 * 群聊服务（chat_messages 表 + Realtime 订阅）
 * MVP阶段：BroadcastChannel 跨标签页模拟 Supabase Realtime
 * V2：替换为 supabase.channel('group:'+id).on('postgres_changes',...) 订阅
 */
import { getDb, mutate, uid } from "@/lib/mock/db";
import type { ChatMessage, UUID } from "@/types";

const CHANNEL = "lvyu-chat";

export const chatService = {
  getMessages(groupId: UUID): ChatMessage[] {
    return getDb()
      .chat_messages.filter((m) => m.group_id === groupId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  sendMessage(groupId: UUID, senderId: UUID, content: string): ChatMessage {
    const msg = mutate((db) => {
      const m: ChatMessage = {
        id: uid("c"),
        group_id: groupId,
        sender_id: senderId,
        content,
        created_at: new Date().toISOString(),
      };
      db.chat_messages.push(m);
      return m;
    });
    // 广播给其他标签页（模拟 Realtime）
    try {
      new BroadcastChannel(CHANNEL).postMessage({ type: "chat", groupId });
    } catch { /* BroadcastChannel 不可用时静默降级 */ }
    return msg;
  },

  /** 订阅消息变化，返回取消订阅函数 */
  subscribe(groupId: UUID, cb: () => void): () => void {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.onmessage = (ev) => {
        if (ev.data?.type === "chat" && ev.data.groupId === groupId) cb();
      };
    } catch { /* 静默降级：同标签页内通过手动刷新 */ }
    const handler = () => cb();
    window.addEventListener("lvyu-chat-update", handler);
    return () => {
      bc?.close();
      window.removeEventListener("lvyu-chat-update", handler);
    };
  },
};
