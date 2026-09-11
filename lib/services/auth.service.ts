/**
 * 认证服务
 * MVP阶段mock：localStorage session + 种子用户。
 * V2需接入：Supabase Auth（手机号OTP/邮箱密码）+ 微信开放平台OAuth。
 * 微信登录已预留统一入口 signInWithWechat()，替换内部实现即可。
 */
import { getDb, mutate, uid } from "@/lib/mock/db";
import type { User } from "@/types";

export const authService = {
  getCurrentUser(): User | null {
    const db = getDb();
    if (!db.session) return null;
    return db.users.find((u) => u.id === db.session) ?? null;
  },

  /** 手机号/邮箱 + 验证码登录注册（验证码任意4位，mock直接通过） */
  signIn(identifier: string): User {
    const db = getDb();
    const isPhone = /^1\d{10}$/.test(identifier);
    let user = db.users.find((u) =>
      isPhone ? u.phone === identifier : u.email === identifier
    );
    return mutate((d) => {
      if (!user) {
        // 自动注册为新用户
        user = {
          id: uid("u"),
          ...(isPhone ? { phone: identifier } : { email: identifier }),
          nickname: `旅行者${identifier.slice(-4)}`,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          bio: "准备好遇见奇妙的朋友了吗",
          verified: false,
          followers: 0,
          following: 0,
          created_at: new Date().toISOString(),
        };
        d.users.push(user);
      }
      d.session = user.id;
      return user;
    });
  },

  /** 微信登录 —— MVP阶段mock，V2需接入微信开放平台OAuth真实流程 */
  signInWithWechat(): User {
    return this.signIn("13800000001"); // mock：直接以演示账号登录
  },

  signOut() {
    mutate((d) => {
      d.session = null;
    });
  },

  /** 实名认证 —— MVP阶段mock直接通过，V2需接入真实身份认证服务（如腾讯云慧眼） */
  verifyIdentity(name: string, idNumber: string): boolean {
    return mutate((d) => {
      const me = d.users.find((u) => u.id === d.session);
      if (!me) return false;
      if (name.trim().length < 2 || idNumber.trim().length < 15) return false;
      me.verified = true;
      return true;
    });
  },

  getUserById(id: string): User | null {
    return getDb().users.find((u) => u.id === id) ?? null;
  },
};
