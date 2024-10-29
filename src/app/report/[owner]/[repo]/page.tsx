import { StatsDisplay } from "@/components/stats-display"
import { Suspense } from "react"
import { analyzeRepo } from "@/app/actions/analyze-repo"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { RefreshButton } from "@/components/refresh-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { signIn } from "next-auth/react"

interface PageProps {
    params: {
        owner: string
        repo: string
    }
}

export default async function ReportPage({ params }: PageProps) {
    const { owner, repo } = params
    const repoName = `${owner}/${repo}`

    const result = await analyzeRepo(repoName)

    if (result.error) {
        if (result.error.code === 'UNAUTHORIZED') {
            return (
                <div className="container mx-auto p-4 max-w-2xl">
                    <Alert className="mb-6">
                        <InfoCircledIcon className="h-4 w-4" />
                        <AlertDescription>
                            This repository hasn&apos;t been analyzed yet. Please sign in to analyze it.
                        </AlertDescription>
                    </Alert>
                    <div className="flex justify-center">
                        <Button onClick={() => signIn("github", {
                            callbackUrl: `/report/${owner}/${repo}`
                        })}>
                            Sign In with GitHub
                        </Button>
                    </div>
                </div>
            )
        }

        if (result.error.code === 'NOT_FOUND') {
            return (
                <div className="container mx-auto p-4 max-w-2xl">
                    <Alert variant="destructive">
                        <AlertTitle>Repository Not Found</AlertTitle>
                        <AlertDescription>{result.error.message}</AlertDescription>
                    </Alert>
                </div>
            )
        }
    }

    if (!result.data) {
        throw new Error("Failed to load repository data")
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto p-4 max-w-2xl">
                <div className="space-y-4 mb-6">
                    <h1 className="text-3xl font-bold text-center">
                        {owner}/{repo}
                    </h1>
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            asChild
                        >
                            <Link href={`https://github.com/${owner}/${repo}`} target="_blank">
                                <GitHubLogoIcon className="h-4 w-4 mr-2" />
                                View on GitHub
                            </Link>
                        </Button>
                        <RefreshButton handleRefresh={async () => {
                            "use server"
                            await analyzeRepo(repoName, true)
                        }} />
                    </div>
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    <StatsDisplay stats={result.data} />
                </Suspense>
            </div>
        </main>
    )
}
