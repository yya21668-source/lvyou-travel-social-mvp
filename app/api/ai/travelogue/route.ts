import Anthropic from "@anthropic-ai/sdk";
import { traveloguePrompt } from "@/lib/ai/prompts";
import { demoTrip } from "@/mocks/data";
import { NextResponse } from "next/server";

const mockMarkdown = `# 在大理，把日子过成一阵风\n\n四天里，我们沿着洱海骑行，也在苍山的云里慢慢走。最值得记下的不是完成了多少景点，而是每个人都能自在地调整节奏。\n\n## 交通\n落地后拼车进古城最方便，洱海西线更推荐自行车。\n\n## 景点\n喜洲适合早上抵达，苍山记得准备一件防风外套。\n\n## 花费\n本次三人合计约 ¥1,009.28，住宿是主要支出。`;
export async function POST(request: Request) { const input = await request.json().catch(()=>({})); if(!process.env.ANTHROPIC_API_KEY) return NextResponse.json({markdown:mockMarkdown,source:"mock"}); try { const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const message=await client.messages.create({model:"claude-3-5-sonnet-latest",max_tokens:3000,messages:[{role:"user",content:traveloguePrompt({trip:demoTrip,expenses:input.expenses||[],notes:input.notes||""},input.mode)}]}); const block=message.content.find(b=>b.type==="text"); return NextResponse.json({markdown:block&&block.type==="text"?block.text:mockMarkdown,source:"claude"}); } catch(error){return NextResponse.json({error:"攻略生成失败",detail:error instanceof Error?error.message:"unknown"},{status:502})} }
