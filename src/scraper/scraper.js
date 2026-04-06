import fetch from 'node-fetch';
import { parseUserPage } from './parse.js';
import { saveRun, saveFailedRun } from '../db/write.js';

const USER_AGENT = 'BrainzEditPulse/1.0 (self-hosted; https://github.com/YoGo9/brainz-edit-pulse)';

/**
 * Scrape MusicBrainz for a given username, parse, and persist.
 * Returns the run id on success, throws on hard failure.
 */
export async function scrapeAndSave(username) {
  const start = Date.now();
  const url = `https://musicbrainz.org/user/${encodeURIComponent(username)}`;

  let html;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
    });

    if (res.status === 404) throw new Error(`User "${username}" not found on MusicBrainz`);
    if (!res.ok)            throw new Error(`MusicBrainz returned HTTP ${res.status}`);

    html = await res.text();
  } catch (err) {
    const duration = Date.now() - start;
    await saveFailedRun(username, duration, err.message).catch(() => {});
    throw err;
  }

  const parsed = parseUserPage(html);
  const duration = Date.now() - start;
  const runId = await saveRun(parsed, username, duration);
  return runId;
}
