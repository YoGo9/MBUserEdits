import { motion } from "framer-motion";

const COLORS = [
  "#7c3aed","#a855f7","#06b6d4","#eab308","#22c55e",
  "#f97316","#ec4899","#64748b","#84cc16","#14b8a6","#f43f5e",
];

export default function EntitiesChart({ entities }) {
  const data = Object.entries(entities)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (!data.length) return null;

  const max = data[0].value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card rounded-2xl border border-border/40 p-5 mb-3"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-5">
        Added Entities
      </p>
      <div className="flex flex-col gap-3">
        {data.map(({ name, value }, i) => (
          <div key={name} className="flex items-center gap-3">
            {/* Name */}
            <p className="text-sm text-muted-foreground w-24 shrink-0 truncate">{name}</p>
            {/* Bar track */}
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.04, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>
            {/* Value */}
            <p className="font-mono text-sm tabular-nums text-right w-16 shrink-0">
              {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
