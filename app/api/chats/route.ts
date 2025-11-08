import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt } from "@/app/Components/prompts";

interface ChatMessage {
  role: "user" | "assistant";
  message: string;
}

interface RequestBody {
  messages?: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    const messages = body.messages
      .filter((m) => m && typeof m === "object" && "role" in m && "message" in m)
      .map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: typeof m.message === "string" ? m.message : String(m.message || ""),
      }));

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: at least one message is required" },
        { status: 400 }
      );
    }

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      messages,
      system: getSystemPrompt(),
      temperature: 0.7,
    });

    return NextResponse.json({
      response: response.text,
    });
  } catch (error) {
    console.error("Error in /api/chats:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Invalid API configuration. Please check your OpenAI API key." },
          { status: 401 }
        );
      }
      
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Generation failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
