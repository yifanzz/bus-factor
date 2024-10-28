"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { useRouter } from "next/dist/client/components/navigation"
const PRESET_REPOS = [
    { name: "Sage", repo: "storia-ai/sage" },
    { name: "LangChainJS", repo: "langchain-ai/langchainjs" },
    { name: "Dify", repo: "langgenius/dify" },
]
export function AnalyzeForm() {
    const router = useRouter()
    const [repoName, setRepoName] = useState("")
    const [error, setError] = useState<string>()
    const [isLoading, setIsLoading] = useState(false)

    async function handleAnalysis(formData: FormData) {
        const repo = formData.get("repoName") as string
        if (!repo) return

        // Extract owner and repo name
        const [owner, repoName] = repo.split('/')
        if (!owner || !repoName) {
            setError("Invalid repository format. Use owner/repo")
            return
        }

        setIsLoading(true)
        try {
            router.push(`/report/${owner}/${repoName}`)
        } catch (error) {
            setError("Failed to analyze repository")
        } finally {
            setIsLoading(false)
        }
    }

    function handlePresetSelect(repo: string) {
        const [owner, repoName] = repo.split('/')
        if (owner && repoName) {
            router.push(`/report/${owner}/${repoName}`)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
                {PRESET_REPOS.map(({ name, repo }) => (
                    <Button
                        key={repo}
                        variant="outline"
                        onClick={() => handlePresetSelect(repo)}
                        disabled={isLoading}
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
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading}
                    >
                        <GitHubLogoIcon className="mr-2 h-4 w-4" />
                        {isLoading ? "Processing..." : "Analyze"}
                    </Button>
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </form>
        </div>
    )
}
