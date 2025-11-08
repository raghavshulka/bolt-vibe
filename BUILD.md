# How bolt-vibe is Built

A comprehensive guide to understanding the architecture, components, and build process of bolt-vibe.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [API Routes](#api-routes)
6. [WebContainer Integration](#webcontainer-integration)
7. [Build Process](#build-process)
8. [Key Technologies](#key-technologies)

## Overview

bolt-vibe is an AI-powered code generator that creates full-stack web applications from natural language prompts. It uses:

- **Vercel AI SDK** with OpenAI for code generation
- **WebContainer API** for in-browser code execution
- **Next.js 15** with App Router for the frontend
- **React 19** for UI components

The system works in two stages:
1. **Classification**: Determines the project type (React, Next.js, Node.js, or HTML/CSS/JS)
2. **Generation**: Creates project files based on the user's prompt

## Architecture

### High-Level Flow

```
User Prompt
    ↓
[Stack Template Classifier API]
    ↓
[Code Generation API]
    ↓
[XML Parser] → [File System Builder]
    ↓
[WebContainer Mount] → [npm install] → [npm run dev]
    ↓
[Live Preview in Browser]
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Builder    │  │ FileExplorer │  │ PreviewFrame │ │
│  │   Page       │  │              │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
│         └─────────────────┴──────────────────┘         │
│                         │                                │
│         ┌───────────────▼───────────────┐              │
│         │    useWebContainer Hook        │              │
│         │    (Singleton Pattern)        │              │
│         └───────────────┬───────────────┘              │
└─────────────────────────┼──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│              WebContainer API                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Virtual FS   │  │ npm install  │  │ Dev Server  │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│              Backend API Routes                        │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ /api/stacktemplate│  │  /api/chats      │         │
│  │ (Classification)  │  │  (Generation)    │         │
│  └────────┬──────────┘  └────────┬─────────┘         │
│           │                      │                     │
│           └──────────┬────────────┘                    │
│                     ▼                                  │
│            Vercel AI SDK (OpenAI)                     │
└────────────────────────────────────────────────────────┘
```

## Project Structure

```
vibeide/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chats/               # Code generation endpoint
│   │   │   └── route.ts
│   │   └── stacktemplate/       # Stack classification endpoint
│   │       └── route.ts
│   ├── Components/              # Server-side components & prompts
│   │   ├── prompts.ts          # System prompts for AI
│   │   └── stackType/           # Stack-specific templates
│   │       ├── reactprompt.ts
│   │       ├── nextprompt.ts
│   │       ├── nodeprompt.ts
│   │       └── htmlprompt.ts
│   ├── new/                     # Main builder page
│   │   └── page.tsx
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── PreviewFrame.tsx         # WebContainer preview & terminal
│   ├── FileExplorer.tsx        # File tree navigation
│   ├── CodeEditor.tsx          # Monaco editor integration
│   ├── StepsList.tsx           # Build steps display
│   └── ui/                     # shadcn/ui components
├── hooks/                       # Custom React hooks
│   └── usewebContainerHook.tsx # WebContainer singleton hook
├── lib/                         # Utilities
│   ├── steps.ts                # XML parser for artifacts
│   └── ts.ts                   # TypeScript types
└── package.json
```

## Core Components

### 1. Builder Page (`app/new/page.tsx`)

The main orchestrator component that:
- Receives user prompts via URL search params
- Calls classification API to determine stack type
- Calls generation API to create project files
- Parses XML artifacts into file structure
- Manages file state and WebContainer mounting
- Renders the three-panel UI (Steps, Files, Code/Preview)

**Key State:**
- `files`: FileItem[] - Generated file structure
- `steps`: Step[] - Build steps from AI response
- `webcontainer`: WebContainer instance
- `activeTab`: 'code' | 'preview'

### 2. PreviewFrame Component (`components/PreviewFrame.tsx`)

Handles WebContainer execution and preview:

**Features:**
- Converts FileItem[] to WebContainer mount structure
- Mounts files to WebContainer virtual filesystem
- Runs `npm install` with output streaming
- Starts dev server (`npm run dev`)
- Displays terminal output in real-time
- Shows preview in iframe when server is ready
- Handles errors gracefully with clear messages

**Key Features:**
- Terminal output display (fixed height, scrollable)
- Process status tracking (installing, starting, running, error)
- Error handling for exit codes (including SIGTERM 143)
- Stream handling for different chunk types (string, Uint8Array, ArrayBuffer)

### 3. useWebContainer Hook (`hooks/usewebContainerHook.tsx`)

Singleton pattern implementation for WebContainer:

**Why Singleton?**
- WebContainer API only allows one instance per browser session
- Prevents multiple boot attempts and resource waste
- Ensures consistent state across component remounts

**Implementation:**
```typescript
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

// First call: boots WebContainer
// Subsequent calls: returns existing instance or waits for boot
```

### 4. XML Parser (`lib/steps.ts`)

Parses AI-generated XML artifacts:

**XML Format:**
```xml
<boltArtifact id="project-id" title="Project Title">
  <boltAction type="file" filePath="path/to/file.jsx">
    // File content
  </boltAction>
  <boltAction type="shell">
    npm install
  </boltAction>
</boltArtifact>
```

**Output:**
- Array of `Step` objects with type, path, and content
- Converts to `FileItem[]` structure for file tree

## API Routes

### 1. `/api/stacktemplate` (POST)

**Purpose:** Classifies the user's prompt to determine project type

**Input:**
```json
{
  "message": "Create a todo app in React"
}
```

**Process:**
1. Uses OpenAI GPT-4o-mini with strict classification prompt
2. Returns one of: "react", "nextjs", "node", or "html"
3. Returns appropriate stack template prompts

**Output:**
```json
{
  "prompts": ["BASE_PROMPT", "stack-specific-prompt"],
  "uiPrompts": ["stack-template-xml"],
  "stackType": "react"
}
```

**Classification Rules:**
- "html" - Plain HTML/CSS/JS (no frameworks)
- "react" - React with Vite
- "nextjs" - Next.js applications
- "node" - Node.js backend/server apps

### 2. `/api/chats` (POST)

**Purpose:** Generates project code based on prompts

**Input:**
```json
{
  "messages": [
    { "role": "user", "message": "BASE_PROMPT" },
    { "role": "user", "message": "stack-template" },
    { "role": "user", "message": "Create a todo app" }
  ]
}
```

**Process:**
1. Validates message array
2. Transforms to AI SDK format
3. Calls `generateText` with system prompt
4. Returns XML artifact with project files

**Output:**
```json
{
  "response": "<boltArtifact>...</boltArtifact>"
}
```

**Error Handling:**
- 400: Invalid request format
- 401: API key issues
- 429: Rate limit exceeded
- 500: Generation failures

## WebContainer Integration

### File System Mounting

**Process:**
1. Convert `FileItem[]` to WebContainer `FileSystemTree` format
2. Call `webcontainer.mount(mountStructure)`
3. Wait for mount completion
4. Start npm install

**Mount Structure:**
```typescript
{
  "package.json": {
    file: { contents: "..." }
  },
  "src": {
    directory: {
      "App.jsx": {
        file: { contents: "..." }
      }
    }
  }
}
```

### Process Execution

**Installation:**
```typescript
const installProcess = await webContainer.spawn('npm', ['install'], {
  output: true
});

// Stream output to terminal
installProcess.output.pipeTo(new WritableStream({
  write(chunk) { /* handle output */ }
}));

await installProcess.exit; // Wait for completion
```

**Dev Server:**
```typescript
const devProcess = await webContainer.spawn('npm', ['run', 'dev'], {
  output: true
});

// Listen for server-ready event
webContainer.on('server-ready', (port, url) => {
  setUrl(url); // Display in iframe
});
```

### Error Handling

**Exit Code 143 (SIGTERM):**
- Process was killed (timeout or cleanup)
- Shows informative error message
- Prevents starting dev server without dependencies

**Stream Errors:**
- Handles different chunk types (string, Uint8Array, ArrayBuffer)
- Continues processing even if individual chunks fail
- Logs errors without crashing

## Build Process

### Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   ```env
   OPENAI_API_KEY=your_key_here
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

### Production Build

```bash
npm run build
npm start
```

### Key Dependencies

**Core:**
- `next@15.4.1` - React framework
- `react@19.1.0` - UI library
- `ai@^5.0.89` - Vercel AI SDK
- `@ai-sdk/openai@^2.0.64` - OpenAI provider

**WebContainer:**
- `@webcontainer/api@^1.6.1` - In-browser Node.js runtime

**UI:**
- `@radix-ui/*` - Headless UI components
- `tailwindcss@^4` - Styling
- `lucide-react` - Icons
- `@monaco-editor/react` - Code editor

## Key Technologies

### 1. Vercel AI SDK

**Usage:**
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const response = await generateText({
  model: openai('gpt-4o-mini'),
  messages: [...],
  system: systemPrompt,
  temperature: 0.7
});
```

**Features:**
- Streaming support (not used in current implementation)
- Multiple model providers
- Type-safe API

### 2. WebContainer API

**Capabilities:**
- Virtual filesystem
- npm package installation
- Process execution
- Server-ready events
- File watching

**Limitations:**
- No native binaries
- Limited Python (standard library only)
- No Git
- Browser-only execution

### 3. Next.js App Router

**Structure:**
- Server Components by default
- API routes in `app/api/`
- Client Components with `"use client"`
- Route handlers for API endpoints

### 4. XML Artifact Format

**Why XML?**
- Structured format for complex project generation
- Easy to parse and validate
- Supports multiple file types and shell commands
- Clear separation of concerns

**Parser:**
- Custom parser in `lib/steps.ts`
- Extracts `<boltAction>` elements
- Converts to Step objects
- Builds file tree structure

## Code Generation Flow

### Step-by-Step Process

1. **User submits prompt** → `app/new/page.tsx`

2. **Classification** → `/api/stacktemplate`
   - Analyzes prompt for stack type
   - Returns appropriate template prompts

3. **Code Generation** → `/api/chats`
   - Combines BASE_PROMPT + stack template + user prompt
   - Generates XML artifact with all project files
   - Returns complete project structure

4. **Parsing** → `lib/steps.ts`
   - Parses XML to extract files and commands
   - Creates Step[] array
   - Converts to FileItem[] tree structure

5. **File System Building** → `app/new/page.tsx`
   - Processes steps to build file tree
   - Updates files state
   - Marks steps as completed

6. **WebContainer Mounting** → `components/PreviewFrame.tsx`
   - Converts FileItem[] to mount structure
   - Mounts to WebContainer
   - Starts installation and dev server

7. **Preview Display** → `components/PreviewFrame.tsx`
   - Shows terminal output
   - Displays preview in iframe
   - Handles errors gracefully

## Important Design Decisions

### 1. JavaScript Only (No TypeScript)

**Why:**
- TypeScript has high failure rate in WebContainer
- Babel parser errors with TypeScript syntax
- Simpler, more reliable execution

**Implementation:**
- All stack templates use `.js`/`.jsx` files
- System prompts explicitly forbid TypeScript
- No TypeScript dependencies in generated projects

### 2. Singleton WebContainer Pattern

**Why:**
- WebContainer API limitation (one instance only)
- Prevents boot errors and resource waste
- Consistent state management

### 3. XML Artifact Format

**Why:**
- Structured, parseable format
- Supports multiple file types
- Clear action separation
- Easy to validate and process

### 4. Two-Stage API Design

**Why:**
- Separation of concerns (classification vs generation)
- Better error handling
- Reusable stack templates
- Easier to extend with new stack types

### 5. Fixed Terminal Height

**Why:**
- Prevents UI overflow
- Better UX with scrollable terminal
- Consistent layout
- Preview gets remaining space

## Error Handling

### API Errors

- **400**: Invalid request format
- **401**: API key issues
- **429**: Rate limiting
- **500**: Generation failures

### WebContainer Errors

- **Exit Code 143**: Process killed (SIGTERM)
- **Stream Errors**: Chunk type mismatches
- **Mount Errors**: File structure issues
- **Process Errors**: npm install/dev failures

### User-Facing Errors

- Clear error messages in terminal
- Status indicators (installing, error, etc.)
- Helpful tips for common issues
- Graceful degradation

## Future Improvements

1. **Streaming Responses**: Use `streamText` for real-time code generation
2. **Error Recovery**: Retry mechanisms for failed operations
3. **File Editing**: Save changes back to WebContainer
4. **More Stack Types**: Vue, Svelte, etc.
5. **Project Export**: Download generated projects
6. **Collaboration**: Share projects with others

## Contributing

When adding new features:

1. Follow the existing architecture patterns
2. Use JavaScript only (no TypeScript in generated code)
3. Implement proper error handling
4. Update this documentation
5. Test with WebContainer limitations in mind

## License

MIT

