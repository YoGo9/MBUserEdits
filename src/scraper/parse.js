/**
 * Parse a MusicBrainz user profile HTML page into structured stats.
 * Pure function — no I/O, no side effects.
 */

function extractNumeric(value) {
  const match = value.match(/[\d,]+/);
  if (match) return parseInt(match[0].replace(/,/g, ''), 10);
  return 0;
}

export function parseUserPage(html) {
  const stats = {
    edits:    {},
    votes:    { recent: {}, overall: {} },
    entities: {},
    tags:     {},
    userInfo: {},
  };

  // ── Edits table ────────────────────────────────────────────────────────────
  const editsMatch = html.match(
    /<table class="statistics">\s*<thead>\s*<tr>\s*<th[^>]*>Edits<\/th>\s*<\/tr>\s*<\/thead>\s*<tbody>([\s\S]*?)<\/tbody>/
  );
  if (editsMatch) {
    const rows = [...editsMatch[1].matchAll(
      /<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/g
    )];
    for (const row of rows) {
      const key = row[1].replace(/<[^>]*>/g, '').trim();
      const val = row[2].replace(/<[^>]*>/g, '').trim();
      if (key) stats.edits[key] = extractNumeric(val);
    }
  }

  // ── Votes table ────────────────────────────────────────────────────────────
  const votesMatch = html.match(
    /<table class="statistics" title="This table shows a summary of votes cast by this editor\.">([\s\S]*?)<\/table>/
  );
  if (votesMatch) {
    // Recent
    for (const row of votesMatch[1].matchAll(
      /<tr>\s*<th headers="table_vote_summary_vote">([^<]+)<\/th>\s*<td headers="table_vote_summary_recent">([^<]+)/g
    )) {
      stats.votes.recent[row[1].trim()] = extractNumeric(row[2].trim());
    }
    // Overall
    for (const row of votesMatch[1].matchAll(
      /<th headers="table_vote_summary_vote">([^<]+)<\/th>\s*<td headers="table_vote_summary_recent">[\s\S]*?<\/td>\s*<td headers="table_vote_summary_overall">([\s\S]*?)<\/td>/g
    )) {
      stats.votes.overall[row[1].trim()] = extractNumeric(
        row[2].replace(/<[^>]+>/g, '').trim()
      );
    }
  }

  // ── Entities table ─────────────────────────────────────────────────────────
  const entitiesMatch = html.match(
    /<table class="statistics" title="This table shows a summary of entities added by this editor\.">([\s\S]*?)<\/table>/
  );
  if (entitiesMatch) {
    for (const row of entitiesMatch[1].matchAll(
      /<tr>\s*<th>([^<]+)<\/th>\s*<td>([^<]+)<\/td>\s*<\/tr>/g
    )) {
      stats.entities[row[1].trim()] = extractNumeric(row[2].trim());
    }
  }

  // ── Tags / ratings table ───────────────────────────────────────────────────
  const tagsMatch = html.match(
    /<table class="statistics">\s*<thead>\s*<tr><th colspan="2">Tags and ratings<\/th><\/tr>\s*<\/thead>\s*<tbody>([\s\S]*?)<\/tbody>\s*<\/table>/
  );
  if (tagsMatch) {
    for (const row of tagsMatch[1].matchAll(
      /<tr>\s*<th>([^<]+)<\/th>\s*<td>([^<]+)<\/td>\s*<\/tr>/g
    )) {
      stats.tags[row[1].trim()] = extractNumeric(row[2].trim());
    }
  }

  // ── User info ──────────────────────────────────────────────────────────────
  const memberSince = html.match(/<th>Member since:<\/th>\s*<td>([^<]+)<\/td>/);
  if (memberSince) stats.userInfo.memberSince = memberSince[1].trim();

  const location = html.match(/<th>Location:<\/th>\s*<td>([\s\S]*?)<\/td>/);
  if (location) {
    stats.userInfo.location = location[1]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const bio = html.match(/<th>Bio:<\/th>\s*<td>([\s\S]*?)<\/td>/);
  if (bio) {
    stats.userInfo.bio = bio[1]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return stats;
}
