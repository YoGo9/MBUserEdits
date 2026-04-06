/**
 * One-shot scraper — useful for testing and for the YunoHost systemd timer later.
 * Run with: npm run scrape
 */

import 'dotenv/config';
import { scrapeAndSave } from './scraper.js';
import { pool } from '../db/pool.js';

const username = process.env.MB_USERNAME;
if (!username) {
  console.error('MB_USERNAME is not set in .env');
  process.exit(1);
}

console.log(`[scrape] Fetching stats for ${username}...`);
scrapeAndSave(username)
  .then(runId => {
    console.log(`[scrape] Done — run #${runId}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`[scrape] Failed: ${err.message}`);
    process.exit(1);
  })
  .finally(() => pool.end());
