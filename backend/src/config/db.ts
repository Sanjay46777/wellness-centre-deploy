import { Pool, QueryResult } from 'pg';
import { env } from './env';

export const pool = new Pool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

function toPg(sql: string): string {
  let n = 0;
  return sql.replace(/\?/g, () => `$${++n}`);
}

export async function query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  const result: QueryResult = await pool.query(toPg(sql), params);
  return { rows: result.rows, rowCount: result.rowCount ?? 0 };
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch {
    return false;
  }
}
