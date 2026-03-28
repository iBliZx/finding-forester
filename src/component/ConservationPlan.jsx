import { motion } from "framer-motion";
import { TreePine, Timer, DollarSign, ShieldCheck } from "lucide-react";
import { Progress } from "./ui/progress";

export default function ConservationPlan({ data, analysis }) {
  if (!analysis) return null;

  const conservation = analysis.conservation_plan;
  if (!conservation) return null;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold">Conservation Recovery Plan</h3>
            <p className="text-xs text-muted-foreground">Steps to offset and recover from deforestation</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-primary/5 rounded-xl p-5 text-center">
            <TreePine className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-heading font-bold text-primary break-words">
              {data?.trees_to_replant?.toLocaleString() || "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Trees to Replant</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-5 text-center">
            <Timer className="h-6 w-6 text-chart-3 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-heading font-bold text-chart-3 break-words">
              {data?.years_to_recover || "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Years to Recover</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 text-center">
            <DollarSign className="h-6 w-6 text-chart-2 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-heading font-bold text-chart-2 break-words">
              {conservation.cost_estimate || "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Est. Cost</p>
          </div>
        </div>

        {conservation.description && (
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground/80 leading-relaxed">{conservation.description}</p>
          </div>
        )}

        {conservation.steps && (
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-semibold text-foreground">Recovery Steps</h4>
            {conservation.steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {conservation.effectiveness_timeline && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-4">Recovery Timeline</h4>
            <div className="space-y-3">
              {conservation.effectiveness_timeline.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">{item.period}</span>
                    <span className="font-semibold text-foreground">{item.recovery_percent}%</span>
                  </div>
                  <Progress value={item.recovery_percent} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Cost Note - Outside the main card */}
      {analysis.cost_note && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Cost Note:</strong> {analysis.cost_note}
          </p>
        </motion.div>
      )}
    </div>
  );
}