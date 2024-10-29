"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { checkRepoCache } from "@/app/actions/check-repo-cache"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { isValidRepoFormat } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { ValidationError } from "@/lib/errors"

export function AnalyzeForm() {
    const { data: session } = useSession()
    const router = useRouter()
    const [repoName, setRepoName] = useState("")
    const [error, setError] = useState<string>()
    const [isLoading, setIsLoading] = useState(false)
    const [showAuthDialog, setShowAuthDialog] = useState(false)
    const [pendingRepo, setPendingRepo] = useState<{ owner: string, repo: string } | null>(null)
    const [isValidFormat, setIsValidFormat] = useState(true)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setRepoName(value)
        setIsValidFormat(value === "" || isValidRepoFormat(value))
        setError(undefined)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!repoName) return

        setIsLoading(true)
        setError(undefined)

        try {
            // Extract owner and repo name
            const [owner, repo] = repoName.split('/')

            // Check if repo exists in cache
            const hasCache = await checkRepoCache(`${owner}/${repo}`)

            // If repo is cached, redirect directly
            if (hasCache) {
                router.push(`/report/${owner}/${repo}`)
                return
            }

            // If not cached and user not logged in, show auth dialog
            if (!session) {
                setPendingRepo({ owner, repo })
                setShowAuthDialog(true)
                return
            }

            // If user is logged in, proceed to analysis
            router.push(`/report/${owner}/${repo}`)
        } catch (error) {
            if (error instanceof ValidationError) {
                setError(error.message)
            } else {
                setError("An unexpected error occurred. Please try again later.")
                console.error(error)
            }
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
                            onChange={handleInputChange}
                            placeholder="Enter GitHub repository name (e.g., owner/repo)"
                            className={cn("flex-grow", !isValidFormat && "border-destructive")}
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !isValidFormat || !repoName}
                        >
                            Analyze
                        </Button>
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    {!isValidFormat && repoName && (
                        <p className="text-sm text-destructive">
                            Please use the format owner/repo (e.g., vercel/next.js)
                        </p>
                    )}
                </div>
            </form>

            <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Authentication Required</DialogTitle>
                        <DialogDescription>
                            This repository hasn&apos;t been analyzed yet. Please sign in with GitHub to analyze it.

                            It won&apos;t request any permissions beyond public information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={() => {
                            if (pendingRepo) {
                                signIn("github", {
                                    callbackUrl: `/report/${pendingRepo.owner}/${pendingRepo.repo}`
                                })
                            }
                        }}>
                            <GitHubLogoIcon className="mr-2 h-4 w-4" />
                            Sign in with GitHub
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
