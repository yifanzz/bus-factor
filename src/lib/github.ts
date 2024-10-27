import { Octokit } from "@octokit/rest"

interface RepoStats {
    busFactor: number
    contributors: number
    commits: number
    issues: number
}

export async function getRepoStats(repoFullName: string, accessToken: string): Promise<RepoStats> {
    const octokit = new Octokit({ auth: accessToken })
    const [owner, repo] = repoFullName.split('/')

    if (!owner || !repo) {
        throw new Error('Invalid repository name. Format should be owner/repo')
    }

    try {
        // Fetch data in parallel
        const [contributors, issues, commits] = await Promise.all([
            octokit.repos.getContributorsStats({ owner, repo }),
            octokit.issues.listForRepo({ owner, repo, state: 'open' }),
            octokit.repos.getCommitActivityStats({ owner, repo })
        ])

        // Calculate total commits from contributors
        const totalCommits = commits.data?.reduce((sum, commitWeek) =>
            sum + (commitWeek.total || 0), 0) || 0

        const contributorCount = contributors.data?.length || 0
        const commitDistribution = contributors.data
            ?.map(c => (c.total || 0) / totalCommits)
            .sort((a, b) => b - a) || []

        // Calculate bus factor using commit distribution
        // Consider contributors until we reach 80% of commits
        let cumulativeShare = 0
        let busFactor = 0
        for (const share of commitDistribution) {
            cumulativeShare += share
            busFactor++
            if (cumulativeShare >= 0.8) break
        }

        return {
            busFactor: busFactor,
            contributors: contributorCount,
            commits: totalCommits,
            issues: issues.data.length
        }
    } catch (error) {
        console.error('Error fetching repository data:', error)
        throw new Error('Failed to analyze repository. Please check the repository name and try again.')
    }
}
