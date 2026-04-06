import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const pool = new Pool({
  host:     process.env.PGHOST     || 'localhost',
  port:     parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'brainz_edit_pulse',
  user:     process.env.PGUSER     || 'brainz',
  password: process.env.PGPASSWORD || '',
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[db] ${duration}ms — ${text.slice(0, 80).replace(/\s+/g, ' ')}`);
  }
  return res;
}
