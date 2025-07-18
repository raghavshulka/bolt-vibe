"use client"
import { useState } from "react"
import type React from "react"

import { Wand2, Sparkles, Code2, Zap, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

const Home = () => {
  const [prompt, setPrompt] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      router.push(`/new?prompt=${encodeURIComponent(prompt)}`)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-foreground mb-6">bolt-vibe</h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into beautiful, functional websites with the power of AI. Describe your vision, and
              watch it come to life.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="text-sm text-card-foreground">Smart Code Generation</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-card-foreground">AI-Powered Design</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-card-foreground">Instant Preview</span>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl  mx-auto">
            <div className="relative">
              <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                <div className="">
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="(e.g., 'hello world app in react')"
                      className="w-full h-30  p-6 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-300 resize-none placeholder:text-muted-foreground text-lg leading-relaxed text-foreground pr-12"
                    />
                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className="absolute bottom-3 right-3 bg-primary text-primary-foreground rounded-full p-2 shadow-md hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                      style={{ width: 36, height: 36 }}
                      aria-label="Send"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Home
