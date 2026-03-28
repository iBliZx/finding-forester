import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = [
  "hsl(152, 55%, 28%)",
  "hsl(38, 80%, 55%)",
  "hsl(200, 60%, 45%)",
  "hsl(0, 72%, 51%)",
  "hsl(270, 50%, 55%)",
];

export default function ComparisonChart({ analysis }) {
  if (!analysis) return null;

  const comparisons = analysis.comparisons;
  if (!comparisons) return null;

  const co2Data = comparisons.co2_comparison || [];
  const impactBreakdown = comparisons.impact_breakdown || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-6"
    >
      {co2Data.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">CO₂ Impact Comparison</h3>
              <p className="text-xs text-muted-foreground">
                How this forest's CO₂ storage compares to everyday emissions
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={co2Data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 15%, 88%)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(150, 10%, 42%)" }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: "hsl(150, 10%, 42%)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(140, 15%, 88%)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="tons" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {co2Data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {impactBreakdown.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Ecological Impact Breakdown</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={impactBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {impactBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {impactBreakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm">
                    {item.name}: <span className="font-semibold">{item.value}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}