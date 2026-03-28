import { motion } from "framer-motion";
import { Bug, Leaf, Heart, Lightbulb, DollarSign, Clock, Zap, AlertTriangle, Users } from "lucide-react";

const effectivenessColor = (e) => {
  if (e >= 80) return "text-green-600 bg-green-50";
  if (e >= 60) return "text-yellow-600 bg-amber-50";
  return "text-red-600 bg-red-50";
};

export default function BiodiversityPanel({ ecosystem, humanHealthImpact }) {
  if (!ecosystem) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-5"
    >
      {/* Ecosystem Overview */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Bug className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold">Biodiversity & Ecosystem Impact</h3>
            <p className="text-xs text-muted-foreground">Effects on local fauna and flora</p>
          </div>
        </div>

        {ecosystem.biodiversity_overview && (
          <p className="text-sm text-foreground/80 leading-relaxed mb-5 bg-purple-50/50 border border-purple-100 rounded-lg p-4">
            {ecosystem.biodiversity_overview}
          </p>
        )}

        {ecosystem.region_info && (
          <p className="text-xs text-muted-foreground mb-5 bg-slate-50 border border-slate-200 rounded-lg p-3 italic">
            <strong>Region:</strong> {ecosystem.region_info}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Animal Impacts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <Bug className="h-4 w-4 text-orange-500" />
              </div>
              <h4 className="text-sm font-semibold">Animal Impacts</h4>
            </div>
            <ul className="space-y-2">
              {ecosystem.animal_impacts?.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2 leading-relaxed">
                  <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plant Impacts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-green-50 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <h4 className="text-sm font-semibold">Plant Impacts</h4>
            </div>
            <ul className="space-y-2">
              {ecosystem.plant_impacts?.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2 leading-relaxed">
                  <span className="text-green-500 mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Human Health Impact - Expanded Section */}
      {humanHealthImpact && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">Human Health & Communities</h3>
              <p className="text-xs text-muted-foreground">Impact on local populations and their wellbeing</p>
            </div>
          </div>
          <div className="space-y-2">
            {typeof humanHealthImpact === 'string' && humanHealthImpact.includes('\n') ? (
              humanHealthImpact.split('\n').filter(line => line.trim()).map((item, i) => (
                <div key={i} className="text-xs text-muted-foreground flex gap-2 leading-relaxed">
                  <span className="text-red-400 mt-0.5 shrink-0">•</span>
                  <span>{item.replace(/^\*\*/, '').replace(/\*\*$/, '').trim()}</span>
                </div>
              ))
            ) : (
              <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {typeof humanHealthImpact === 'string' ? humanHealthImpact.replace(/\*\*/g, '') : humanHealthImpact}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Endangered Species */}
      {ecosystem.endangered_species?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">Endangered Species at Risk</h3>
              <p className="text-xs text-muted-foreground">Species that may face extinction from this deforestation</p>
            </div>
          </div>
          <div className="space-y-4">
            {ecosystem.endangered_species.map((sp, i) => (
              <div key={i} className="border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-semibold">{sp.common_name}</h4>
                    <p className="text-xs text-muted-foreground italic">{sp.scientific_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sp.iucn_status?.toLowerCase().includes('critically') ? 'bg-red-100 text-red-700' :
                      sp.iucn_status?.toLowerCase().includes('endangered') ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{sp.iucn_status}</span>
                    {sp.population_estimate && (
                      <span className="text-[10px] text-muted-foreground">{sp.population_estimate}</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{sp.why_at_risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solutions */}
      {ecosystem.solutions?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">Possible Solutions</h3>
              <p className="text-xs text-muted-foreground">Estimated cost, time, and effectiveness — with real trade-offs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ecosystem.solutions.map((sol, i) => (
              <div key={i} className="border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
                <h4 className="text-sm font-semibold mb-1">{sol.name}</h4>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{sol.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-xs bg-secondary px-2.5 py-1 rounded-full">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    {sol.cost}
                  </span>
                  <span className="flex items-center gap-1 text-xs bg-secondary px-2.5 py-1 rounded-full">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {sol.time}
                  </span>
                  <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${effectivenessColor(sol.effectiveness_percent)}`}>
                    <Zap className="h-3 w-3" />
                    {sol.effectiveness_percent}% effective
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}