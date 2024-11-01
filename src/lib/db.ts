import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

// Import the Database type from @auth/kysely-adapter
import type { Database as AuthDatabase } from '@auth/kysely-adapter'

// Extend the AuthDatabase type with our custom fields
export interface Database extends AuthDatabase {
    users: AuthDatabase['User'] & {
        githubToken: string | null
    }
    repo_stats: {
        id: string
        repo_name: string
        stats: unknown
        calculated_at: Date
    }
}

const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: process.env.DATABASE_URL,
    })
})

export const db = new Kysely<Database>({
    dialect,
})

// ... rest of the file remains the same
