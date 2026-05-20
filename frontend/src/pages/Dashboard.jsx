import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

import UserHeader from "@/components/dashboard/UserHeader";
import StatCard from "@/components/dashboard/StatCard";
import EntitiesChart from "@/components/dashboard/EntitiesChart";
import TrendsExplorer from "@/components/dashboard/TrendsExplorer";

export default function Dashboard() {
  const [stats, setStats]                 = useState(null);
  const [snapshots, setSnapshots]         = useState([]);
  const [selectedRange, setSelectedRange] = useState(168); // default 7d
  const [isLoading, setIsLoading]         = useState(true);
  const [isPolling, setIsPolling]         = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError]                 = useState(null);

  const fetchSnapshots = useCallback(async (rangeHours) => {
    const since = rangeHours === null
      ? 'all'
      : new Date(Date.now() - rangeHours * 3600 * 1000).toISOString();
    return api.listSnapshots(since);
  }, []);

  const loadAll = useCallback(async (rangeHours) => {
    setIsLoading(true);
    setError(null);
    try {
      const [latest, snaps] = await Promise.all([
        api.latestSnapshot().catch(() => null),
        fetchSnapshots(rangeHours),
      ]);
      setStats(latest);
      setSnapshots(snaps);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSnapshots]);

  const handleRangeChange = useCallback(async (rangeHours) => {
    setSelectedRange(rangeHours);
    try {
      const snaps = await fetchSnapshots(rangeHours);
      setSnapshots(snaps);
    } catch (err) {
      setError(err.message);
    }
  }, [fetchSnapshots]);

  useEffect(() => { loadAll(168); }, []);

  const handleFetchNow = async () => {
    setIsPolling(true);
    try {
      await api.fetchNow();
      await loadAll(selectedRange);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPolling(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-6 text-center">
        <XCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
        <button onClick={() => loadAll(selectedRange)} className="text-xs text-primary underline">Retry</button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-sm text-muted-foreground">No data yet.</p>
        <button onClick={handleFetchNow} disabled={isPolling}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-xl font-medium">
          {isPolling ? "Fetching…" : "Fetch Now"}
        </button>
      </div>
    );
  }

  const { edits, entities, userInfo, fetchedAt, username } = stats;

  const heroCards = [
    { label: "Total Edits", value: edits?.["Total"],         highlight: true },
    { label: "Last 24h",    value: edits?.["Last 24 hours"], highlight: true },
  ];

  const secondaryCards = [
    { label: "Auto-edits",    value: edits?.["Auto-edits"] },
    { label: "Accepted",      value: edits?.["Accepted"] },
    { label: "Total Applied", value: edits?.["Total applied"] },
    { label: "Open",          value: edits?.["Open"] },
    { label: "Voted Down",    value: edits?.["Voted down"] },
    { label: "Failed",        value: edits?.["Failed"] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <UserHeader
          username={username}
          userInfo={userInfo}
          fetchedAt={fetchedAt}
          lastRefreshed={lastRefreshed}
          onFetchNow={handleFetchNow}
          onRefresh={() => loadAll(selectedRange)}
          isPolling={isPolling}
          isLoading={isLoading}
        />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {heroCards.map((card, i) => (
              <StatCard key={card.label} {...card} delay={i * 0.05} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {secondaryCards.map((card, i) => (
              <StatCard key={card.label} {...card} delay={0.1 + i * 0.04} />
            ))}
          </div>
          <EntitiesChart entities={entities || {}} />
          <TrendsExplorer
            snapshots={snapshots}
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
          />
        </motion.div>
      </div>
    </div>
  );
}
