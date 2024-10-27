import { Octokit } from "@octokit/rest"

interface RepoStats {
    busFactor: number
    contributors: number
    commits: number
    issues: number
    isProcessing?: boolean
}

export async function getRepoStats(repoFullName: string, accessToken: string): Promise<RepoStats> {
    const octokit = new Octokit({ auth: accessToken })
    const [owner, repo] = repoFullName.split('/')

    if (!owner || !repo) {
        throw new Error('Invalid repository name. Format should be owner/repo')
    }

    try {
        // Fetch data in parallel
        const [contributorsResponse, commitsResponse] = await Promise.all([
            octokit.repos.getContributorsStats({ owner, repo }),
            octokit.repos.getCommitActivityStats({ owner, repo })
        ])

        // Check if GitHub is still processing the stats
        if (contributorsResponse.status === 202 || commitsResponse.status === 202) {
            return {
                busFactor: 0,
                contributors: 0,
                commits: 0,
                issues: 0,
                isProcessing: true
            }
        }

        const [issues, commits] = await Promise.all([
            octokit.paginate(octokit.issues.listForRepo, { owner, repo, state: 'open', per_page: 100 }),
            octokit.paginate(octokit.repos.listCommits, { owner, repo, per_page: 100 })
        ])

        // Calculate total commits from contributors
        const totalCommits = commits.length

        const contributorCount = contributorsResponse.data?.length || 0
        const commitDistribution = contributorsResponse.data
            ?.map(c => (c.total || 0) / totalCommits)
            .sort((a, b) => b - a) || []

        // Calculate bus factor using commit distribution
        // Consider contributors until we reach 80% of commits
        console.log(`totalCommits: ${totalCommits}`)
        let cumulativeShare = 0
        let busFactor = 0
        for (const share of commitDistribution) {
            console.log(`share: ${share}, share * totalCommits: ${share}`)
            cumulativeShare += share
            busFactor++
            if (cumulativeShare >= 0.8) break
        }

        return {
            busFactor: busFactor,
            contributors: contributorCount,
            commits: totalCommits,
            issues: issues.length,
            isProcessing: false
        }
    } catch (error) {
        console.error('Error fetching repository data:', error)
        throw new Error('Failed to analyze repository. Please check the repository name and try again.')
    }
}
