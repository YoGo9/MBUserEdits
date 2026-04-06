import { motion } from "framer-motion";
import { MapPin, Calendar, ExternalLink, RefreshCw, Download, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export default function UserHeader({
  username, userInfo, fetchedAt,
  onFetchNow, onRefresh, isPolling, isLoading,
  lastRefreshed,
}) {
  const { theme, toggle } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50"
    >
      {/* Left — identity */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-primary/20 shrink-0">
          {username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{username}</h1>
            <a
              href={`https://musicbrainz.org/user/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
            {userInfo?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {userInfo.location}
              </span>
            )}
            {userInfo?.memberSince && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Since {userInfo.memberSince.split(" ")[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right — actions + timestamps */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={onFetchNow} disabled={isPolling}>
            <Download className={`w-3.5 h-3.5 mr-1.5 ${isPolling ? "animate-pulse" : ""}`} />
            {isPolling ? "Fetching…" : "Fetch Now"}
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={onRefresh} disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
            title="Refresh UI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground"
            title="Toggle dark mode"
          >
            {theme === "dark"
              ? <Sun className="w-3.5 h-3.5" />
              : <Moon className="w-3.5 h-3.5" />
            }
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => window.location.href = "/raw"}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Raw
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-right leading-relaxed">
          {fetchedAt && <span>Scraped {new Date(fetchedAt).toLocaleTimeString()}</span>}
          {lastRefreshed && fetchedAt && <span className="mx-1.5">·</span>}
          {lastRefreshed && <span>UI {lastRefreshed.toLocaleTimeString()}</span>}
        </div>
      </div>
    </motion.div>
  );
}
