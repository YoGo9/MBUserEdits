import { motion } from "framer-motion";

export default function StatCard({ label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card rounded-xl px-4 py-4 border border-border/50"
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums tracking-tight">
        {value != null ? value.toLocaleString() : "—"}
      </p>
    </motion.div>
  );
}
