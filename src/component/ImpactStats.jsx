import { motion } from "framer-motion";
import { TreePine, Cloud, Droplets, Bug, AlertTriangle, Timer } from "lucide-react";

const statCards = [
  {
    key: "estimated_trees",
    label: "Estimated Trees",
    icon: TreePine,
    format: (v) => v?.toLocaleString() || "—",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "co2_stored_tons",
    label: "CO₂ Stored (tons)",
    icon: Cloud,
    format: (v) => (v ? `${v.toLocaleString()} t` : "—"),
    color: "text-chart-3",
    bgColor: "bg-blue-50",
  },
  {
    key: "co2_annual_absorption",
    label: "Annual CO₂ Absorption",
    icon: Cloud,
    format: (v) => (v ? `${v.toLocaleString()} t/yr` : "—"),
    color: "text-chart-2",
    bgColor: "bg-amber-50",
  },
  {
    key: "biodiversity_score",
    label: "Biodiversity Score",
    icon: Bug,
    format: (v) => (v ? `${v}/100` : "—"),
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "water_impact_score",
    label: "Water Impact Score",
    icon: Droplets,
    format: (v) => (v ? `${v}/100` : "—"),
    color: "text-chart-3",
    bgColor: "bg-blue-50",
  },
  {
    key: "soil_erosion_risk",
    label: "Soil Erosion Risk",
    icon: AlertTriangle,
    format: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : "—",
    color: "text-destructive",
    bgColor: "bg-red-50",
  },
];

export default function ImpactStats({ data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold tracking-tight">
              {stat.format(data?.[stat.key])}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}