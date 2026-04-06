# Brainz Edit Pulse — Backend

Self-hosted MusicBrainz editor stats scraper + API server.

## Quick start (Ubuntu / WSL)

```bash
bash setup.sh
npm start
```

`setup.sh` will:
1. Install Node.js 20 (via NodeSource) if needed
2. Install & start PostgreSQL if needed
3. Create the `brainz` DB user and `brainz_edit_pulse` database
4. Prompt for your MB username and scrape interval
5. Write `.env`
6. Run `npm install` and DB migrations

## Manual setup

```bash
cp .env.example .env
# Edit .env with your values
npm install
npm run setup-db   # create tables
npm start
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start server + cron scraper |
| `npm run dev` | Same, with `--watch` for auto-reload |
| `npm run scrape` | Run one scrape immediately and exit |
| `npm run setup-db` | Create/update DB tables (safe to re-run) |

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/config` | Username + cron expression |
| GET | `/api/latest` | Most recent successful snapshot |
| GET | `/api/snapshots` | Time-series snapshots (see params below) |
| GET | `/api/runs` | Scrape run history (debugging) |
| POST | `/api/fetch` | Trigger a manual scrape |

### `/api/snapshots` query params

| Param | Default | Description |
|---|---|---|
| `since` | 30 days ago | ISO timestamp lower bound, or `all` for full history |
| `limit` | 2000 | Max rows (hard cap: 10000) |

## Database schema

```
runs         — one row per scrape (timestamp, success, duration_ms, error_msg)
user_info    — member_since, location, bio per run
edit_stats   — edit counts per run (key/value)
entity_stats — entity counts per run (entity_type/value)
vote_stats   — vote counts per run (period × vote_type)
tag_stats    — tag/rating counts per run
```

## WSL note

PostgreSQL does not auto-start in WSL. After each reboot:

```bash
sudo service postgresql start
```
