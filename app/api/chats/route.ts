import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt } from "@/app/Components/prompts";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages = Array.isArray(body.messages)
    ? body.messages.map((m: any) => ({
        role: typeof m.role === "string" ? m.role : "user",
        content: typeof m.message === "string" ? m.message : "",
      }))
    : [];

  if (!messages.length || messages.some((m: any) => !m.content)) {
    return NextResponse.json(
      { error: "Each message must have a string content." },
      { status: 400 }
    );
  }

  const response = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    messages,
    system: getSystemPrompt(),
  });
  return NextResponse.json({
    response: response.text,
  });
}
