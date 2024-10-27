"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { analyzeRepo } from "@/app/actions/analyze-repo"
import { cn } from "@/lib/utils"
import { RepoStats } from "@/types/repo"

interface AnalysisState {
    isLoading: boolean
    error?: string
    retryCount: number
    currentResult?: RepoStats
}

interface AnalyzeFormProps {
    onAnalysisComplete: (stats: RepoStats) => void
    isAnalyzing?: boolean
}

const PRESET_REPOS = [
    { name: "Sage", repo: "storia-ai/sage" },
    { name: "LangChainJS", repo: "langchain-ai/langchainjs" },
    { name: "Dify", repo: "langgenius/dify" },
]

export function AnalyzeForm({ onAnalysisComplete, isAnalyzing }: AnalyzeFormProps) {
    const [repoName, setRepoName] = useState("")
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

            if (result.isProcessing && analysisState.retryCount < 5) {
                setAnalysisState(prev => ({
                    ...prev,
                    isLoading: true,
                    retryCount: prev.retryCount + 1,
                    currentResult: result
                }))
            } else {
                setAnalysisState({
                    isLoading: false,
                    retryCount: 0,
                    currentResult: result
                })
            }

            onAnalysisComplete(result)
        } catch (error) {
            setAnalysisState({
                isLoading: false,
                retryCount: 0,
                error: "Failed to analyze repository"
            })
        }
    }

    function handlePresetSelect(repo: string) {
        setRepoName(repo)
        const formData = new FormData()
        formData.set("repoName", repo)
        handleAnalysis(formData)
    }

    // Handle retries
    useEffect(() => {
        if (analysisState.currentResult?.isProcessing && analysisState.retryCount < 5) {
            const timer = setTimeout(() => {
                const formData = new FormData()
                formData.set("repoName", repoName)
                handleAnalysis(formData)
            }, 15000)
            return () => clearTimeout(timer)
        }
    }, [analysisState.currentResult?.isProcessing, analysisState.retryCount, repoName])

    function getStatusMessage() {
        if (analysisState.error) {
            return { text: analysisState.error, type: "error" as const }
        }
        if (analysisState.isLoading && analysisState.currentResult?.isProcessing) {
            return {
                text: `GitHub is processing the data (Attempt ${analysisState.retryCount}/5)...`,
                type: "processing" as const
            }
        }
        if (analysisState.currentResult && !analysisState.currentResult.isProcessing) {
            return { text: "Analysis complete", type: "success" as const }
        }
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
                {PRESET_REPOS.map(({ name, repo }) => (
                    <Button
                        key={repo}
                        variant="outline"
                        onClick={() => handlePresetSelect(repo)}
                        disabled={analysisState.isLoading || isAnalyzing}
                        className="min-w-32"
                    >
                        <GitHubLogoIcon className="mr-2 h-4 w-4" />
                        {name}
                    </Button>
                ))}
            </div>

            <form action={handleAnalysis} className="mb-8">
                <div className="flex gap-2">
                    <Input
                        name="repoName"
                        type="text"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        placeholder="Enter GitHub repository name (e.g., owner/repo)"
                        className="flex-grow"
                        disabled={analysisState.isLoading || isAnalyzing}
                    />
                    <Button
                        type="submit"
                        disabled={analysisState.isLoading || isAnalyzing}
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
        </div>
    )
}
