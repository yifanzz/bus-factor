"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getRepoStats } from "@/lib/github"

export async function analyzeRepo(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const repoName = formData.get("repoName") as string
    if (!session.githubAccessToken) {
        throw new Error("GitHub token not found")
    }

    try {
        // You can adjust these values based on your needs
        const config = {
            minRecentCommits: 5,
            minCommitPercentage: 2,
            recentMonths: 3
        }

        return await getRepoStats(repoName, session.githubAccessToken, config)
    } catch (error) {
        console.error('Error analyzing repository:', error)
        throw new Error("Failed to analyze repository. Please check the repository name and try again.")
    }
}
