import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt } from "@/app/Components/prompts";

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const response = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      {
        role: "user",
        content: "genrate a todo app in react",
      },
    ],
    system: getSystemPrompt(),
  });
  return NextResponse.json({
    response: response.text,
  });
}
