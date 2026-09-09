import type { GuidePost, TripPlan } from "@/types/domain";

export const demoTrip: TripPlan = {
  id: "yunnan-summer",
  destination: "云南 · 大理",
  startDate: "2026-09-18",
  endDate: "2026-09-21",
  style: "度假",
  visibility: "public",
  status: "planned",
  days: [
    {
      date: "09月18日",
      title: "风抵达的地方",
      items: [
        { id: "erhai", poi_name: "洱海生态廊道", type: "自然风光", description: "从才村慢慢骑向喜洲，沿途把风和稻田装进口袋。", suggested_time: "10:00", address: "大理市环海西路", opening_hours: "全天开放", phone: "0872-1234567", image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85" },
        { id: "xizhou", poi_name: "喜洲古镇", type: "人文漫游", description: "看白族老建筑，尝一块刚出炉的喜洲粑粑。", suggested_time: "15:30", address: "大理市喜洲镇", opening_hours: "全天开放", phone: "0872-2453966", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85" },
      ],
    },
    {
      date: "09月19日",
      title: "云从山顶经过",
      items: [
        { id: "cangshan", poi_name: "苍山感通索道", type: "轻徒步", description: "穿过松林与溪涧，在高处俯瞰洱海的光。", suggested_time: "09:00", address: "大理市苍山景区", opening_hours: "08:30–16:00", phone: "0872-2670349", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85" },
        { id: "ancient-city", poi_name: "大理古城", type: "夜游", description: "避开主街，去人民路的小店和屋顶看落日。", suggested_time: "18:30", address: "大理市一塔路", opening_hours: "全天开放", phone: "0872-2670396", image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85" },
      ],
    },
  ],
};

export const guides: GuidePost[] = [
  { id: "dali-wind", title: "在大理，把日子过成一阵风", destination: "大理", author: "阿禾", avatar: "禾", image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&q=85", likes: 1284, style: "度假", recruiting: true, visibility: "public", summary: ["洱海西线骑行", "喜洲清晨最松弛", "人均 ¥1,860"] },
  { id: "wugong", title: "武功山两天一夜，新手也能追到云海", destination: "萍乡", author: "山川", avatar: "川", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85", likes: 892, style: "徒步", recruiting: true, visibility: "public", summary: ["反穿路线更省力", "帐篷需提前订", "日出 05:38"] },
  { id: "quanzhou", title: "泉州：半城烟火，半城仙", destination: "泉州", author: "栗子", avatar: "栗", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=85", likes: 657, style: "穷游", recruiting: false, visibility: "public", summary: ["古城步行路线", "面线糊早餐", "簪花拍照避坑"] },
  { id: "xiamen", title: "不赶景点的厦门周末", destination: "厦门", author: "小满", avatar: "满", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=85", likes: 431, style: "其他", recruiting: false, visibility: "friends", summary: ["海边慢行", "沙坡尾小店", "本地人食堂"] },
];

export const members = [
  { id: "me", name: "陈曦", avatar: "曦", verified: true, role: "发起人" },
  { id: "he", name: "阿禾", avatar: "禾", verified: true, role: "成员" },
  { id: "lin", name: "林屿", avatar: "屿", verified: false, role: "成员" },
];

export const mockRates: Record<string, number> = { CNY: 1, USD: 7.18, JPY: 0.048 };
