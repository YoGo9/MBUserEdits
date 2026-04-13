import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TIME_RANGES = [
  { label: "1h",  hours: 1 },
  { label: "6h",  hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d",  hours: 168 },
  { label: "30d", hours: 720 },
  { label: "All", hours: null },
];

const METRIC_GROUPS = [
  {
    group: "Edits",
    metrics: [
      { key: "edits.Total",          label: "Total" },
      { key: "edits.Accepted",       label: "Accepted" },
      { key: "edits.Auto-edits",     label: "Auto-edits" },
      { key: "edits.Total applied",  label: "Applied" },
      { key: "edits.Voted down",     label: "Voted Down" },
      { key: "edits.Failed",         label: "Failed" },
      { key: "edits.Cancelled",      label: "Cancelled" },
      { key: "edits.Open",           label: "Open" },
      { key: "edits.Last 24 hours",  label: "Last 24h" },
    ],
  },
  {
    group: "Entities",
    metrics: [
      { key: "entities.Artist",        label: "Artists" },
      { key: "entities.Cover art",     label: "Cover Art" },
      { key: "entities.Release",       label: "Releases" },
      { key: "entities.Release group", label: "Rel. Groups" },
      { key: "entities.Work",          label: "Works" },
      { key: "entities.Label",         label: "Labels" },
      { key: "entities.Recording",     label: "Recordings" },
    ],
  },
  {
    group: "Votes",
    metrics: [
      { key: "votes.overall.Yes",    label: "Yes (All)" },
      { key: "votes.overall.No",     label: "No (All)" },
      { key: "votes.recent.Yes",     label: "Yes (28d)" },
      { key: "votes.recent.No",      label: "No (28d)" },
      { key: "votes.recent.Abstain", label: "Abstain" },
    ],
  },
];

function getNestedValue(obj, keyPath) {
  return keyPath.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-xl px-3 py-2 shadow-xl text-sm">
      <p className="text-muted-foreground text-[10px] mb-0.5">{label}</p>
      <p className="font-mono font-bold text-foreground">{payload[0].value?.toLocaleString()}</p>
    </div>
  );
};

export default function TrendsExplorer({ snapshots }) {
  const [selectedMetric, setSelectedMetric] = useState("edits.Total");
  const [selectedRange, setSelectedRange]   = useState(24);

  const filteredData = useMemo(() => {
    let data = [...snapshots].sort((a, b) => new Date(a.fetchedAt) - new Date(b.fetchedAt));
    if (selectedRange !== null) {
      const cutoff = new Date(Date.now() - selectedRange * 3600 * 1000);
      data = data.filter(s => new Date(s.fetchedAt) >= cutoff);
    }
    return data.map(s => ({
      time: new Date(s.fetchedAt).toLocaleString([], {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      }),
      value: getNestedValue(s, selectedMetric),
    })).filter(d => d.value !== null);
  }, [snapshots, selectedMetric, selectedRange]);

  const first = filteredData[0]?.value;
  const last  = filteredData[filteredData.length - 1]?.value;
  const delta = first != null && last != null ? last - first : null;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? "text-emerald-500" : delta < 0 ? "text-red-500" : "text-muted-foreground";

  const selectedLabel = METRIC_GROUPS.flatMap(g => g.metrics).find(m => m.key === selectedMetric)?.label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-card rounded-2xl border border-border/40 p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Trends
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm font-medium">{selectedLabel}</p>
            {delta !== null && (
              <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                {delta > 0 ? "+" : ""}{delta.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1 shrink-0">
          {TIME_RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setSelectedRange(r.hours)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedRange === r.hours
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mb-5">
        {METRIC_GROUPS.map(group => (
          <div key={group.group} className="flex items-start gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60 w-12 pt-1 shrink-0">
              {group.group}
            </span>
            <div className="flex flex-wrap gap-1">
              {group.metrics.map(m => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMetric(m.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedMetric === m.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredData.length < 2 ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          Not enough data for this range yet.
        </div>
      ) : (
        <div className="h-40 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}