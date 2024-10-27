"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { StatsDisplay } from "@/components/stats-display"
import { analyzeRepo } from "@/app/actions/analyze-repo"
import { cn } from "@/lib/utils"
import { RepoStats } from "@/types/repo"

interface AnalysisState {
    isLoading: boolean
    error?: string
    retryCount: number
}

export function AnalyzeForm() {
    const [repoName, setRepoName] = useState("")
    const [stats, setStats] = useState<null | RepoStats>(null)
    const [analysisState, setAnalysisState] = useState<AnalysisState>({
        isLoading: false,
        retryCount: 0
    })

    async function handleAnalysis(formData: FormData) {
        const repo = formData.get("repoName") as string
        if (!repo) return

        try {
            setAnalysisState(prev => ({ ...prev, isLoading: true, error: undefined }))
            const result = await analyzeRepo(formData)
            setStats(result)

            if (result.isProcessing && analysisState.retryCount < 5) {
                setAnalysisState(prev => ({
                    isLoading: true,
                    retryCount: prev.retryCount + 1
                }))
            } else {
                setAnalysisState({
                    isLoading: false,
                    retryCount: 0
                })
            }
        } catch (error) {
            setAnalysisState({
                isLoading: false,
                retryCount: 0,
                error: "Failed to analyze repository"
            })
        }
    }

    // Handle retries
    useEffect(() => {
        if (stats?.isProcessing && analysisState.retryCount < 5) {
            const timer = setTimeout(() => {
                const formData = new FormData()
                formData.set("repoName", repoName)
                handleAnalysis(formData)
            }, 15000)
            return () => clearTimeout(timer)
        }
    }, [stats?.isProcessing, analysisState.retryCount, repoName])

    function getStatusMessage() {
        if (analysisState.error) {
            return { text: analysisState.error, type: "error" as const }
        }
        if (analysisState.isLoading && stats?.isProcessing) {
            return {
                text: `GitHub is processing the data (Attempt ${analysisState.retryCount}/5)...`,
                type: "processing" as const
            }
        }
        if (stats && !stats.isProcessing) {
            return { text: "Analysis complete", type: "success" as const }
        }
        return null
    }

    return (
        <>
            <form action={handleAnalysis} className="mb-8">
                <div className="flex gap-2">
                    <Input
                        name="repoName"
                        type="text"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        placeholder="Enter GitHub repository name (e.g., owner/repo)"
                        className="flex-grow"
                        disabled={analysisState.isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={analysisState.isLoading}
                    >
                        <GitHubLogoIcon className="mr-2 h-4 w-4" />
                        {analysisState.isLoading ? "Processing..." : "Analyze"}
                    </Button>
                </div>
                {getStatusMessage() && (
                    <p className={cn(
                        "mt-2 text-sm",
                        {
                            "text-yellow-500": getStatusMessage()?.type === "processing",
                            "text-green-500": getStatusMessage()?.type === "success",
                            "text-red-500": getStatusMessage()?.type === "error"
                        }
                    )}>
                        {getStatusMessage()?.text}
                    </p>
                )}
            </form>
            {stats && !stats.isProcessing && <StatsDisplay stats={stats} />}
        </>
    )
}
