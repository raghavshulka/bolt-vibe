# bolt-vibe + t3chat theme

**AI-Powered Website & Code Generator**

bolt-vibe enables you to turn your ideas into beautiful, functional websites and code projects using the power of AI. Just describe your vision in natural language, and watch it come to life with smart code generation, AI-powered design, and instant preview—all in your browser.

## Features

- ✨ Generate full-stack web projects from a simple prompt
- ⚡️ Instant code preview and editing in the browser
- 🧠 AI-powered design and code suggestions
- 🗂️ File explorer and code editor UI
- 🏗️ Supports React, Next.js, and Node.js project templates
- 🖥️ Runs fully in-browser using WebContainer (no backend required for code execution)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

### how do i make it

I used  Vercel AI SDK with the Groq model, then got the prompt from Bolt AI and created two routes. The first route checks for the template, and the second one creates it.
For example: “Create a Next.js todo app in React” — here, React is the template, and todo is what it has to build.

Then ,  I creates a file system where I pass the data and display it.  I used the WebContainer API . The WebContainer API helps run the project and shows the output in the browser.



Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. On the home page, enter a description of your desired website or app (e.g., "hello world app in react").
2. Click the send arrow or press Enter.
3. The AI will generate a project plan, code files, and a live preview.
4. Explore and preview your project instantly.

## How It Works

- The app uses the Vercel AI SDK with the Groq model to process your prompt.
- The prompt is analyzed to determine the project template (e.g., React, Next.js, Node.js) and the specific task (e.g., "todo app").
- Two API routes are used:
  - One to classify and select the appropriate template.
  - Another to generate the project files and plan based on your request.
- The WebContainer API is used to create a virtual filesystem and run the generated project entirely in your browser, providing a live preview and interactive code editing experience.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router, Client Components)
- [WebContainer API](https://webcontainers.io/) (in-browser Node.js runtime)
- [Vercel AI SDK (Groq)](https://sdk.vercel.ai/) (AI code generation)

## License

MIT
