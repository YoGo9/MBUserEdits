import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const COLORS = [
  "hsl(270, 60%, 50%)",
  "hsl(330, 65%, 55%)",
  "hsl(200, 70%, 50%)",
  "hsl(45, 90%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(15, 75%, 55%)",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm font-mono text-primary">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function EditsBreakdownChart({ edits }) {
  const data = [
    { name: "Accepted", value: edits["Accepted"] || 0 },
    { name: "Auto-edits", value: edits["Auto-edits"] || 0 },
    { name: "Open", value: edits["Open"] || 0 },
    { name: "Failed", value: edits["Failed"] || 0 },
    { name: "Cancelled", value: edits["Cancelled"] || 0 },
    { name: "Voted down", value: edits["Voted down"] || 0 },
  ].filter(d => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Edit Breakdown</h3>
      <div className="flex items-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-mono font-medium">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}