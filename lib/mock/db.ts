/**
 * Mock 数据层 —— MVP阶段使用 localStorage 模拟 Supabase Postgres
 * 接口与真实 Supabase 表结构一致，V2 替换为 supabase-js 后 service 层零改动
 */
import type {
  User, TripPlan, PoiItem, Group, ChatMessage, Expense,
  Post, MatchApplication, Review,
} from "@/types";

export interface DB {
  users: User[];
  trip_plans: TripPlan[];
  poi_items: PoiItem[];
  groups: Group[];
  chat_messages: ChatMessage[];
  expenses: Expense[];
  posts: Post[];
  match_applications: MatchApplication[];
  reviews: Review[];
  /** 当前登录用户 id，null 未登录 */
  session: string | null;
}

// 用户模型升级到 v2；更换 key，避免旧版 localStorage 数据污染新结构。
const DB_KEY = "lvyu_db_v2";

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- 种子数据 ---------- */

const now = new Date();
const dayOffset = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const tsOffset = (n: number, h = 10, m = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

function seed(): DB {
  const users: User[] = [
    {
      id: "u1", phone: "13800000001", nickname: "陈小满", avatar: "https://i.pravatar.cc/150?img=47",
      bio: "去有风的地方，做无甲的梦", verified: false,
      followers: 128, following: 96, created_at: tsOffset(-200),
    },
    {
      id: "u2", nickname: "背包客阿澜", avatar: "https://i.pravatar.cc/150?img=12",
      bio: "5年独行走遍34省，下一步冰岛", verified: true,
      followers: 3241, following: 210, created_at: tsOffset(-500),
    },
    {
      id: "u3", nickname: "洱海边的小鹿", avatar: "https://i.pravatar.cc/150?img=32",
      bio: "大理地陪 | 会带你去只有本地人知道的日落点", verified: true,
      followers: 892, following: 158, created_at: tsOffset(-400),
    },
    {
      id: "u4", nickname: "穷游星人Kiko", avatar: "https://i.pravatar.cc/150?img=25",
      bio: "人均500玩转一座城是我的执念", verified: false,
      followers: 456, following: 320, created_at: tsOffset(-300),
    },
    {
      id: "u5", nickname: "山系青年老周", avatar: "https://i.pravatar.cc/150?img=59",
      bio: "徒步才是旅行的本体，装备党勿扰", verified: true,
      followers: 1287, following: 88, created_at: tsOffset(-450),
    },
    {
      id: "u6", nickname: "甜品雷达Momo", avatar: "https://i.pravatar.cc/150?img=44",
      bio: "用胃丈量世界", verified: false,
      followers: 233, following: 402, created_at: tsOffset(-180),
    },
  ];

  const img = (id: string) =>
    `https://images.unsplash.com/${id}?q=80&w=900&auto=format&fit=crop`;

  const trip_plans: TripPlan[] = [
    {
      id: "t1", owner_id: "u1", destination: "大理", start_date: dayOffset(3), end_date: dayOffset(6),
      travel_type: "度假", mode: "companion", visibility: "public", status: "planning",
      notes: "想环洱海慢慢玩，预算3k", cover: img("photo-1508804185872-d7badad00f7d"),
      created_at: tsOffset(-2),
    },
    {
      id: "t2", owner_id: "u5", destination: "四姑娘山", start_date: dayOffset(7), end_date: dayOffset(10),
      travel_type: "徒步", mode: "companion", visibility: "public", status: "planning",
      notes: "长坪沟穿毕棚沟，重装，找2名有高原经验的搭子", cover: img("photo-1464822759023-fed622ff2c3b"),
      created_at: tsOffset(-5),
    },
    {
      id: "t3", owner_id: "u2", destination: "京都", start_date: dayOffset(-30), end_date: dayOffset(-25),
      travel_type: "度假", mode: "solo", visibility: "public", status: "completed",
      cover: img("photo-1493976040374-85c8e12f0c0e"), created_at: tsOffset(-35),
    },
    {
      id: "t4", owner_id: "u4", destination: "重庆", start_date: dayOffset(-15), end_date: dayOffset(-12),
      travel_type: "穷游", mode: "solo", visibility: "public", status: "completed",
      cover: img("photo-1520869562399-e772f042f422"), created_at: tsOffset(-20),
    },
    {
      id: "t5", owner_id: "u3", destination: "大理", start_date: dayOffset(-60), end_date: dayOffset(-57),
      travel_type: "其他", mode: "companion", visibility: "public", status: "completed",
      cover: img("photo-1537531383496-f4749b8032cf"), created_at: tsOffset(-65),
    },
  ];

  const poi_items: PoiItem[] = [
    // t1 大理（我的行程，3天）
    { id: "poi_t1_1", trip_plan_id: "t1", day_index: 1, sort_order: 1, poi_name: "大理古城", type: "景点", description: "始建于明洪武十五年，南城门是标志。建议清晨人少时逛，五华楼上看日出绝佳。", suggested_time: "09:00", address: "云南省大理白族自治州大理市古城区", phone: "0872-2670114", opening_hours: "全天开放（景点内商铺约10:00-22:00）", external_url: "#", rating: 4.6, is_key_point: false },
    { id: "poi_t1_2", trip_plan_id: "t1", day_index: 1, sort_order: 2, poi_name: "才村码头", type: "景点", description: "看洱海日落的经典机位，码头栈道向水面延伸，傍晚光线最柔和。", suggested_time: "17:30", address: "大理市大理镇才村", opening_hours: "全天", rating: 4.7, is_key_point: false },
    { id: "poi_t1_3", trip_plan_id: "t1", day_index: 2, sort_order: 1, poi_name: "环洱海骑行（才村-喜洲段）", type: "体验", description: "租一辆电动车沿生态廊道北上，全程约20km，途经磻溪村S湾网红打卡点。", suggested_time: "09:30", rating: 4.8, is_key_point: true },
    { id: "poi_t1_4", trip_plan_id: "t1", day_index: 2, sort_order: 2, poi_name: "喜洲古镇·转角楼", type: "景点", description: "白族建筑活化石，尝一块现烤喜洲粑粑，稻田季节（5-9月）随手拍都是屏保。", suggested_time: "14:00", address: "大理市喜洲镇", opening_hours: "全天", rating: 4.5, is_key_point: false },
    { id: "poi_t1_5", trip_plan_id: "t1", day_index: 2, sort_order: 3, poi_name: "海舍人餐厅", type: "餐厅", description: "本地人推荐的酸辣鱼和老奶洋芋，人均60，靠窗位可以看到稻田。", suggested_time: "18:30", phone: "0872-2456666", opening_hours: "11:00-21:00", rating: 4.4, is_key_point: false },
    { id: "poi_t1_6", trip_plan_id: "t1", day_index: 3, sort_order: 1, poi_name: "苍山感通索道", type: "景点", description: "上清碧溪与寂照庵，寂照庵的素斋和多肉植物值得专门排队。", suggested_time: "10:00", opening_hours: "08:30-17:00", phone: "0872-2680388", rating: 4.5, is_key_point: false },
    { id: "poi_t1_7", trip_plan_id: "t1", day_index: 3, sort_order: 2, poi_name: "返程航班 MU9720", type: "交通", description: "大理机场 → 上海虹桥，建议提前2小时到达机场办理值机。", suggested_time: "18:40", is_key_point: true },
    // t2 四姑娘山（老周的徒步行程，用于广场找搭子演示）
    { id: "poi_t2_1", trip_plan_id: "t2", day_index: 1, sort_order: 1, poi_name: "日隆镇适应性拉练", type: "体验", description: "抵达后先在镇上周边短徒步适应海拔（3200m），晚上早睡。", suggested_time: "15:00", rating: 4.5 },
    { id: "poi_t2_2", trip_plan_id: "t2", day_index: 2, sort_order: 1, poi_name: "长坪沟徒步", type: "徒步路线", description: "喇嘛寺-枯树滩-木骡子，往返约18km，露营木骡子。", suggested_time: "08:00", rating: 4.9, is_key_point: true },
    { id: "poi_t2_3", trip_plan_id: "t2", day_index: 3, sort_order: 1, poi_name: "垭口穿越", type: "徒步路线", description: "翻越4668m垭口下撤至毕棚沟，全程8-10小时，需向导。", suggested_time: "06:30", rating: 4.8, is_key_point: true },
    // t3 京都（阿澜的已完成行程，游记数据源）
    { id: "poi_t3_1", trip_plan_id: "t3", day_index: 1, sort_order: 1, poi_name: "伏见稻荷大社", type: "景点", description: "千本鸟居建议7点前到达避开人流，登山往返约2小时。", suggested_time: "07:00", rating: 4.8 },
    { id: "poi_t3_2", trip_plan_id: "t3", day_index: 2, sort_order: 1, poi_name: "岚山竹林小径", type: "景点", description: "清晨的竹林有雾气，是天龙寺前最美的免费景色。", suggested_time: "08:00", rating: 4.6 },
    { id: "poi_t3_3", trip_plan_id: "t3", day_index: 3, sort_order: 1, poi_name: "锦市场", type: "商场", description: "京都的厨房，豆乳甜甜圈和玉子烧必吃。", suggested_time: "11:00", rating: 4.4 },
  ];

  const groups: Group[] = [
    { id: "g1", trip_plan_id: "t1", name: "大理慢生活小分队", members: ["u1", "u3", "u6"], created_at: tsOffset(-1) },
  ];

  const chat_messages: ChatMessage[] = [
    { id: "c1", group_id: "g1", sender_id: "u3", content: "欢迎来到大理～我是本地地陪小鹿，行程里的问题都可以问我", created_at: tsOffset(-1, 9, 30) },
    { id: "c2", group_id: "g1", sender_id: "u1", content: "太好了！想问下环洱海骑行电动车在哪租比较靠谱？", created_at: tsOffset(-1, 9, 42) },
    { id: "c3", group_id: "g1", sender_id: "u3", content: "才村码头进去第二家「李姐租车」，一天60，押身份证就行，跟她说小鹿介绍的可以抹零头😄", created_at: tsOffset(-1, 9, 50) },
    { id: "c4", group_id: "g1", sender_id: "u6", content: "记下了记下了，那第二天的晚餐我预约了海舍人，4个人位子", created_at: tsOffset(-1, 10, 5) },
  ];

  const expenses: Expense[] = [
    { id: "e1", group_id: "g1", payer_id: "u1", title: "电动车租赁×3", amount: 180, currency: "CNY", split_members: ["u1", "u3", "u6"], created_at: tsOffset(-1, 12, 0) },
    { id: "e2", group_id: "g1", payer_id: "u3", title: "海舍人晚餐", amount: 268, currency: "CNY", split_members: ["u1", "u3", "u6"], created_at: tsOffset(-1, 20, 0) },
    { id: "e3", group_id: "g1", payer_id: "u6", title: "寂照庵门票+索道", amount: 2400, currency: "JPY", split_members: ["u1", "u3", "u6"], created_at: tsOffset(-1, 21, 0) },
  ];

  const posts: Post[] = [
    {
      id: "post1", author_id: "u2", trip_plan_id: "t3", title: "独自在京都走了5天，我把日子过成了电影",
      cover: img("photo-1493976040374-85c8e12f0c0e"), content_type: "full",
      markdown: "## 写在前面\n一个人的京都，不用迁就任何人...",
      summary: ["清晨7点的伏见稻荷，一个人承包千本鸟居", "岚山竹林要赶雾气未散时去", "锦市场豆乳甜甜圈值得排队", "独行5天总花费 ¥4200"],
      destination: "京都", travel_type: "度假", visibility: "public", likes: 892, created_at: tsOffset(-24),
    },
    {
      id: "post2", author_id: "u4", trip_plan_id: "t4", title: "人均480玩转重庆3天2夜（含洪崖洞机位）",
      cover: img("photo-1520869562399-e772f042f422"), content_type: "full",
      markdown: "## 交通\n轻轨3号线直达解放碑...",
      summary: ["青旅床位45/晚还带江景", "洪崖洞最佳机位在千厮门大桥", "小面+豆花饭吃到扶墙", "总花费479元攻略全公开"],
      destination: "重庆", travel_type: "穷游", visibility: "public", likes: 1563, created_at: tsOffset(-10),
    },
    {
      id: "post3", author_id: "u5", title: "四姑娘山长坪沟穿越毕棚沟全记录",
      cover: img("photo-1464822759023-fed622ff2c3b"), content_type: "full",
      markdown: "## 路线\nD1 日隆镇适应...",
      summary: ["4668m垭口翻越全记录", "装备清单和高原反应应对", "向导费用与拼车信息", "全程4天3晚实拍"],
      destination: "四姑娘山", travel_type: "徒步", visibility: "public", likes: 2107, created_at: tsOffset(-40),
    },
    {
      id: "post4", author_id: "u3", trip_plan_id: "t5", title: "作为大理地陪，我最推荐的一日路线",
      cover: img("photo-1537531383499-e772f042f422"), content_type: "full",
      markdown: "## 路线\n古城 - 才村 - 喜洲...",
      summary: ["本地人才知道的3个日落点", "避开游客餐厅的觅食地图", "旺季住宿砍价技巧"],
      destination: "大理", travel_type: "其他", visibility: "public", likes: 689, created_at: tsOffset(-55),
    },
    {
      id: "post5", author_id: "u6", title: "用胃丈量成都：12家苍蝇馆子实测",
      cover: img("photo-1504674900247-0877df9cc836"), content_type: "restaurant",
      markdown: "## 觅食实录\n从玉林到建设路...",
      summary: ["5家值得二刷，3家踩雷", "甜水面 yyds", "人均40吃到扶墙出"],
      destination: "成都", travel_type: "其他", visibility: "public", likes: 934, created_at: tsOffset(-15),
    },
    {
      id: "post6", author_id: "u2", title: "在青岛老城区暴走2万步是什么体验",
      cover: img("photo-1569154941061-e231b4725ef1"), content_type: "full",
      markdown: "## 八大关\n梧桐叶落满街道...",
      summary: ["八大关秋日限定机位", "大学路网红墙错峰攻略", "袋装啤酒的正确打开方式"],
      destination: "青岛", travel_type: "徒步", visibility: "public", likes: 512, created_at: tsOffset(-8),
    },
    {
      id: "post7", author_id: "u4", title: "清迈7天：100块人民币能干什么",
      cover: img("photo-1528181304800-259b08848526"), content_type: "full",
      markdown: "## 泰铢篇\n夜市按摩200铢...",
      summary: ["周末夜市砍价三板斧", "100元=泰式按摩+咖啡+打车", "清迈古城步行全覆盖"],
      destination: "清迈", travel_type: "穷游", visibility: "public", likes: 1201, created_at: tsOffset(-30),
    },
    {
      id: "post8", author_id: "u5", title: "雨崩徒步：神瀑下的十分钟",
      cover: img("photo-1506905925346-21bda4d32df4"), content_type: "full",
      markdown: "## 进山\n西当-雨崩村6小时...",
      summary: ["雨崩最佳季节是10-11月", "神瀑往返5小时实况", "高反药物与补给清单"],
      destination: "雨崩", travel_type: "徒步", visibility: "friends", likes: 322, created_at: tsOffset(-18),
    },
  ];

  const match_applications: MatchApplication[] = [
    {
      id: "ma1", trip_plan_id: "t1", applicant_id: "u4",
      owner_approved: true, applicant_confirmed: false, status: "pending",
      message: "超喜欢大理！我也是穷游党，可以一起拼车拼饭～", created_at: tsOffset(-1, 15, 0),
    },
    {
      id: "ma2", trip_plan_id: "t2", applicant_id: "u1",
      owner_approved: false, applicant_confirmed: false, status: "pending",
      message: "有高原徒步经验（武功山/雨崩），求带！", created_at: tsOffset(-1, 16, 30),
    },
  ];

  const reviews: Review[] = [
    { id: "r1", author_id: "u2", target_type: "poi", target_id: "poi_t1_2", rating: 5, content: "日落时分整片洱海变成金色，随手拍都是屏保，建议提前40分钟到占机位。", created_at: tsOffset(-10) },
    { id: "r2", author_id: "u6", target_type: "poi", target_id: "poi_t1_2", rating: 4, content: "人有点多，但值得。旁边烤乳扇5块钱一串别错过。", created_at: tsOffset(-8) },
    { id: "r3", author_id: "u4", target_type: "poi", target_id: "poi_t1_2", rating: 5, content: "早上还能看到晨雾，像仙境一样。", created_at: tsOffset(-6) },
    { id: "r4", author_id: "u5", target_type: "poi", target_id: "poi_t1_1", rating: 4, content: "商业化有点重，但清晨的古城还是很美，人民路的酒吧街晚上可以去。", created_at: tsOffset(-12) },
    { id: "r5", author_id: "u3", target_type: "poi", target_id: "poi_t1_1", rating: 5, content: "作为本地人推荐：不要买门票进景点，在城里慢慢逛就好。", created_at: tsOffset(-15) },
    { id: "r6", author_id: "u3", target_type: "user", target_id: "u1", rating: 5, content: "很靠谱的搭子，全程AA很爽快，期待下次同行。", created_at: tsOffset(-3) },
  ];

  return { users, trip_plans, poi_items, groups, chat_messages, expenses, posts, match_applications, reviews, session: null };
}

/* ---------- 读写 ---------- */

let cache: DB | null = null;

export function getDb(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") {
    // SSR：返回种子数据（只读展示用）
    return seed();
  }
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      cache = JSON.parse(raw) as DB;
      return cache;
    }
  } catch {
    /* 数据损坏则重建 */
  }
  cache = seed();
  saveDb();
  return cache;
}

export function saveDb() {
  if (typeof window === "undefined" || !cache) return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(cache));
}

/** 所有变更操作通过 mutate 包裹，自动持久化 */
export function mutate<T>(fn: (db: DB) => T): T {
  const db = getDb();
  const result = fn(db);
  saveDb();
  return result;
}

export function resetDb() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DB_KEY);
  cache = null;
}
