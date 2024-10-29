import { StatsDisplay } from "@/components/stats-display"
import { Suspense } from "react"
import { analyzeRepo } from "@/app/actions/analyze-repo"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { RefreshButton } from "@/components/refresh-button"
import { PageProps } from ".next/types/app/layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "next-auth/react"

export default async function ReportPage({ params }: PageProps) {
    const { owner, repo } = await params

    try {
        // Try to get stats (will use cache if available)
        const stats = await analyzeRepo(`${owner}/${repo}`)

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
                                await analyzeRepo(`${owner}/${repo}`, true)
                            }} />
                        </div>
                    </div>
                    <Suspense fallback={<div>Loading...</div>}>
                        <StatsDisplay stats={stats} />
                    </Suspense>
                </div>
            </main>
        )
    } catch (error) {
        // If no cached data and user is not authenticated
        if (error instanceof Error && error.message.includes("Authentication required")) {
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

        // For other errors, throw to error boundary
        throw error
    }
}
