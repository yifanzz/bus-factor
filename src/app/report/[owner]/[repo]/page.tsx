import { StatsDisplay } from "@/components/stats-display"
import { Suspense } from "react"
import { analyzeRepo } from "@/app/actions/analyze-repo"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { RefreshButton } from "@/components/refresh-button"

interface ReportPageProps {
    params: {
        owner: string
        repo: string
    }
}

export default async function ReportPage({ params }: ReportPageProps) {
    const { owner, repo } = await params

    // Get the stats
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
}
