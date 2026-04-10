import { motion } from "framer-motion";
import { ExternalLink, RefreshCw, Download, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function UserHeader({
  username, userInfo, fetchedAt,
  onFetchNow, onRefresh, isPolling, isLoading,
  lastRefreshed,
}) {
  const { theme, toggle } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between mb-6"
    >
      {/* Left — identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
          {username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm leading-none">{username}</span>
            <a
              href={`https://musicbrainz.org/user/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {fetchedAt && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onFetchNow}
          disabled={isPolling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 transition-opacity"
        >
          <Download className={`w-3 h-3 ${isPolling ? "animate-pulse" : ""}`} />
          {isPolling ? "Fetching…" : "Fetch"}
        </button>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => window.location.href = "/raw"}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[10px] font-semibold"
        >
          Raw
        </button>
      </div>
    </motion.div>
  );
}
