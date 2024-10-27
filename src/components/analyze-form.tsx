"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { StatsDisplay } from "@/components/stats-display"
import { analyzeRepo } from "@/app/actions/analyze-repo"
import { useActionState } from "react"

interface FormState {
    message: string
}

export function AnalyzeForm() {
    const [repoName, setRepoName] = useState("")
    const [stats, setStats] = useState<null | {
        busFactor: number
        contributors: number
        commits: number
        issues: number
    }>(null)

    const [state, action] = useActionState<FormState, FormData>(
        async (prevState: FormState | null, formData: FormData) => {
            try {
                const result = await analyzeRepo(formData)
                setStats(result)
                return { message: "Analysis complete" }
            } catch (error) {
                return { message: "Failed to analyze repository" }
            }
        },
        { message: "" }
    )

    return (
        <>
            <form action={action} className="mb-8">
                <div className="flex gap-2">
                    <Input
                        name="repoName"
                        type="text"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        placeholder="Enter GitHub repository name"
                        className="flex-grow"
                    />
                    <Button type="submit">
                        <GitHubLogoIcon className="mr-2 h-4 w-4" /> Analyze
                    </Button>
                </div>
                {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
            </form>
            {stats && <StatsDisplay stats={stats} />}
        </>
    )
}
