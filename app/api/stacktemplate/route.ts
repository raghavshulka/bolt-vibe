import { BASE_PROMPT } from "@/app/Components/prompts";
import { nextprompt } from "@/app/Components/stackType/nextprompt";
import { nodeprompt } from "@/app/Components/stackType/nodeprompt";
import { reactprompt } from "@/app/Components/stackType/reactprompt";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GKEY;

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const response = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    system:
      "Return either nextjs or node or react based on what do you think this project should be. Only return a single word either 'node' or 'react' or 'nextjs or can be next'. !Do not return anything extra",
  });

  const answer = response.text;

  if (answer == "react") {
    NextResponse.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactprompt],
    });
    return;
  }

  if (answer === "node") {
    NextResponse.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeprompt],
    });
    return;
  }

  if (answer === "nextjs") {
    NextResponse.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nextprompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nextprompt],
    });
    return;
  }
  NextResponse.json("the type of textstak you are giving is not available");
}


