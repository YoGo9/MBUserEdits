import { Router } from 'express';
import { getLatestSnapshot, getSnapshots, getRunHistory } from '../db/read.js';
import { scrapeAndSave } from '../scraper/scraper.js';

export function buildRouter(username, scrapeIntervalCron) {
  const router = Router();

  // GET /api/config
  router.get('/config', (req, res) => {
    res.json({ username, scrapeIntervalCron });
  });

  // GET /api/latest
  router.get('/latest', async (req, res) => {
    try {
      const snapshot = await getLatestSnapshot(username);
      if (!snapshot) return res.status(404).json({ error: 'No data yet' });
      res.json(snapshot);
    } catch (err) {
      console.error('[api] /latest:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/snapshots?since=<ISO>&limit=<n>
  // `since` defaults to 30 days ago; pass since=all for full history
  router.get('/snapshots', async (req, res) => {
    try {
      const limit  = Math.min(parseInt(req.query.limit || '2000', 10), 10000);
      const sinceParam = req.query.since;
      const since = sinceParam === 'all'
        ? undefined
        : sinceParam || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const snapshots = await getSnapshots(username, { since, limit });
      res.json(snapshots);
    } catch (err) {
      console.error('[api] /snapshots:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/runs — scrape run history (for debugging)
  router.get('/runs', async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit || '100', 10), 1000);
      const runs = await getRunHistory(username, limit);
      res.json(runs);
    } catch (err) {
      console.error('[api] /runs:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/fetch — trigger a manual scrape
  router.post('/fetch', async (req, res) => {
    try {
      const runId = await scrapeAndSave(username);
      res.json({ success: true, runId });
    } catch (err) {
      console.error('[api] /fetch:', err.message);
      res.status(502).json({ error: err.message });
    }
  });

  return router;
}
