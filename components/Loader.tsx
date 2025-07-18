import type React from "react"
import { Sparkles } from "lucide-react"

export const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Sparkles className="w-6 h-6 text-primary animate-spin" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">AI is working...</p>
          <p className="text-xs text-muted-foreground">Generating your website</p>
        </div>
      </div>
    </div>
  )
}
