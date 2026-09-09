# 旅遇 Web MVP

> 旅行，遇见你的奇妙朋友。

移动端优先的旅行社交产品原型，覆盖 AI 创建行程、公开分享、寻找搭子、双向确认、小组聊天、AA 记账、行程中安全能力和游后攻略发布。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。不配置环境变量时会自动使用 Mock 数据，完整主流程仍可体验。

## 推荐演示路径

1. `/onboarding` 完成三屏引导并登录。
2. `/discover` 点击 AI 大卡片创建大理行程。
3. 在 `/trips/yunnan-summer` 编辑行程并选择同行方式。
4. `/matches` 选择阿禾，完成双方确认并进入小组。
5. `/groups/dali-crew` 体验聊天、成员和 AA 账单。
6. `/trips/yunnan-summer/live` 查看关键提醒、紧急联系人和 SOS Mock。
7. `/trips/yunnan-summer/review` 生成攻略并发布。

## 服务配置

- Supabase：填写 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，依次执行 `supabase/migrations`。
- Claude：填写 `ANTHROPIC_API_KEY`。密钥仅在服务端 Route Handler 使用。
- 高德地图：当前由 `services/map.service.ts` Mock，V2 可替换实现。

AI 接口在没有密钥时返回 Mock；行程 JSON 会去除代码围栏、提取 JSON 对象并使用 Zod 严格校验。

## MVP 安全边界

- 实名认证仅模拟状态，不采集真实证件。
- SOS 仅展示二次确认与模拟结果，不发送真实通知。
- AA 账单与汇率只做计算，不实现支付、代收付或转账。
- 搭子申请需双方确认后才能创建小组；生产环境应在服务端事务中再次验证。

以上能力均在代码和数据库迁移中标注了 V2 接入要求。
