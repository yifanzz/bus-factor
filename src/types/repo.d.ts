export interface ContributorShare {
    name: string
    percentage: number
}

export interface RepoStats {
    busFactor: number
    contributors: number
    commits: number
    issues: number
    isProcessing?: boolean
    contributorShares: ContributorShare[]
    analyzedMonths: number  // Add this field
}
