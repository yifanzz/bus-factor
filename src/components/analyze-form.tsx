"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/dist/client/components/navigation"

export function AnalyzeForm() {
    const router = useRouter()
    const [repoName, setRepoName] = useState("")
    const [error, setError] = useState<string>()
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!repoName) return

        // Extract owner and repo name
        const [owner, repo] = repoName.split('/')
        if (!owner || !repo) {
            setError("Invalid repository format. Use owner/repo")
            return
        }

        setIsLoading(true)
        try {
            router.push(`/report/${owner}/${repo}`)
        } catch (error) {
            setError("Failed to analyze repository")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
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
                </div>
            </form>
        </div>
    )
}
