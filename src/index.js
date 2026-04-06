import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { buildRouter } from './api/routes.js';
import { scrapeAndSave } from './scraper/scraper.js';
import { pool } from './db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const PORT      = parseInt(process.env.PORT || '3456', 10);
const BASE_PATH = (process.env.BASE_PATH || '/').replace(/\/+$/, '') || '/';
const USERNAME  = process.env.MB_USERNAME || '';
const CRON_EXP  = process.env.SCRAPE_CRON || '*/5 * * * *';
const DIST_DIR  = path.resolve(__dirname, '../frontend/dist');

if (!USERNAME) {
  console.error('[startup] MB_USERNAME is not set in .env — exiting.');
  process.exit(1);
}

// ── Validate cron expression ──────────────────────────────────────────────────

if (!cron.validate(CRON_EXP)) {
  console.error(`[startup] Invalid SCRAPE_CRON expression: "${CRON_EXP}"`);
  process.exit(1);
}

// ── Express ───────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

const apiRouter = buildRouter(USERNAME, CRON_EXP);

if (BASE_PATH === '/') {
  app.use('/api', apiRouter);
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
} else {
  app.use(`${BASE_PATH}/api`, apiRouter);
  app.use(BASE_PATH, express.static(DIST_DIR));
  app.get(`${BASE_PATH}/*`, (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
  // Redirect bare base path
  app.get(BASE_PATH, (req, res) => res.redirect(`${BASE_PATH}/`));
}

// ── DB connectivity check ─────────────────────────────────────────────────────

async function checkDb() {
  try {
    await pool.query('SELECT 1');
    console.log('[startup] PostgreSQL connected.');
  } catch (err) {
    console.error('[startup] Cannot connect to PostgreSQL:', err.message);
    console.error('          Check your .env PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD');
    process.exit(1);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────

await checkDb();

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[server] Listening on http://127.0.0.1:${PORT}${BASE_PATH}`);
  console.log(`[server] Tracking: ${USERNAME}`);
  console.log(`[server] Scrape schedule: ${CRON_EXP}`);
});

// Scrape immediately on startup, then on schedule
console.log('[scraper] Running initial scrape...');
scrapeAndSave(USERNAME).catch(err => console.error('[scraper] Initial scrape failed:', err.message));

cron.schedule(CRON_EXP, () => {
  console.log(`[scraper] Cron triggered (${new Date().toISOString()})`);
  scrapeAndSave(USERNAME).catch(err => console.error('[scraper] Scrape failed:', err.message));
});
