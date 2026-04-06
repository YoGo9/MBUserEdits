import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

const COLORS = [
  "#7c3aed","#a855f7","#06b6d4","#eab308","#22c55e",
  "#f97316","#ec4899","#64748b","#84cc16","#14b8a6","#f43f5e",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium">{payload[0].payload.name}</p>
      <p className="text-primary font-mono">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export default function EntitiesChart({ entities }) {
  const data = Object.entries(entities)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (!data.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl border border-border/50 px-5 pt-5 pb-3 mb-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Added Entities
      </p>
      <ResponsiveContainer width="100%" height={data.length * 32 + 8}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          barSize={14}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.toLocaleString()}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 11, fill: "hsl(220,10%,45%)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220,14%,96%)" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
