"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getRepoStats as fetchGithubStats } from "@/lib/github"
import { getRepoStats, saveRepoStats } from "@/lib/repo-stats-dal"

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function analyzeRepo(repoName: string, forceRefresh = true) {
    console.log(`Analyzing ${repoName} with forceRefresh=${forceRefresh}`)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    if (!session.githubAccessToken) {
        throw new Error("GitHub token not found")
    }

    try {
        // Check cache first if not forcing refresh
        if (!forceRefresh) {
            const cached = await getRepoStats(repoName)
            if (cached) {
                const age = Date.now() - cached.calculatedAt.getTime()
                if (age < CACHE_TTL) {
                    return cached.stats
                }
            }
        }

        // Fetch fresh data
        const stats = await fetchGithubStats(repoName, session.githubAccessToken)

        // Save to cache
        await saveRepoStats(repoName, stats)
        console.log(`Saved stats for ${repoName}`)

        return stats
    } catch (error) {
        console.error('Error analyzing repository:', error)
        throw new Error("Failed to analyze repository. Please check the repository name and try again.")
    }
}
