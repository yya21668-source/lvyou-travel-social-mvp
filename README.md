# 旅遇 APP MVP

> 旅行，遇见你的奇妙朋友

以「人的连接」为核心的旅行社交产品 Web 端原型：AI 生成可视化旅行攻略，Solo 出发或寻找旅行搭子/地陪，游后 AI 自动生成游记回馈社区。

## 技术栈

- Next.js 14 (App Router) + TypeScript + TailwindCSS + framer-motion
- 数据层：localStorage Mock 适配器（接口签名与 Supabase 一致，V2 无缝切换）
- AI：Claude API（无 Key 时自动降级本地生成器）
- 地图：MapProvider 抽象层（当前 mock 占位，预留高德）

## 快速开始

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

生产构建与 PWA：

```bash
npm run build
npm run start
```

支持安装到手机主屏幕、独立窗口运行和基础离线回退。安装入口位于个人主页。

**演示入口**：
- 登录页任意手机号/邮箱 + 任意4位验证码，或点「微信一键登录（演示）」
- 预置演示账号「陈小满」已有：大理3日行程（含小组/群聊/记账）、待确认的搭子申请

## 主线闭环演示路径

1. `/create` 表单或对话式 → AI 生成行程
2. `/trip/[id]` 时间轴编辑（单项编辑/删除/换一个）
3. `/trip/[id]/companions` Solo 或找搭子（双方确认后入组）
4. `/group/[id]` 群聊（BroadcastChannel 模拟 Realtime，可开两个标签页测试）+ AA 多币种记账
5. `/trip/[id]/live` 行程中（时间轴 / 求助帖 UI）
6. `/trip/[id]/recap` AI 游记（整篇/按分类）→ 设置可见性发布
7. `/share/[postId]` 公开只读攻略页 → 回流社区广场

## 环境变量（可选）

```bash
# 启用真实 Claude API（未配置时自动降级本地生成器）
ANTHROPIC_API_KEY=sk-ant-xxx
ANTHROPIC_MODEL=claude-sonnet-4-5   # 可选

# 启用真实高德地图（未配置时使用占位图）
NEXT_PUBLIC_AMAP_KEY=xxx
```

## 目录结构

```
app/
  (auth)/onboarding      # 3屏理念 + 登录（微信mock）
  (app)/                 # 主框架（底部导航 + 登录守卫）
    page                 # 首页：AI入口大卡片 + 攻略瀑布流
    create               # AI创建：表单/对话二选一
    trip/[id]            # 行程时间轴（编辑/删除/重新生成）
    trip/[id]/companions # 搭子选择 + 双方确认
    trip/[id]/live       # 行程中（时间轴/求助帖UI）
    trip/[id]/recap      # 游后回顾（AI游记/分类生成/发布）
    group/[id]           # 小组：成员/群聊/AA记账
    poi/[id]             # 场所详情
    square               # 社区广场（筛选/招募/搭子消息）
    profile              # 个人主页（实名认证/攻略可见性）
  share/[postId]         # 公开攻略（非登录只读）
  api/ai/*               # itinerary / recap / summary
components/              # ui（玻璃拟态组件）/ home / trip
lib/
  services/              # ★ auth/trip/post/group/expense/chat/match/review
  ai/                    # claude.ts + prompts + mock生成器
  map/                   # MapProvider 抽象（mock/amap）
  mock/db.ts             # localStorage Mock 数据层（8张表+种子数据）
types/                   # 与 Supabase 表结构一一对应
```

## V2 接入清单（MVP 中所有 mock 点）

| 功能 | MVP 状态 | V2 接入 |
|------|---------|---------|
| 数据库/Auth | localStorage mock（`lib/mock/db.ts`） | Supabase Postgres + Auth，替换 service 层内部实现 |
| 微信登录 | `authService.signInWithWechat()` mock | 微信开放平台 OAuth |
| 实名认证 | 提交即通过 | 腾讯云慧眼等真实身份认证 |
| 求助帖 | UI 占位 | 社区帖子服务 + LBS |
| 支付/结算 | 结算建议展示 | 真实转账/代收付 |
| 汇率 | 写死演示汇率 | 汇率 API（`lib/services/expense.service.ts` FX_RATES） |
| 群聊 Realtime | BroadcastChannel 模拟 | Supabase Realtime postgres_changes |
| 地图 | SVG 占位图 | 高德开放平台（配置 `NEXT_PUBLIC_AMAP_KEY` 自动切换） |
| 行程生成 | 无 Key 时本地生成 | 配置 `ANTHROPIC_API_KEY` 即走 Claude |

所有 mock 点在代码中均有 `MVP阶段mock，V2需接入真实服务` 注释标注。
