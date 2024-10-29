"use server"

import { getRepoStats as fetchGithubStats } from "@/lib/github"
import { getRepoStats, saveRepoStats } from "@/lib/repo-stats-dal"
import { getSession } from "@/lib/auth";

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function analyzeRepo(repoName: string, forceRefresh = false) {
    console.log(`Analyzing ${repoName} with forceRefresh=${forceRefresh}`)

    // Only check authentication for force refresh
    if (forceRefresh) {
        const session = await getSession()
        if (!session?.user) {
            throw new Error("Authentication required to refresh data")
        }
    }

    try {
        // Check cache first if not forcing refresh
        if (!forceRefresh) {
            const cached = await getRepoStats(repoName)
            if (cached) {
                const age = Date.now() - cached.calculatedAt.getTime()
                if (age < CACHE_TTL) {
                    return {
                        ...cached.stats,
                        calculatedAt: cached.calculatedAt
                    }
                }
            }
        }

        // For new analysis or expired cache, we need authentication
        const session = await getSession()
        if (!session?.user || !session.githubAccessToken) {
            throw new Error("Authentication required to analyze new repositories")
        }

        // Fetch fresh data
        const stats = await fetchGithubStats(repoName, session.githubAccessToken)
        const calculatedAt = new Date()

        // Save to cache
        await saveRepoStats(repoName, stats)
        console.log(`Saved stats for ${repoName}`)

        return {
            ...stats,
            calculatedAt
        }
    } catch (error) {
        console.error('Error analyzing repository:', error)
        throw new Error("Failed to analyze repository. Please check the repository name and try again.")
    }
}
