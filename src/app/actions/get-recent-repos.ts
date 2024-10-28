"use server"

import { getRecentRepoStats } from "@/lib/repo-stats-dal"

export async function getRecentRepos() {
    return getRecentRepoStats(10)
}
