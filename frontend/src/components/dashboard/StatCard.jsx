import { motion } from "framer-motion";

export default function StatCard({ label, value, delay = 0, highlight = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`flex flex-col justify-between p-4 rounded-2xl border ${
        highlight
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border/40"
      }`}
    >
      <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] mb-3 ${
        highlight ? "text-primary-foreground/70" : "text-muted-foreground"
      }`}>
        {label}
      </p>
      <p className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none ${
        highlight ? "text-primary-foreground" : ""
      }`}>
        {value != null ? value.toLocaleString() : "—"}
      </p>
    </motion.div>
  );
}
