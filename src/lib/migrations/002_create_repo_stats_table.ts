import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<never>): Promise<void> {
    await db.schema
        .createTable('repo_stats')
        .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn('repo_name', 'text', (col) => col.notNull().unique()) // Added unique constraint
        .addColumn('stats', 'jsonb', (col) => col.notNull())
        .addColumn('calculated_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
        )
        .execute()

    // Add index for faster lookups
    await db.schema
        .createIndex('repo_stats_repo_name_index')
        .on('repo_stats')
        .column('repo_name')
        .execute()
}

export async function down(db: Kysely<never>): Promise<void> {
    await db.schema.dropTable('repo_stats').ifExists().execute()
}
