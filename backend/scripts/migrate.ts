import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../src/config/env';
import { logger } from '../src/utils/logger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf-8');

  // Connect without a database so we can create it if it does not exist yet
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.query(`USE \`${env.DB_NAME}\``);

  // Strip CREATE DATABASE / USE statements, then run the table definitions
  const statements = schema
    .replace(/CREATE DATABASE IF NOT EXISTS[\s\S]*?;/g, '')
    .replace(/USE\s+[\w.`]+;/g, '')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await connection.query(statement + ';');
  }

  await connection.end();
  logger.info('Database migrated successfully');
  process.exit(0);
}

migrate().catch((err) => {
  logger.error('Migration failed', err);
  process.exit(1);
});
