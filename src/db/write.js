import { pool } from './pool.js';

/**
 * Persist a full scrape result inside a single transaction.
 * Returns the run id.
 *
 * @param {object} parsed  — output of scraper/parse.js
 * @param {string} username
 * @param {number} durationMs
 */
export async function saveRun(parsed, username, durationMs) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert run record
    const { rows: [run] } = await client.query(
      `INSERT INTO runs (username, duration_ms, success)
       VALUES ($1, $2, TRUE)
       RETURNING id, scraped_at`,
      [username, durationMs]
    );
    const runId = run.id;

    // 2. User info
    const { memberSince, location, bio } = parsed.userInfo || {};
    await client.query(
      `INSERT INTO user_info (run_id, member_since, location, bio)
       VALUES ($1, $2, $3, $4)`,
      [runId, memberSince || null, location || null, bio || null]
    );

    // 3. Edit stats
    for (const [key, value] of Object.entries(parsed.edits || {})) {
      await client.query(
        `INSERT INTO edit_stats (run_id, key, value) VALUES ($1, $2, $3)`,
        [runId, key, value]
      );
    }

    // 4. Entity stats
    for (const [entityType, value] of Object.entries(parsed.entities || {})) {
      await client.query(
        `INSERT INTO entity_stats (run_id, entity_type, value) VALUES ($1, $2, $3)`,
        [runId, entityType, value]
      );
    }

    // 5. Vote stats
    for (const [period, votes] of Object.entries(parsed.votes || {})) {
      for (const [voteType, value] of Object.entries(votes || {})) {
        await client.query(
          `INSERT INTO vote_stats (run_id, period, vote_type, value) VALUES ($1, $2, $3, $4)`,
          [runId, period, voteType, value]
        );
      }
    }

    // 6. Tag stats
    for (const [key, value] of Object.entries(parsed.tags || {})) {
      await client.query(
        `INSERT INTO tag_stats (run_id, key, value) VALUES ($1, $2, $3)`,
        [runId, key, value]
      );
    }

    await client.query('COMMIT');
    console.log(`[db] Run #${runId} saved for ${username} (${durationMs}ms)`);
    return runId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Record a failed scrape run (for observability).
 */
export async function saveFailedRun(username, durationMs, errorMsg) {
  await pool.query(
    `INSERT INTO runs (username, duration_ms, success, error_msg)
     VALUES ($1, $2, FALSE, $3)`,
    [username, durationMs, errorMsg]
  );
}
