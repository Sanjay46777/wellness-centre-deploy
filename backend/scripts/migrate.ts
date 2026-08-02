import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/db';
import { logger } from '../src/utils/logger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const raw = await fs.readFile(schemaPath, 'utf-8');
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
  logger.info('Database migrated successfully');
  process.exit(0);
}

migrate().catch((err) => {
  logger.error('Migration failed', err);
  process.exit(1);
});
