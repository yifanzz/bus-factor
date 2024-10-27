"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function analyzeRepo(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const repoName = formData.get("repoName") as string
    if (!session.githubAccessToken) {
        throw new Error("GitHub token not found")
    }

    // TODO: Implement actual GitHub API calls using session.githubAccessToken to analyze the repository

    // For now, return mock data
    return {
        busFactor: 7,
        contributors: 42,
        commits: 1337,
        issues: 99,
    }
}
