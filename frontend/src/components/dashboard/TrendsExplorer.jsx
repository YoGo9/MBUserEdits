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
      { key: "edits.Total",          label: "Total Edits" },
      { key: "edits.Accepted",       label: "Accepted" },
      { key: "edits.Auto-edits",     label: "Auto-edits" },
      { key: "edits.Total applied",  label: "Total Applied" },
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
      { key: "entities.Release group", label: "Release Groups" },
      { key: "entities.Work",          label: "Works" },
      { key: "entities.Label",         label: "Labels" },
      { key: "entities.Recording",     label: "Recordings" },
    ],
  },
  {
    group: "Votes",
    metrics: [
      { key: "votes.overall.Yes",     label: "Yes (Overall)" },
      { key: "votes.overall.No",      label: "No (Overall)" },
      { key: "votes.recent.Yes",      label: "Yes (28d)" },
      { key: "votes.recent.No",       label: "No (28d)" },
      { key: "votes.recent.Abstain",  label: "Abstain (28d)" },
    ],
  },
];

function getNestedValue(obj, keyPath) {
  return keyPath.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-sm">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="font-mono font-semibold text-primary">{payload[0].value?.toLocaleString()}</p>
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
  const trendColor = delta > 0 ? "text-green-500" : delta < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card rounded-xl border border-border/50 px-5 pt-5 pb-4"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trends Explorer
          </p>
          {delta !== null && (
            <div className={`flex items-center gap-1 mt-0.5 text-sm font-medium ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {delta > 0 ? "+" : ""}{delta.toLocaleString()}
            </div>
          )}
        </div>
        {/* Time range */}
        <div className="flex gap-1">
          {TIME_RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setSelectedRange(r.hours)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedRange === r.hours
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric groups — compact pill rows */}
      <div className="flex flex-col gap-2 mb-5">
        {METRIC_GROUPS.map(group => (
          <div key={group.group} className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground w-14 shrink-0">{group.group}</span>
            {group.metrics.map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMetric(m.key)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors border ${
                  selectedMetric === m.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Chart */}
      {filteredData.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Not enough data for this range yet.
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,92%)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v.toLocaleString()}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="value"
                stroke="hsl(270,60%,50%)" strokeWidth={2}
                dot={false} activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
