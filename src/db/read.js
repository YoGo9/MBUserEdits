import { pool } from './pool.js';

/**
 * Latest snapshot — most recent successful run assembled into the
 * same shape the frontend expects.
 */
export async function getLatestSnapshot(username) {
  const { rows } = await pool.query(
    `SELECT id, scraped_at FROM runs
     WHERE username = $1 AND success = TRUE
     ORDER BY scraped_at DESC LIMIT 1`,
    [username]
  );
  if (!rows.length) return null;
  return assembleSnapshot(rows[0]);
}

/**
 * List of snapshots for the trends explorer.
 * Returns lightweight objects (run metadata + stats) without user_info/tags
 * to keep payload manageable.
 *
 * @param {string} username
 * @param {string} since    — ISO timestamp lower bound (optional)
 * @param {number} limit    — max rows (default 1000)
 */
export async function getSnapshots(username, { since, limit = 1000 } = {}) {
  const params = [username, limit];
  const sinceClause = since
? `AND scraped_at >= $3` : '';
  if (since) params.push(since);

  const { rows: runs } = await pool.query(
    `SELECT id, scraped_at FROM runs
     WHERE username = $1 AND success = TRUE
     ${sinceClause}
     ORDER BY scraped_at ASC
     LIMIT $2`,
    params
  );

  if (!runs.length) return [];

  const runIds = runs.map(r => r.id);

  // Batch-load all stats for these runs
  const [edits, entities, votes] = await Promise.all([
    pool.query(
      `SELECT run_id, key, value FROM edit_stats WHERE run_id = ANY($1)`,
      [runIds]
    ),
    pool.query(
      `SELECT run_id, entity_type, value FROM entity_stats WHERE run_id = ANY($1)`,
      [runIds]
    ),
    pool.query(
      `SELECT run_id, period, vote_type, value FROM vote_stats WHERE run_id = ANY($1)`,
      [runIds]
    ),
  ]);

  // Index by run_id for O(1) assembly
  const editsByRun    = groupBy(edits.rows,    'run_id');
  const entitiesByRun = groupBy(entities.rows, 'run_id');
  const votesByRun    = groupBy(votes.rows,    'run_id');

  return runs.map(run => {
    const editsObj = {};
    for (const row of editsByRun[run.id] || []) editsObj[row.key] = Number(row.value);

    const entitiesObj = {};
    for (const row of entitiesByRun[run.id] || []) entitiesObj[row.entity_type] = Number(row.value);

    const votesObj = { recent: {}, overall: {} };
    for (const row of votesByRun[run.id] || []) {
      votesObj[row.period][row.vote_type] = Number(row.value);
    }

    return {
      runId:     Number(run.id),
      fetchedAt: run.scraped_at,
      username,
      edits:    editsObj,
      entities: entitiesObj,
      votes:    votesObj,
    };
  });
}

/**
 * Run history — lightweight list of all runs (for debugging/admin).
 */
export async function getRunHistory(username, limit = 100) {
  const { rows } = await pool.query(
    `SELECT id, scraped_at, duration_ms, success, error_msg
     FROM runs WHERE username = $1
     ORDER BY scraped_at DESC LIMIT $2`,
    [username, limit]
  );
  return rows.map(r => ({ ...r, id: Number(r.id) }));
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function assembleSnapshot(run) {
  const runId = run.id;
  const [edits, entities, votes, tags, userInfo] = await Promise.all([
    pool.query(`SELECT key, value FROM edit_stats   WHERE run_id = $1`, [runId]),
    pool.query(`SELECT entity_type, value FROM entity_stats WHERE run_id = $1`, [runId]),
    pool.query(`SELECT period, vote_type, value FROM vote_stats WHERE run_id = $1`, [runId]),
    pool.query(`SELECT key, value FROM tag_stats    WHERE run_id = $1`, [runId]),
    pool.query(`SELECT member_since, location, bio FROM user_info WHERE run_id = $1`, [runId]),
  ]);

  const editsObj = {};
  for (const r of edits.rows) editsObj[r.key] = Number(r.value);

  const entitiesObj = {};
  for (const r of entities.rows) entitiesObj[r.entity_type] = Number(r.value);

  const votesObj = { recent: {}, overall: {} };
  for (const r of votes.rows) votesObj[r.period][r.vote_type] = Number(r.value);

  const tagsObj = {};
  for (const r of tags.rows) tagsObj[r.key] = Number(r.value);

  return {
    runId:     Number(runId),
    fetchedAt: run.scraped_at,
    username:  process.env.MB_USERNAME,
    edits:     editsObj,
    entities:  entitiesObj,
    votes:     votesObj,
    tags:      tagsObj,
    userInfo:  userInfo.rows[0] || {},
  };
}

function groupBy(rows, key) {
  const out = {};
  for (const row of rows) {
    const k = row[key];
    if (!out[k]) out[k] = [];
    out[k].push(row);
  }
  return out;
}
