"use server"

import { getRepoStats as fetchGithubStats } from "@/lib/github"
import { getRepoStats, saveRepoStats } from "@/lib/repo-stats-dal"
import { getSession } from "@/lib/auth"
import { checkRepoExists } from "@/lib/github"
import { isValidRepoFormat } from "@/lib/utils"
import { ValidationError, isKnownError, ActionResult } from "@/lib/errors"
import { RepoStats } from "@/types/repo"

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function analyzeRepo(repoName: string, forceRefresh = false): Promise<ActionResult<RepoStats & { calculatedAt: Date }>> {
    console.log(`Analyzing ${repoName} with forceRefresh=${forceRefresh}`)

    // Validate repo format
    if (!isValidRepoFormat(repoName)) {
        throw new ValidationError("Invalid repository format. Use owner/repo format (e.g., vercel/next.js)")
    }

    try {
        // Only check authentication for force refresh
        if (forceRefresh) {
            const session = await getSession()
            if (!session?.user) {
                return {
                    error: {
                        code: 'UNAUTHORIZED',
                        message: "Authentication required to refresh data"
                    }
                }
            }
        }

        // Check cache first if not forcing refresh
        if (!forceRefresh) {
            const cached = await getRepoStats(repoName)
            if (cached) {
                const age = Date.now() - cached.calculatedAt.getTime()
                if (age < CACHE_TTL) {
                    return {
                        data: {
                            ...cached.stats,
                            calculatedAt: cached.calculatedAt
                        }
                    }
                }
            }
        }

        // For new analysis or expired cache, we need authentication
        const session = await getSession()
        if (!session?.user || !session.githubAccessToken) {
            return {
                error: {
                    code: 'UNAUTHORIZED',
                    message: "Authentication required to analyze new repositories"
                }
            }
        }

        // Check if repo exists before proceeding
        const exists = await checkRepoExists(repoName, session.githubAccessToken)
        if (!exists) {
            return {
                error: {
                    code: 'NOT_FOUND',
                    message: "Repository not found. Please check the repository name and try again."
                }
            }
        }

        // Fetch fresh data
        const stats = await fetchGithubStats(repoName, session.githubAccessToken)
        const calculatedAt = new Date()

        // Save to cache
        await saveRepoStats(repoName, stats)
        console.log(`Saved stats for ${repoName}`)

        return {
            data: {
                ...stats,
                calculatedAt
            }
        }
    } catch (error) {
        console.error('Error analyzing repository:', error)

        // Re-throw validation errors
        if (isKnownError(error)) {
            throw error
        }

        // For unexpected errors, throw a generic error
        throw new Error("An unexpected error occurred while analyzing the repository")
    }
}
