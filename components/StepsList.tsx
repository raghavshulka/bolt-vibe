"use client"

import type React from "react"
import { Check, Clock, Play } from "lucide-react"
import type { Step } from "../lib/ts"

interface StepsListProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}

export const StepsList: React.FC<StepsListProps> = ({ steps, currentStep, onStepClick }) => {
  const getStepIcon = (status: string, index: number) => {
    if (status === "completed") {
      return <Check className="w-4 h-4 text-chart-4" />
    } else if (status === "pending") {
      return <Clock className="w-4 h-4 text-chart-5" />
    } else {
      return <Play className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStepBorderColor = (status: string) => {
    if (status === "completed") return "border-chart-4/30 bg-chart-4/5"
    if (status === "pending") return "border-chart-5/30 bg-chart-5/5"
    return "border-border bg-muted/20"
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={index}
          onClick={() => onStepClick(index + 1)}
          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent/30 ${getStepBorderColor(step.status)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.status, index)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">{step.title}</h3>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{step.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">Step {index + 1}</span>
                {step.status === "completed" && <span className="text-xs text-chart-4">✓ Done</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
