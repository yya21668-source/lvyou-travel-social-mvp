/**
 * 本地Mock行程/游记生成器
 * 无 ANTHROPIC_API_KEY 时的优雅降级，保证MVP原型可完整演示
 */
import type { AiItineraryDay, PoiType } from "@/types";

interface PoiTemplate {
  name: string;
  type: PoiType;
  desc: string;
}

/** 按旅行形式的POI模板池（name中的{D}会被替换为目的地） */
const POOLS: Record<string, PoiTemplate[]> = {
  徒步: [
    { name: "{D}徒步起点·装备检查", type: "体验", desc: "出发前检查水、能量补给和防晒，高原地区提前1天适应海拔。" },
    { name: "{D}经典徒步线路·东段", type: "徒步路线", desc: "全程约12km，前半段缓坡，中途观景台是最佳拍照点，建议预留4小时。" },
    { name: "山间补给站", type: "餐厅", desc: "徒步中点唯一的补给点，泡面和热水15元起，建议自带轻量干粮。" },
    { name: "{D}徒步线路·西段登顶", type: "徒步路线", desc: "最后2km坡度较大，量力而行。登顶后视野开阔，可远眺雪山轮廓。" },
    { name: "山下农家乐", type: "餐厅", desc: "下山后犒劳自己，土鸡汤锅人均45，老板能帮忙联系次日拼车。" },
    { name: "{D}镇上青年旅舍", type: "住宿", desc: "床位40-60元，公共区域适合认识同行伙伴，可代收快递寄存装备。" },
    { name: "返程班车/航班", type: "交通", desc: "末班车17:30，赶不上可在镇上住一晚，次日早班车更从容。" },
  ],
  穷游: [
    { name: "{D}老城区免费步行路线", type: "景点", desc: "不花门票就能逛完的精华路线，早晨人少光线好，全程约3小时。" },
    { name: "本地人早市", type: "体验", desc: "10块钱吃到扶墙出，跟着本地阿姨排队准没错。" },
    { name: "公交环线观光", type: "交通", desc: "2元公交当观光车坐，靠窗第二排视野最佳，全程约70分钟。" },
    { name: "{D}美食街·平价档口", type: "餐厅", desc: "避开主街网红店，往里走两个巷口的档口便宜一半，人均25管饱。" },
    { name: "免费观景台/天台", type: "景点", desc: "看日落的免费机位，比收费观景台视角还好，记得提前40分钟占位。" },
    { name: "青旅/胶囊旅馆", type: "住宿", desc: "床位45-70元，含早餐，前台可以拼车拼团，公共区能找到搭子。" },
    { name: "城市博物馆（免费日）", type: "景点", desc: "多数博物馆周一闭馆，预约制免费入场，记得带身份证。" },
    { name: "返程火车硬座", type: "交通", desc: "夜间车次省一晚住宿，提前候补成功率更高。" },
  ],
  度假: [
    { name: "{D}高颜值民宿/酒店", type: "住宿", desc: "提前2周订性价比最高，选含早餐的湖景房，早晨不用出门就能看日出。" },
    { name: "{D}湖畔/海边晨间漫步", type: "体验", desc: "趁清晨凉爽沿水岸线散步，光线柔和适合拍照，全程约40分钟。" },
    { name: "特色早午餐咖啡馆", type: "餐厅", desc: "本地烘焙豆子+手作甜品，人均60，靠窗位需要等位15分钟左右。" },
    { name: "{D}标志性景区", type: "景点", desc: "建议线上购票走快速通道，下午4点后人流骤减，游览体验最佳。" },
    { name: "日落时分·观景餐厅", type: "餐厅", desc: "提前订靠窗位，人均120，日落前30分钟入座正好。" },
    { name: "SPA/温泉放松", type: "体验", desc: "行程过半安排一次按摩恢复体力，90分钟套餐约200元，记得预约。" },
    { name: "{D}手作市集", type: "商场", desc: "本地手艺人聚集的市集，适合挑伴手礼，记得对半砍价。" },
    { name: "返程航班", type: "交通", desc: "建议选傍晚航班，退房后还能再玩半天，机场大巴提前2.5小时出发。" },
  ],
  其他: [
    { name: "{D}古城/历史街区", type: "景点", desc: "核心游览区，建议留3小时慢慢逛，巷子深处才有惊喜小店。" },
    { name: "{D}地标观景处", type: "景点", desc: "城市名片级打卡点，日落时分最出片，人多但值得。" },
    { name: "人气本地菜馆", type: "餐厅", desc: "本地食客占比高的店，人均70，招牌菜下午5点后可能售罄。" },
    { name: "文化展馆/艺术空间", type: "景点", desc: "雨天备选方案，常有免费特展，馆内咖啡厅也值得坐坐。" },
    { name: "{D}夜市", type: "体验", desc: "晚上7点后才是夜市的正确打开方式，先逛一圈再下手。" },
    { name: "交通枢纽返程", type: "交通", desc: "预留充足时间前往车站/机场，高峰期打车建议提前30分钟叫车。" },
  ],
};

