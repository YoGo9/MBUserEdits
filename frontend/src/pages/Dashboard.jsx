import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import UserHeader from "@/components/dashboard/UserHeader";
import StatCard from "@/components/dashboard/StatCard";
import EntitiesChart from "@/components/dashboard/EntitiesChart";
import TrendsExplorer from "@/components/dashboard/TrendsExplorer";

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError]         = useState(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [latest, snaps] = await Promise.all([
        api.latestSnapshot().catch(() => null),
        api.listSnapshots(undefined, 2000),
      ]);
      setStats(latest);
      setSnapshots(snaps);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleFetchNow = async () => {
    setIsPolling(true);
    try {
      await api.fetchNow();
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPolling(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading stats…</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <XCircle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Failed to load</h2>
        <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
        <Button variant="outline" size="sm" onClick={loadAll}>Retry</Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center px-4">
        <p className="text-muted-foreground text-sm">No data yet — hit Fetch Now.</p>
        <Button variant="outline" size="sm" onClick={handleFetchNow} disabled={isPolling}>
          {isPolling ? "Fetching…" : "Fetch Now"}
        </Button>
      </div>
    );
  }

  const { edits, entities, userInfo, fetchedAt, username } = stats;

  const statCards = [
    { label: "Total Edits",   value: edits?.["Total"] },
    { label: "Total Applied", value: edits?.["Total applied"] },
    { label: "Auto-edits",    value: edits?.["Auto-edits"] },
    { label: "Accepted",      value: edits?.["Accepted"] },
    { label: "Open",          value: edits?.["Open"] },
    { label: "Last 24h",      value: edits?.["Last 24 hours"] },
    { label: "Voted Down",    value: edits?.["Voted down"] },
    { label: "Failed",        value: edits?.["Failed"] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <UserHeader
          username={username}
          userInfo={userInfo}
          fetchedAt={fetchedAt}
          lastRefreshed={lastRefreshed}
          onFetchNow={handleFetchNow}
          onRefresh={loadAll}
          isPolling={isPolling}
          isLoading={isLoading}
        />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {statCards.map((card, i) => (
              <StatCard key={card.label} {...card} delay={i * 0.04} />
            ))}
          </div>

          <EntitiesChart entities={entities || {}} />
          <TrendsExplorer snapshots={snapshots} />
        </motion.div>
      </div>
    </div>
  );
}
