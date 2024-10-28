import { StatsDisplay } from "@/components/stats-display"
import { getRepoStats } from "@/lib/github"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Suspense } from "react"

interface ReportPageProps {
    params: Promise<{
        owner: string
        repo: string
    }>
}

export default async function ReportPage({ params }: ReportPageProps) {
    const { owner, repo } = await params
    const session = await getServerSession(authOptions)

    if (!session?.githubAccessToken) {
        redirect("/")
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto p-4 max-w-2xl">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Report for {owner}/{repo}
                </h1>
                <Suspense fallback={<div>Loading...</div>}>
                    <ReportContent owner={owner} repo={repo} token={session.githubAccessToken} />
                </Suspense>
            </div>
        </main>
    )
}

async function ReportContent({
    owner,
    repo,
    token
}: {
    owner: string
    repo: string
    token: string
}) {
    const stats = await getRepoStats(`${owner}/${repo}`, token)
    return <StatsDisplay stats={stats} />
}
