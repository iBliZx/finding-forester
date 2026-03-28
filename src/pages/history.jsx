import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TreePine, MapPin, Calendar, Trash2, ChevronRight, Cloud, Heart } from "lucide-react";
import { Button } from "../component/ui/button";
import moment from "moment";
import { loadAssessmentsFromCookie, saveAssessmentsToCookie } from "../lib/utils";

export default function History() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

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

  const handleDelete = async (id) => {
    const updated = assessments.filter((a) => a.id !== id);
    setAssessments(updated);
    saveAssessmentsToCookie(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const riskColors = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-1">Assessment History</h1>
        <p className="text-sm text-muted-foreground mb-8">
          All your past forest ecological assessments
        </p>
      </motion.div>

      {assessments.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <TreePine className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-heading text-lg font-semibold mb-1">No History</h3>
          <p className="text-sm text-muted-foreground">Your assessments will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a, i) => {
            const expanded = expandedId === a.id;
            let analysis = null;
            if (a.analysis_json) {
              try { analysis = JSON.parse(a.analysis_json); } catch {}
            }

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : a.id)}
                  className="w-full text-left p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <TreePine className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{a.area_name || "Unnamed Area"}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {a.area_hectares} ha
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {moment(a.created_date).fromNow()}
                      </span>
                      {a.soil_erosion_risk && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${riskColors[a.soil_erosion_risk] || ""}`}>
                          {a.soil_erosion_risk}
                        </span>
                      )}
                      {a.has_cities && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                          🏙️ Urban area
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-heading font-semibold text-foreground">
                      {a.estimated_trees?.toLocaleString() || "—"} trees
                    </span>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-4">
                      {/* Quick Metrics Summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Trees at Risk:</span>
                          <p className="font-semibold">{a.estimated_trees?.toLocaleString() || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CO₂ Impact:</span>
                          <p className="font-semibold">{a.co2_stored_tons?.toLocaleString() || "—"} t</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recovery:</span>
                          <p className="font-semibold">{a.years_to_recover || "—"} years</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Forest Type:</span>
                          <p className="font-semibold">{a.forest_type || "—"}</p>
                        </div>
                      </div>

                      {/* Assessment Summary Paragraph */}
                      {analysis?.original_response && (
                        <>
                          {(() => {
                            try {
                              const parsed = JSON.parse(analysis.original_response);
                              return (
                                <>
                                  {/* Urban Warning */}
                                  {a.has_cities && a.cities_detected?.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                      <p className="text-xs text-amber-900 font-medium">⚠️ Urban Area: {a.cities_detected.join(", ")}</p>
                                      <p className="text-xs text-amber-700 mt-1">{a.accuracy_note}</p>
                                    </div>
                                  )}

                                  {parsed.summary && !a.has_cities && a.accuracy_note && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                      <p className="text-xs text-orange-700"><strong>Note:</strong> {a.accuracy_note}</p>
                                    </div>
                                  )}

                                  {parsed.summary && (
                                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">{parsed.summary}</p>
                                    </div>
                                  )}
                                  
                                  {parsed.human_health_impact && (
                                    <div className="bg-card border border-border rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="h-6 w-6 rounded-lg bg-red-50 flex items-center justify-center">
                                          <Heart className="h-4 w-4 text-red-500" />
                                        </div>
                                        <p className="text-xs font-semibold text-foreground">Human Health Impact</p>
                                      </div>
                                      <div className="space-y-1 ml-1">
                                        {typeof parsed.human_health_impact === 'string' && parsed.human_health_impact.includes('\n') ? (
                                          parsed.human_health_impact.split('\n').filter(line => line.trim()).map((item, idx) => (
                                            <div key={idx} className="text-xs text-foreground/75 flex gap-2">
                                              <span className="text-red-400 shrink-0">•</span>
                                              <span>{item.replace(/^\*\*/, '').replace(/\*\*$/, '').trim()}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-xs text-foreground/75 leading-relaxed">
                                            {String(parsed.human_health_impact).replace(/\*\*/g, '')}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {parsed.climate_future_impact && (
                                    <div className="bg-card border border-border rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                          <Cloud className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <p className="text-xs font-semibold text-foreground">Climate Change & Future Impact</p>
                                      </div>
                                      <p className="text-xs text-foreground/75 leading-relaxed ml-1">{parsed.climate_future_impact}</p>
                                    </div>
                                  )}
                                </>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                        </>
                      )}
                    </div>

                    <div className="px-4 pb-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(a.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}