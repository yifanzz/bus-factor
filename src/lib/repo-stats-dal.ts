import { db } from './db'
import type { RepoStats } from '@/types/repo'
import { sql } from 'kysely'

export async function getRepoStats(repoName: string): Promise<{
    stats: RepoStats
    calculatedAt: Date
} | null> {
    const result = await db
        .selectFrom('repo_stats')
        .select(['stats as stats', 'calculated_at as calculatedAt'])
        .where('repo_name', '=', repoName)
        .executeTakeFirst()

    if (!result) return null

    return {
        stats: result.stats as RepoStats,
        calculatedAt: result.calculatedAt
    }
}

export async function saveRepoStats(repoName: string, stats: RepoStats): Promise<void> {
    await db
        .insertInto('repo_stats')
        .values({
            id: sql`gen_random_uuid()`,
            repo_name: repoName,
            stats: stats as any,
            calculated_at: new Date()
        })
        .onConflict((oc) =>
            oc.column('repo_name')
                .doUpdateSet({
                    stats: stats as any,
                    calculated_at: new Date()
                })
        )
        .execute()
}

export async function getRecentRepoStats(limit = 10): Promise<{
    repoName: string
    stats: RepoStats
    calculatedAt: Date
}[]> {
    const results = await db
        .selectFrom('repo_stats')
        .select(['repo_name as repoName', 'stats as stats', 'calculated_at as calculatedAt'])
        .orderBy('calculated_at', 'desc')
        .limit(limit)
        .execute()

    return results.map(result => ({
        repoName: result.repoName,
        stats: result.stats as RepoStats,
        calculatedAt: result.calculatedAt
    }))
}
