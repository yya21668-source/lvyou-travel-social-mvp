import Anthropic from "@anthropic-ai/sdk";
import { summaryPrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";

export async function POST(request: Request){const {content=""}=await request.json().catch(()=>({}));if(!process.env.ANTHROPIC_API_KEY)return NextResponse.json({summary:["路线节奏轻松","包含交通与预算提示","适合朋友结伴出发"],source:"mock"});try{const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});const message=await client.messages.create({model:"claude-3-5-haiku-latest",max_tokens:300,system:summaryPrompt,messages:[{role:"user",content:String(content).slice(0,12000)}]});const block=message.content.find(b=>b.type==="text");const text=block&&block.type==="text"?block.text:"[]";return NextResponse.json({summary:JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g,"")),source:"claude"})}catch{return NextResponse.json({summary:["值得收藏的旅行灵感"],source:"fallback"})}}
