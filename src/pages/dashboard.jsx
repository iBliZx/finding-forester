import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TreePine, Cloud, BarChart3, TrendingUp, Bug, Droplets, AlertCircle } from "lucide-react";
import { loadAssessmentsFromCookie } from "../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

export default function Dashboard() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const data = loadAssessmentsFromCookie();
    setAssessments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for assessment saved events
  useEffect(() => {
    const handleAssessmentSaved = () => {
      loadData();
    };
    window.addEventListener('assessmentSaved', handleAssessmentSaved);
    return () => window.removeEventListener('assessmentSaved', handleAssessmentSaved);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalTrees = assessments.reduce((s, a) => s + (a.estimated_trees || 0), 0);
  const totalCO2 = assessments.reduce((s, a) => s + (a.co2_stored_tons || 0), 0);
  const totalReplant = assessments.reduce((s, a) => s + (a.trees_to_replant || 0), 0);
  const totalArea = assessments.reduce((s, a) => s + (a.area_hectares || 0), 0);
  const avgBiodiversity = assessments.length > 0 
    ? (assessments.reduce((s, a) => s + (a.biodiversity_score || 0), 0) / assessments.length).toFixed(1)
    : 0;
  const avgWaterImpact = assessments.length > 0 
    ? (assessments.reduce((s, a) => s + (a.water_impact_score || 0), 0) / assessments.length).toFixed(1)
    : 0;
  const criticalRiskCount = assessments.filter(a => a.soil_erosion_risk === "high").length;

  const summaryCards = [
    { label: "Total Assessments", value: assessments.length, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { label: "Trees at Risk", value: totalTrees.toLocaleString(), icon: TreePine, color: "text-destructive", bg: "bg-red-50" },
    { label: "CO₂ at Stake (tons)", value: totalCO2.toLocaleString(), icon: Cloud, color: "text-chart-3", bg: "bg-blue-50" },
    { label: "Trees to Replant", value: totalReplant.toLocaleString(), icon: TrendingUp, color: "text-chart-2", bg: "bg-amber-50" },
  ];

  const healthMetrics = [
    { label: "Avg. Biodiversity Score", value: `${avgBiodiversity}/100`, icon: Bug, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Avg. Water Impact Score", value: `${avgWaterImpact}/100`, icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "High Erosion Risk Areas", value: criticalRiskCount, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Area Assessed", value: `${totalArea.toLocaleString()} ha`, icon: TreePine, color: "text-green-600", bg: "bg-green-50" },
  ];

  const chartData = assessments.slice(0, 10).reverse().map((a) => ({
    name: a.area_name?.substring(0, 12) || "Unnamed",
    co2: a.co2_stored_tons || 0,
    trees: (a.estimated_trees || 0) / 1000,
    area: a.area_hectares || 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Overview of all your forest ecological assessments
        </p>
      </motion.div>

      {assessments.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <TreePine className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-heading text-lg font-semibold mb-1">No Assessments Yet</h3>
          <p className="text-sm text-muted-foreground">Go to the Assess page to analyze your first forest area.</p>
        </div>
      ) : (
        <>
          {/* Primary Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className={`h-9 w-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-heading font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Health Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {healthMetrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className={`h-9 w-9 rounded-lg ${metric.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-4.5 w-4.5 ${metric.color}`} />
                  </div>
                  <p className="text-2xl font-heading font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{metric.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="font-heading text-lg font-semibold mb-4">CO₂ by Assessment</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 15%, 88%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(150, 10%, 42%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(150, 10%, 42%)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(140, 15%, 88%)",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="co2" name="CO₂ (tons)" fill="hsl(152, 55%, 28%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="font-heading text-lg font-semibold mb-4">Trees at Risk (thousands)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 15%, 88%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(150, 10%, 42%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(150, 10%, 42%)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(140, 15%, 88%)",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="trees"
                      name="Trees (K)"
                      stroke="hsl(38, 80%, 55%)"
                      fill="hsl(38, 80%, 55%)"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}