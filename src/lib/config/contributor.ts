// Configuration for determining active contributors
export const CONTRIBUTOR_CONFIG = {
    // Minimum number of commits in recent period to be considered active
    minRecentCommits: 10,
    // Minimum percentage of total commits (0-100) to be considered significant
    minCommitPercentage: 2,
    // Number of months to consider for recent activity
    recentMonths: 3
} as const

// Helper function to determine if a contributor is active
export function isActiveContributor(commits: number, totalCommits: number): boolean {
    return commits >= CONTRIBUTOR_CONFIG.minRecentCommits &&
        (commits / totalCommits) * 100 >= CONTRIBUTOR_CONFIG.minCommitPercentage
}

// Helper function to get analysis timeframe
export function getAnalysisTimeframe(): Date {
    const since = new Date()
    since.setMonth(since.getMonth() - CONTRIBUTOR_CONFIG.recentMonths)
    return since
} 