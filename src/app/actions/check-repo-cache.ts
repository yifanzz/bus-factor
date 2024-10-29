"use server"

import { getRepoStats } from "@/lib/repo-stats-dal"

export async function checkRepoCache(repoName: string): Promise<boolean> {
    const cached = await getRepoStats(repoName)
    return cached !== null
} 