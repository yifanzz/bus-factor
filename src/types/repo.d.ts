export interface ContributorShare {
    name: string
    percentage: number
}

export interface RepoStats {
    busFactor: number
    contributors: number
    commits: number
    openIssues: number    // Rename from issues
    closedIssues: number  // Add this field
    isProcessing?: boolean
    contributorShares: ContributorShare[]
    analyzedMonths: number
}
