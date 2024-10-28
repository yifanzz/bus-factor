import { StatsDisplay } from "@/components/stats-display"
import { getRepoStats } from "@/lib/github"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { analyzeRepo } from "@/app/actions/analyze-repo"

interface ReportPageProps {
    params: Promise<{
        owner: string
        repo: string
    }>
    searchParams: {
        refresh?: string
    }
}

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
    const { owner, repo } = await params
    const session = await getServerSession(authOptions)

    if (!session?.githubAccessToken) {
        redirect("/")
    }

    const { refresh } = await searchParams
    const forceRefresh = refresh === 'true'

    const stats = await analyzeRepo(`${owner}/${repo}`, forceRefresh)

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto p-4 max-w-2xl">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Report for {owner}/{repo}
                </h1>
                <Suspense fallback={<div>Loading...</div>}>
                    <StatsDisplay stats={stats} />
                </Suspense>
            </div>
        </main>
    )
}
