# MBUserEdits

A self-hosted MusicBrainz editor statistics dashboard. Scrapes your public MusicBrainz profile on a configurable schedule, stores snapshots in PostgreSQL, and serves a clean React dashboard with trend tracking.

![Dashboard showing edit stats, entity breakdown, and trends chart](https://i.imgur.com/WeV1isI.png)

## Features

- Tracks edits, votes, and added entities over time
- Trends explorer — chart any metric over 1h / 6h / 24h / 7d / 30d / all time
- Entity breakdown with animated bar chart
- Raw data view for debugging
- Dark mode
- Mobile-friendly

## Self-hosting

### YunoHost (recommended)

```bash
sudo yunohost app install https://github.com/YoGo9/MBUserEdits_ynh
```

Install questions: domain/path, MusicBrainz username, scrape schedule (cron expression).

### Manual (Ubuntu / WSL)

**Prerequisites:** Node.js 18+, PostgreSQL

```bash
git clone https://github.com/YoGo9/MBUserEdits.git
cd MBUserEdits
bash setup.sh        # installs deps, creates DB, writes .env
npm run build        # builds the React frontend
npm start            # starts server on :3456
```

Open http://localhost:3456

#### Development workflow

```bash
# Terminal 1 — backend with auto-reload
npm run dev

# Terminal 2 — frontend with hot reload
cd frontend && npm run dev
# Open http://localhost:5173
```

## Project structure

```
MBUserEdits/
├── src/                  — Express backend + scraper
│   ├── index.js          — entry point (server + cron)
│   ├── api/routes.js     — REST API endpoints
│   ├── db/               — PostgreSQL pool, migrations, read, write
│   └── scraper/          — HTML parser, scraper, run-once
├── frontend/             — React (Vite) dashboard
│   └── src/
│       ├── pages/        — Dashboard, RawData
│       ├── components/   — StatCard, EntitiesChart, TrendsExplorer, UserHeader
│       └── api/          — API client
├── .env.example          — config template
└── setup.sh              — one-time local setup script
```

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/config` | Username + cron expression |
| GET | `/api/latest` | Most recent successful snapshot |
| GET | `/api/snapshots?since=<ISO>&limit=<n>` | Time-series data |
| GET | `/api/runs?limit=<n>` | Scrape run history |
| POST | `/api/fetch` | Trigger a manual scrape |

`since` defaults to 30 days ago. Pass `since=all` for full history.

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
npm start
```

## License

MIT
