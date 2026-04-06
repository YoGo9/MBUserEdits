import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-mono font-medium">{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function VotesChart({ votes }) {
  const data = ["Yes", "No", "Abstain"].map(type => ({
    name: type,
    "Last 28 days": votes.recent?.[type] || 0,
    "Overall": votes.overall?.[type] || 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Votes Summary</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -10 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(270, 60%, 50%, 0.05)' }} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Last 28 days" fill="hsl(270, 60%, 50%)" radius={[4, 4, 0, 0]} barSize={28} />
            <Bar dataKey="Overall" fill="hsl(330, 65%, 55%)" radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}