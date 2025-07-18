import { BASE_PROMPT } from "@/app/Components/prompts";
import { nextprompt } from "@/app/Components/stackType/nextprompt";
import { nodeprompt } from "@/app/Components/stackType/nodeprompt";
import { reactprompt } from "@/app/Components/stackType/reactprompt";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

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
    system: `You are a strict classifier. Your job is to look at the user's message and return ONLY one of these words: "node", "react", or "nextjs".
     Do NOT explain your answer.
     Do NOT generate any code.
     Do NOT return anything except one of these three words.
     If you are unsure, pick the closest match.
    Your response MUST be exactly one of: node, react, nextjs.`,
  });

  const answer = response.text.trim().toLowerCase();
  console.log(answer);

  if (answer === "react") {
    return NextResponse.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactprompt],
    });
  }

  if (answer === "node") {
    return NextResponse.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeprompt],
    });
  }

  if (answer === "nextjs" || answer === "next") {
    return NextResponse.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nextprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nextprompt],
    });
  }

  return NextResponse.json({
    error: "the type of textstak you are giving is not available",
  });
}