const TIME_SLOTS = ["08:30", "10:00", "11:30", "14:00", "16:00", "18:30", "20:00"];

/** mock行程生成：确定性（同输入同输出），带目的地哈希扰动 */
export function generateMockItinerary(input: {
  destination: string;
  days: number;
  travelType: string;
}): AiItineraryDay[] {
  const pool = POOLS[input.travelType] ?? POOLS["其他"];
  let h = 0;
  for (const c of input.destination) h = (h * 137 + c.charCodeAt(0)) % 99991;

  const days: AiItineraryDay[] = [];
  for (let d = 1; d <= input.days; d++) {
    const count = Math.min(5, 4 + ((h + d) % 2));
    const items = [];
    for (let i = 0; i < count; i++) {
      const tpl = pool[(h + d * 3 + i) % pool.length];
      items.push({
        poi_name: tpl.name.replace(/\{D\}/g, input.destination),
        type: tpl.type,
        description: tpl.desc,
        suggested_time: TIME_SLOTS[Math.min(i + (d % 2), TIME_SLOTS.length - 1)],
      });
    }
    // 每天首个时间对齐 08:30 或 09:00
    items[0].suggested_time = d % 2 === 0 ? "09:00" : "08:30";
    days.push({ day: d, items });
  }
  return days;
}

/** mock游记生成：基于真实POI列表与花费 */
export function generateMockRecap(ctx: {
  destination: string;
  travelType: string;
  poiNames: string[];
  expenseLines: string[];
  userNotes: string;
  category?: string;
}): string {
  const { destination, poiNames, expenseLines, userNotes, category } = ctx;
  const total = expenseLines.length
    ? `\n这一趟的总花费大约在 **${expenseLines.length * 300 + 800} 元** 上下，${ctx.travelType === "穷游" ? "对穷游党来说还算体面" : "性价比可以接受"}。`
    : "";

  const poiMentions = poiNames.slice(0, 6).map(
    (n, i) => `${i + 1}. **${n}** —— ${["印象最深的一站", "意外之喜", "值得专门再去一次", "人多但没白来", "本地朋友强烈推荐", "适合发呆一下午"][i % 6]}。`
  );

  const catNote = category
    ? `> 本篇是「${category}」专题篇，聚焦这一路的${category}体验。\n\n`
    : "";

  return `## 写在${destination}的风里

${catNote}这趟${destination}之行，从落地那一刻就没有让人失望。${poiNames[0] ?? "第一站"}是全天的高光，比想象中更值得慢慢逛。

## 走过的路

${poiMentions.join("\n")}

## 花了多少钱
${expenseLines.length ? expenseLines.map((l) => `- ${l}`).join("\n") : "- 这趟刻意没记账，快乐无价。"}${total}

## 给后来者的建议

- ${poiNames[0] ?? "热门景点"}一定赶早，9点后人流翻倍
- ${ctx.travelType === "徒步" ? "高原地区带够保暖层，山下山上两个季节" : "提前在App里生成行程框架，到地儿按需微调最省心"}
- 找个本地地陪或靠谱搭子同行，体验直接翻倍
${userNotes ? `\n> ${userNotes}` : ""}
`;
}

/** mock摘要生成：从markdown中提取3-5条要点 */
export function generateMockSummary(markdown: string): string[] {
  const points: string[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const m = line.match(/^\d+\.\s*\*\*(.+?)\*\*/);
    if (m) points.push(m[1].slice(0, 18));
    const b = line.match(/^- (.+)$/);
    if (b) points.push(b[1].replace(/\*\*/g, "").slice(0, 18));
    if (points.length >= 5) break;
  }
  if (points.length < 3) {
    const heading = markdown.match(/^##\s+(.+)$/m);
    if (heading) points.push(heading[1].slice(0, 18));
    points.push("总花费与性价比速览", "适合同类旅行形式参考");
  }
  return points.slice(0, 5);
}
