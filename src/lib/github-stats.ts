import { Octokit } from "@octokit/rest"
import { ContributorShare, IssueTimeSeries } from "@/types/repo"
import { toISOStringWithoutMs } from "@/lib/utils"

interface ContributorConfig {
    minRecentCommits: number
    minCommitPercentage: number
    recentMonths: number
}

const DEFAULT_CONTRIBUTOR_CONFIG: ContributorConfig = {
    minRecentCommits: 10,
    minCommitPercentage: 2,
    recentMonths: 3
}

export async function calculateContributorStats(
    commits: any[],
    config: ContributorConfig
): Promise<{
    busFactor: number
    contributors: number
    totalCommits: number
    contributorShares: ContributorShare[]
}> {
    const recentDateThreshold = new Date()
    recentDateThreshold.setMonth(recentDateThreshold.getMonth() - config.recentMonths)

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

    // When creating contributorShares, include the commit count
    const contributorShares: ContributorShare[] = Array.from(authorCommits.entries())
        .filter(([_, count]) => count >= config.minRecentCommits && (count / totalRecentCommits) * 100 >= config.minCommitPercentage)
        .map(([author, count]) => ({
            name: author,
            commits: count,
            percentage: Number(((count / totalRecentCommits) * 100).toFixed(1))
        }))

    // Calculate others' commits and percentage
    const othersCommits = totalRecentCommits - contributorShares.reduce((sum, share) => sum + share.commits, 0)
    const othersPercentage = Number(((othersCommits / totalRecentCommits) * 100).toFixed(1))

    // Add "Others" category if there are small contributors
    if (othersPercentage > 0) {
        contributorShares.push({
            name: 'Others',
            commits: othersCommits,
            percentage: othersPercentage
        })
    }

    // Sort by percentage descending
    contributorShares.sort((a, b) => b.percentage - a.percentage)

    return {
        busFactor: contributorShares.length - (contributorShares.find(s => s.name === 'Others') ? 1 : 0),
        contributors: authorCommits.size,
        totalCommits: totalRecentCommits,
        contributorShares
    }
}

export async function calculateIssueHistory(
    issues: any[]
): Promise<IssueTimeSeries> {
    // Group issues by week
    const openIssuesByWeek = new Map<string, number>()
    const closedIssuesByWeek = new Map<string, number>()

    issues.forEach(issue => {
        const createdDate = new Date(issue.created_at)
        const weekKey = getWeekKey(createdDate)

        if (issue.state === 'open') {
            openIssuesByWeek.set(weekKey, (openIssuesByWeek.get(weekKey) || 0) + 1)
        } else {
            closedIssuesByWeek.set(weekKey, (closedIssuesByWeek.get(weekKey) || 0) + 1)
        }
    })

    // Convert to sorted arrays
    const openIssues = Array.from(openIssuesByWeek.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date))

    const closedIssues = Array.from(closedIssuesByWeek.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date))

    return {
        openIssues,
        closedIssues
    }
}

function getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = getWeekNumber(date)
    return `${year}-W${week.toString().padStart(2, '0')}`
}

function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
