import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/db';
import { logger } from '../src/utils/logger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT COUNT(*)::int AS count FROM users');
    if (existing.rows[0].count > 0) {
      logger.info('Database already seeded, skipping');
      process.exit(0);
    }

    const seedPath = path.resolve(__dirname, '../../database/seed.sql');
    const sql = await fs.readFile(seedPath, 'utf-8');
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('NOTE'));

    for (const statement of statements) {
      await client.query(statement);
    }
  } finally {
    client.release();
  }
  logger.info('Database seeded successfully');
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Seeding failed', err);
  process.exit(1);
});
