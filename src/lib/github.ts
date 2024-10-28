import { Octokit } from "@octokit/rest"
import { toISOStringWithoutMs } from "@/lib/utils"
import { ContributorShare, IssueTimeSeries, RepoStats } from "@/types/repo"
import { calculateContributorStats, calculateIssueHistory } from "@/lib/github-stats"

interface ContributorConfig {
    minRecentCommits: number      // Minimum number of commits in recent period
    minCommitPercentage: number   // Minimum percentage of total commits (0-100)
    recentMonths: number          // Number of months to consider for recent activity
}

const DEFAULT_CONTRIBUTOR_CONFIG: ContributorConfig = {
    minRecentCommits: 10,
    minCommitPercentage: 2,
    recentMonths: 3
}

export async function getRepoStats(
    repoName: string,
    token: string,
    config: Partial<ContributorConfig> = {}
): Promise<RepoStats> {
    const octokit = new Octokit({ auth: token })
    const [owner, repo] = repoName.split('/')

    // Merge default config with provided options
    const contributorConfig = { ...DEFAULT_CONTRIBUTOR_CONFIG, ...config }

    if (!owner || !repo) {
        throw new Error('Invalid repository name. Format should be owner/repo')
    }

    try {
        const since = new Date()
        since.setTime(since.getTime() - contributorConfig.recentMonths * 30 * 24 * 60 * 60 * 1000)
        const sinceISO = toISOStringWithoutMs(since)

        const [openIssues, closedIssues, commits] = await Promise.all([
            octokit.paginate(octokit.issues.listForRepo, {
                owner,
                repo,
                state: 'open',
                since: sinceISO,
                per_page: 100
            }),
            octokit.paginate(octokit.issues.listForRepo, {
                owner,
                repo,
                state: 'closed',
                since: sinceISO,
                per_page: 100
            }),
            octokit.paginate(octokit.repos.listCommits, {
                owner,
                repo,
                since: sinceISO,
                per_page: 100
            })
        ])

        const [contributorStats, issueHistory] = await Promise.all([
            calculateContributorStats(commits, contributorConfig),
            calculateIssueHistory([...openIssues, ...closedIssues])
        ])

        return {
            ...contributorStats,
            commits: commits.length,
            openIssues: openIssues.length,
            closedIssues: closedIssues.length,
            isProcessing: false,
            analyzedMonths: contributorConfig.recentMonths,
            issueHistory
        }
    } catch (error) {
        console.error('Error fetching repository data:', error)
        throw new Error('Failed to analyze repository. Please check the repository name and try again.')
    }
}
