"use client"

import { useState } from "react"
import { AnalyzeForm } from "@/components/analyze-form"
import { StatsDisplay } from "@/components/stats-display"
import type { RepoStats } from "@/types/repo"

export function BusFactor() {
  const [stats, setStats] = useState<RepoStats | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  function handleAnalysisComplete(newStats: RepoStats) {
    setStats(newStats)
    setIsAnalyzing(!!newStats.isProcessing)
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">BusFactor</h1>
      <AnalyzeForm
        onAnalysisComplete={handleAnalysisComplete}
        isAnalyzing={isAnalyzing}
      />
      {stats && !isAnalyzing && <StatsDisplay stats={stats} />}
    </div>
  )
}
