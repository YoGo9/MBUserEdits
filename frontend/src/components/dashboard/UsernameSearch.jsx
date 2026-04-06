import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function UsernameSearch({ onSearch, isLoading }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-2xl shadow-primary/20">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 19V6l12-3v13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="19" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center mb-3">
        MusicBrainz
        <span className="block text-primary">Stats Viewer</span>
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-10 text-base">
        Visualize your editing habits with beautiful charts and detailed breakdowns
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            placeholder="Enter MusicBrainz username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-11 pr-28 h-14 text-base rounded-2xl bg-card border-border/50 focus:border-primary/50 shadow-sm"
          />
          <Button
            type="submit"
            disabled={!username.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground mt-6">
        Try: <button onClick={() => { setUsername("YoGo"); onSearch("YoGo"); }} className="text-primary hover:underline font-medium">YoGo</button>
        {" · "}
        <button onClick={() => { setUsername("reosarevok"); onSearch("reosarevok"); }} className="text-primary hover:underline font-medium">reosarevok</button>
      </p>
    </motion.div>
  );
}