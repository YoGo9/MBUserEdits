/**
 * Self-hosted API client
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || res.statusText), { status: res.status });
  }
  return res.json();
}

export const api = {
  listSnapshots(since = undefined, limit = 2000) {
    const params = new URLSearchParams({ limit });
    if (since) params.set('since', since);
    return apiFetch(`/api/snapshots?${params}`);
  },

  latestSnapshot() {
    return apiFetch('/api/latest');
  },

  fetchNow() {
    return apiFetch('/api/fetch', { method: 'POST', body: JSON.stringify({}) });
  },

  getConfig() {
    return apiFetch('/api/config');
  },

  getRuns(limit = 200) {
    return apiFetch(`/api/runs?limit=${limit}`);
  },
};
