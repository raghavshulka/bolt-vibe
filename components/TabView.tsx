"use client"

import type React from "react"
import { Code, Eye } from "lucide-react"

interface TabViewProps {
  activeTab: "code" | "preview"
  onTabChange: (tab: "code" | "preview") => void
}

export const TabView: React.FC<TabViewProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-border">
      <button
        onClick={() => onTabChange("code")}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
          activeTab === "code"
            ? "text-foreground border-b-2 border-primary bg-accent/30"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
        }`}
      >
        <Code className="w-4 h-4" />
        Code Editor
      </button>
      <button
        onClick={() => onTabChange("preview")}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
          activeTab === "preview"
            ? "text-foreground border-b-2 border-primary bg-accent/30"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
        }`}
      >
        <Eye className="w-4 h-4" />
        Preview
      </button>
    </div>
  )
}
