export interface ContributorShare {
    name: string
    percentage: number
    commits: number
}

export interface TimeSeriesPoint {
    date: string
    value: number
}

export interface IssueTimeSeries {
    openIssues: TimeSeriesPoint[]
    closedIssues: TimeSeriesPoint[]
}

export interface RepoStats {
    busFactor: number
    contributors: number
    commits: number
    openIssues: number
    closedIssues: number
    isProcessing?: boolean
    contributorShares: ContributorShare[]
    analyzedMonths: number
    issueHistory: IssueTimeSeries
}
