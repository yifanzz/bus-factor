import { Octokit } from "@octokit/rest"

interface ContributorConfig {
    minRecentCommits: number      // Minimum number of commits in recent period
    minCommitPercentage: number   // Minimum percentage of total commits (0-100)
    recentMonths: number          // Number of months to consider for recent activity
}

const DEFAULT_CONTRIBUTOR_CONFIG: ContributorConfig = {
    minRecentCommits: 5,
    minCommitPercentage: 2,
    recentMonths: 3
}

interface ContributorShare {
    name: string
    percentage: number
}

interface RepoStats {
    busFactor: number
    contributors: number
    commits: number
    issues: number
    isProcessing?: boolean
    contributorShares: ContributorShare[] // Add this field
    analyzedMonths: number
}

export async function getRepoStats(
    repoName: string,
    token: string,
    config: ContributorConfig = DEFAULT_CONTRIBUTOR_CONFIG
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
        const [issues, commits] = await Promise.all([
            octokit.paginate(octokit.issues.listForRepo, { owner, repo, state: 'open', since: since.toISOString().split('.')[0] + 'Z', per_page: 100 }),
            octokit.paginate(octokit.repos.listCommits, { owner, repo, since: since.toISOString().split('.')[0] + 'Z', per_page: 100 })
        ])

        // Calculate the date threshold for recent commits
        const recentDateThreshold = new Date()
        recentDateThreshold.setMonth(recentDateThreshold.getMonth() - contributorConfig.recentMonths)

        // Filter commits to only include those within the recent period
        const recentCommits = commits.filter(commit => {
            const commitDate = new Date(commit.commit.author?.date || '')
            return commitDate >= recentDateThreshold
        })

        const totalRecentCommits = recentCommits.length

        // Group commits by author
        const authorCommits = new Map<string, number>()
        for (const commit of recentCommits) {
            const authorName = commit.author?.login || commit.commit.author?.name || 'Unknown'
            authorCommits.set(authorName, (authorCommits.get(authorName) || 0) + 1)
        }

        // Calculate contributor shares based on configured thresholds
        const contributorShares: ContributorShare[] = []
        let othersPercentage = 0

        for (const [name, commitCount] of authorCommits.entries()) {
            const percentage = (commitCount / totalRecentCommits) * 100

            if (commitCount >= contributorConfig.minRecentCommits &&
                percentage >= contributorConfig.minCommitPercentage) {
                contributorShares.push({
                    name,
                    percentage: Number(percentage.toFixed(1))
                })
            } else {
                othersPercentage += percentage
            }
        }

        // Add "Others" category if there are small contributors
        if (othersPercentage > 0) {
            contributorShares.push({
                name: 'Others',
                percentage: Number(othersPercentage.toFixed(1))
            })
        }

        // Sort by percentage descending
        contributorShares.sort((a, b) => b.percentage - a.percentage)

        // Calculate bus factor based on significant contributors
        const busFactor = contributorShares.length - (contributorShares.find(s => s.name === 'Others') ? 1 : 0)

        // Calculate total number of unique contributors from the authorCommits Map
        const totalContributors = authorCommits.size

        return {
            busFactor,
            contributors: totalContributors,
            commits: totalRecentCommits,
            issues: issues.length,
            isProcessing: false,
            contributorShares,
            analyzedMonths: contributorConfig.recentMonths
        }
    } catch (error) {
        console.error('Error fetching repository data:', error)
        throw new Error('Failed to analyze repository. Please check the repository name and try again.')
    }
}
