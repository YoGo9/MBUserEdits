/**
 * Migration: create all tables for brainz-edit-pulse.
 * Safe to run multiple times (all CREATE statements use IF NOT EXISTS).
 *
 * Run with: npm run setup-db
 */

import { pool } from './pool.js';

const DDL = `
-- One row per scrape run
CREATE TABLE IF NOT EXISTS runs (
  id           BIGSERIAL PRIMARY KEY,
  username     TEXT        NOT NULL,
  scraped_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_ms  INTEGER,
  success      BOOLEAN     NOT NULL DEFAULT TRUE,
  error_msg    TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_username_scraped
  ON runs (username, scraped_at DESC);

-- User profile info (location, member since, bio)
-- One row per run; latest row is current profile.
CREATE TABLE IF NOT EXISTS user_info (
  run_id       BIGINT      PRIMARY KEY REFERENCES runs(id) ON DELETE CASCADE,
  member_since TEXT,
  location     TEXT,
  bio          TEXT
);

-- Edit statistics (Total, Accepted, Auto-edits, etc.)
CREATE TABLE IF NOT EXISTS edit_stats (
  id           BIGSERIAL   PRIMARY KEY,
  run_id       BIGINT      NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  key          TEXT        NOT NULL,
  value        BIGINT      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_edit_stats_run
  ON edit_stats (run_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_edit_stats_run_key
  ON edit_stats (run_id, key);

-- Entity counts (Artist, Release, Recording, etc.)
CREATE TABLE IF NOT EXISTS entity_stats (
  id           BIGSERIAL   PRIMARY KEY,
  run_id       BIGINT      NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  entity_type  TEXT        NOT NULL,
  value        BIGINT      NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_stats_run_type
  ON entity_stats (run_id, entity_type);

-- Vote statistics (Yes/No/Abstain × recent/overall)
CREATE TABLE IF NOT EXISTS vote_stats (
  id           BIGSERIAL   PRIMARY KEY,
  run_id       BIGINT      NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  period       TEXT        NOT NULL CHECK (period IN ('recent', 'overall')),
  vote_type    TEXT        NOT NULL,
  value        BIGINT      NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vote_stats_run_period_type
  ON vote_stats (run_id, period, vote_type);

-- Tag/rating statistics
CREATE TABLE IF NOT EXISTS tag_stats (
  id           BIGSERIAL   PRIMARY KEY,
  run_id       BIGINT      NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  key          TEXT        NOT NULL,
  value        BIGINT      NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tag_stats_run_key
  ON tag_stats (run_id, key);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('[migrate] Running migrations...');
    await client.query('BEGIN');
    await client.query(DDL);
    await client.query('COMMIT');
    console.log('[migrate] Done.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[migrate] Failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
