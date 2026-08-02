import fs from 'fs/promises';
import path from 'path';
import { pool } from './db';
import { logger } from '../utils/logger';

async function runSqlFile(relPath: string): Promise<void> {
  const filePath = path.resolve(process.cwd(), relPath);
  const raw = await fs.readFile(filePath, 'utf-8');
  const sql = raw
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const client = await pool.connect();
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
  } finally {
    client.release();
  }
}

export async function setupDatabase(): Promise<void> {
  await runSqlFile('database/schema.sql');

  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (existing.rows[0].count > 0) {
    logger.info('Database already seeded, skipping');
    return;
  }

  await runSqlFile('database/seed.sql');
  logger.info('Database setup complete');
}
