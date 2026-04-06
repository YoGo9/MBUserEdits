import { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { ArrowLeft, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function JsonTree({ data, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(depth > 1);

  if (data === null || data === undefined) {
    return <span className="text-muted-foreground">null</span>;
  }
  if (typeof data === "boolean") {
    return <span className={data ? "text-green-500" : "text-red-500"}>{String(data)}</span>;
  }
  if (typeof data === "number") {
    return <span className="text-blue-500">{data.toLocaleString()}</span>;
  }
  if (typeof data === "string") {
    // ISO date — format nicely
    if (/^\d{4}-\d{2}-\d{2}T/.test(data)) {
      return <span className="text-amber-500">{new Date(data).toLocaleString()}</span>;
    }
    return <span className="text-green-600">"{data}"</span>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-muted-foreground">[]</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span className="ml-0.5 text-xs">[{data.length}]</span>
        </button>
        {!collapsed && (
          <div className="ml-4 border-l border-border pl-3 mt-0.5">
            {data.map((item, i) => (
              <div key={i} className="flex gap-1.5 items-start py-0.5">
                <span className="text-xs text-muted-foreground shrink-0">{i}</span>
                <JsonTree data={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }
  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span className="text-muted-foreground">{"{}"}</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span className="ml-0.5 text-xs">{"{" + keys.length + "}"}</span>
        </button>
        {!collapsed && (
          <div className="ml-4 border-l border-border pl-3 mt-0.5">
            {keys.map(key => (
              <div key={key} className="flex gap-1.5 items-start py-0.5 flex-wrap">
                <span className="text-primary font-medium text-xs shrink-0">{key}:</span>
                <JsonTree data={data[key]} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }
  return <span>{String(data)}</span>;
}

function Section({ title, data, loading }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h2>
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="font-mono text-sm leading-relaxed">
          <JsonTree data={data} depth={0} />
        </div>
      )}
    </div>
  );
}

export default function RawData() {
  const [latest, setLatest]   = useState(null);
  const [runs, setRuns]       = useState(null);
  const [config, setConfig]   = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [l, r, c] = await Promise.all([
      api.latestSnapshot().catch(e => ({ error: e.message })),
      api.getRuns(50).catch(e => ({ error: e.message })),
      api.getConfig().catch(e => ({ error: e.message })),
    ]);
    setLatest(l);
    setRuns(r);
    setConfig(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Dashboard
            </Button>
            <h1 className="text-xl font-bold">Raw Data</h1>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Section title="Config" data={config} loading={loading} />
        <Section title="Latest Snapshot" data={latest} loading={loading} />
        <Section title="Last 50 Scrape Runs" data={runs} loading={loading} />
      </div>
    </div>
  );
}
