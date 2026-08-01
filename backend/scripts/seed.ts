import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/db';
import { logger } from '../src/utils/logger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const seedPath = path.resolve(__dirname, '../../database/seed.sql');
  const raw = await fs.readFile(seedPath, 'utf-8');
  const sql = raw
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const connection = await pool.getConnection();
  for (const statement of statements) {
    await connection.query(statement + ';');
  }
  connection.release();
  logger.info('Database seeded successfully');
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Seeding failed', err);
  process.exit(1);
});
