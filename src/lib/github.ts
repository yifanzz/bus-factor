import { Octokit } from "@octokit/rest"

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
                isProcessing: true,
                contributorShares: [] // Add this to fix the linter error
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

        const contributorShares: ContributorShare[] = []
        let othersPercentage = 0

        // Calculate contributor shares
        contributorsResponse.data?.forEach((contributor) => {
            const percentage = (contributor.total || 0) / totalCommits
            if (percentage >= 0.1) { // 10% threshold
                contributorShares.push({
                    name: contributor.author?.login || 'Unknown',
                    percentage: Number((percentage * 100).toFixed(1))
                })
            } else {
                othersPercentage += percentage
            }
        })

        // Add "Others" category if there are small contributors
        if (othersPercentage > 0) {
            contributorShares.push({
                name: 'Others',
                percentage: Number((othersPercentage * 100).toFixed(1))
            })
        }

        // Sort by percentage descending
        contributorShares.sort((a, b) => b.percentage - a.percentage)
        console.log(`contributorShares: ${JSON.stringify(contributorShares)}`)

        console.log('Raw contributor data:', contributorsResponse.data);
        console.log('Processed contributor shares:', contributorShares);

        return {
            busFactor: busFactor,
            contributors: contributorCount,
            commits: totalCommits,
            issues: issues.length,
            isProcessing: false,
            contributorShares
        }
    } catch (error) {
        console.error('Error fetching repository data:', error)
        throw new Error('Failed to analyze repository. Please check the repository name and try again.')
    }
}
