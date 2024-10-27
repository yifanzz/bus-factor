import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { promises as fs } from 'fs'
import { FileMigrationProvider, Migrator } from 'kysely'
import * as path from 'path'

// Import the Database type from @auth/kysely-adapter
import type { Database as AuthDatabase } from '@auth/kysely-adapter'

// Extend the AuthDatabase type with our custom fields
export interface Database extends AuthDatabase {
    users: AuthDatabase['user'] & {
        githubToken: string | null
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
