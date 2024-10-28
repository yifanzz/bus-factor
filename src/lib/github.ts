import { Octokit } from "@octokit/rest"
import { toISOStringWithoutMs } from "@/lib/utils"
import { ContributorShare, IssueTimeSeries, RepoStats } from "@/types/repo"
import { calculateContributorStats, calculateIssueHistory } from "@/lib/github-stats"
import { CONTRIBUTOR_CONFIG, getAnalysisTimeframe } from "@/lib/config/contributor"

export async function getRepoStats(
    repoName: string,
    token: string,
    config = CONTRIBUTOR_CONFIG
): Promise<RepoStats> {
    const octokit = new Octokit({ auth: token })
    const [owner, repo] = repoName.split('/')

    if (!owner || !repo) {
        throw new Error('Invalid repository name. Format should be owner/repo')
    }

    try {
        const since = getAnalysisTimeframe()
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
            calculateContributorStats(commits, config),
            calculateIssueHistory([...openIssues, ...closedIssues])
        ])

        // Get repository info including stars
        const { data: repoData } = await octokit.repos.get({
            owner,
            repo,
        })

        return {
            ...contributorStats,
            commits: commits.length,
            openIssues: openIssues.length,
            closedIssues: closedIssues.length,
            isProcessing: false,
            analyzedMonths: config.recentMonths,
            stars: repoData.stargazers_count,
            issueHistory
        }
    } catch (error) {
        console.error('Error fetching repository data:', error)
        throw new Error('Failed to analyze repository. Please check the repository name and try again.')
    }
}
