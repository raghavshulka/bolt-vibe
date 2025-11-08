import { BASE_PROMPT } from "@/app/Components/prompts";
import { nextprompt } from "@/app/Components/stackType/nextprompt";
import { nodeprompt } from "@/app/Components/stackType/nodeprompt";
import { reactprompt } from "@/app/Components/stackType/reactprompt";
import { htmlprompt } from "@/app/Components/stackType/htmlprompt";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  message?: string;
}

type StackType = "react" | "node" | "nextjs" | "next" | "html" | "htmlcss" | "htmlcssjs";

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    
    // Validate request body
    if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid request: message is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const message = body.message.trim();

    // Classify the stack type using AI
    const response = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      system: `You are a strict classifier. Your job is to look at the user's message and return ONLY one of these words: "node", "react", "nextjs", or "html".
     Do NOT explain your answer.
     Do NOT generate any code.
     Do NOT return anything except one of these four words.
     Classification rules:
     - Use "html" for plain HTML, CSS, and JavaScript projects (no frameworks, no React, no Node.js backend)
     - Use "react" for React applications (with Vite or Create React App)
     - Use "nextjs" for Next.js applications
     - Use "node" for Node.js backend/server applications
     If you are unsure, pick the closest match.
    Your response MUST be exactly one of: node, react, nextjs, html.`,
      temperature: 0.1, 
    });

    const answer = response.text.trim().toLowerCase() as StackType;
    console.log("Classified stack type:", answer);

    if (answer === "react") {
      return NextResponse.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactprompt],
        stackType: "react",
      });
    }

    if (answer === "node") {
      return NextResponse.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeprompt],
        stackType: "node",
      });
    }

    if (answer === "nextjs" || answer === "next") {
      return NextResponse.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nextprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nextprompt],
        stackType: "nextjs",
      });
    }

    if (answer === "html" || answer === "htmlcss" || answer === "htmlcssjs") {
      return NextResponse.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${htmlprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [htmlprompt],
        stackType: "html",
      });
    }

    return NextResponse.json(
      {
        error: "Unable to determine stack type. Please specify 'react', 'node', 'nextjs', or 'html' in your request.",
        stackType: null,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in /api/stacktemplate:", error);
    
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
        { error: `Classification failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during stack classification" },
      { status: 500 }
    );
  }
}
