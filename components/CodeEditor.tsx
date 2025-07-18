import type React from "react"
import type { FileItem } from "../lib/ts"
import { FileText } from "lucide-react"

interface CodeEditorProps {
  file: FileItem | null
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ file }) => {
  if (!file || file.type !== "file") {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No file selected</p>
          <p className="text-sm">Select a file from the explorer to view its contents</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-muted/50 rounded-lg">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{file.name}</span>
          <span className="text-xs text-muted-foreground">({file.path})</span>
        </div>
      </div>
      <div className="p-4 h-[calc(100%-4rem)] overflow-auto">
        <pre className="text-sm text-foreground font-mono leading-relaxed">
          <code>{file.content || "// File is empty"}</code>
        </pre>
      </div>
    </div>
  )
}
