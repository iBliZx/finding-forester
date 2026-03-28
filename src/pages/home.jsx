import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Leaf as LeafIcon, Cloud } from "lucide-react";
import MapSelector from "../component/MapSelector";
import AreaInfoPanel from "../component/AreaInfoPanel";
import ConservationPlan from "../component/ConservationPlan";
import ComparisonChart from "../component/ComparisonChart";
import BiodiversityPanel from "../component/BiodiversityPanel";
import { useToast } from "../component/ui/use-toast";
import { loadAssessmentsFromCookie, saveAssessmentsToCookie } from "../lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home() {
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [areaData, setAreaData] = useState(null);
  const [areaName, setAreaName] = useState("");
  const [forestType, setForestType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const resultsRef = useRef(null);
  const { toast } = useToast();

  const GEMINI_API_KEY = "INSERT_KEY_HERE"; // Replace with yoru current Gemini API key or set via environment variable for better security. Instructions in README. Do NOT commit your actual API key to version control.
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  // Load saved selection on mount
  useEffect(() => {
    const savedSelection = localStorage.getItem("finding_forester_selection");
    if (savedSelection) {
      try {
        const { areaData: savedAreaData, areaName: savedAreaName, forestType: savedForestType } = JSON.parse(savedSelection);
        if (savedAreaData) {
          setAreaData(savedAreaData);
          // Restore the map points from saved area data
          if (savedAreaData.points) {
            setSelectedPoints(savedAreaData.points);
          }
        }
        if (savedAreaName) {
          setAreaName(savedAreaName);
        }
        if (savedForestType) {
          setForestType(savedForestType);
        }
      } catch (e) {
        console.error("Failed to load saved selection:", e);
      }
    }
  }, []);

  // Save selection whenever it changes
  useEffect(() => {
    if (areaData || areaName || forestType) {
      localStorage.setItem("finding_forester_selection", JSON.stringify({
        areaData,
        areaName,
        forestType,
      }));
    }
  }, [areaData, areaName, forestType]);

  // Load saved results on mount
  useEffect(() => {
    const savedResults = localStorage.getItem("finding_forester_results");
    if (savedResults) {
      try {
        const { result: savedResult, analysis: savedAnalysis } = JSON.parse(savedResults);
        if (savedResult) setResult(savedResult);
        if (savedAnalysis) setAnalysis(savedAnalysis);
      } catch (e) {
        console.error("Failed to load saved results:", e);
      }
    }
  }, []);

  // Save results whenever they change
  useEffect(() => {
    if (result && analysis) {
      localStorage.setItem("finding_forester_results", JSON.stringify({
        result,
        analysis,
      }));
    }
  }, [result, analysis]);

  const isOceanLocation = async (lat, lng) => {
    try {
      // Use OpenStreetMap Nominatim for reliable reverse geocoding
      const osmResp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { "User-Agent": "FindingForester/1.0" },
      });
      
      if (osmResp.ok) {
        const osmData = await osmResp.json();
        const category = osmData?.class?.toLowerCase();
        const type = osmData?.type?.toLowerCase();

        // Check if it's water
        if (category === "water" || category === "natural") {
          if (type && (type.includes("ocean") || type.includes("sea") || type.includes("bay") || 
                       type.includes("strait") || type.includes("gulf") || type.includes("water"))) {
            return true;
          }
        }

        // If we have address info with country/state, it's land
        if (osmData?.address) {
          if (osmData.address.country || osmData.address.state || osmData.address.county || osmData.address.city) {
            return false;
          }
        }
      }

      // Also try BigDataCloud as fallback
      try {
        const bdcResp = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        if (bdcResp.ok) {
          const bdcData = await bdcResp.json();
          if (bdcData?.ocean) return true;
          if (bdcData?.countryName) return false;
        }
      } catch (e) {
        // Fallback method failed, continue
      }

      // Default to land if uncertain
      return false;
    } catch (error) {
      console.error("Ocean detection error:", error);
      return false;
    }
  };

  const queryGemini = async (promptText) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "INSERT_KEY_HERE") {
      throw new Error("Gemini API key is not configured.");
    }

    try {
      const result = await model.generateContent(promptText);
      const response = await result.response;
      let text = response.text();

      text = text.replace(/```json|```/gi, "").trim();
      return text;
    } catch (error) {
      console.error("Gemini SDK Error:", error);
      throw new Error(error.message || "Failed to generate AI content");
    }
  };

  const checkForCities = async (lat, lng) => {
    try {
      // Use Nominatim to check for cities/towns at this location
      const osmResp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=8`, {
        headers: { "User-Agent": "FindingForester/1.0" },
      });
      if (!osmResp.ok) return { hasCities: false, cities: [] };
      
      const osmData = await osmResp.json();
      const cities = [];
      
      // Check if current location is a city/town/village
      if (osmData?.address) {
        const { city, town, village } = osmData.address;
        if (city) cities.push(city);
        if (town) cities.push(town);
        if (village) cities.push(village);
      }
      
      return { hasCities: cities.length > 0, cities: [...new Set(cities)] };
    } catch (error) {
      console.error("City detection error:", error);
      return { hasCities: false, cities: [] };
    }
  };

  const handleAreaSelected = (data) => {
    setAreaData(data);
    setResult(null);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!areaData) return;

    setIsLoading(true);

    const lat = Number(areaData.center?.[0]);
    const lng = Number(areaData.center?.[1]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast({ title: "Invalid coordinates", description: "Selected area has invalid coordinates." });
      setIsLoading(false);
      return;
    }

    const isOcean = await isOceanLocation(lat, lng);
    if (isOcean) {
      toast({ title: "Ocean detected", description: "Selected point appears to be over ocean; choose a land region." });
      setIsLoading(false);
      return;
    }

    // Check for cities in the area
    const cityData = await checkForCities(lat, lng);

    const area = areaData.areaHectares;

    let fType = forestType;
    if (forestType === "auto_detect") {
      const locationPrompt = `Based on the coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}), determine the most likely forest type in that region. Consider nearby countries, climate, and typical vegetation. Return only the forest type as a string, e.g. "Tropical Rainforest".`;
      try {
        const detectedType = await queryGemini(locationPrompt);
        fType = detectedType.trim();
      } catch (err) {
        toast({ title: "Auto-detection failed", description: "Using generic forest type." });
        fType = "generic";
      }
    } else {
      fType = forestType.replace(/_/g, " ");
    }

    const cityWarning = cityData.hasCities 
      ? `\n\nWARNING: This area contains or is near the following cities/towns: ${cityData.cities.join(", ")}. The tree count estimates may be less accurate as urban areas have fewer/different trees than pure forest.`
      : "";

    const prompt = `
      Role: Senior field ecologist (20 years experience) with expertise in your specific region.
      Task: Analyze full deforestation of a ${fType || "generic"} area of ${area.toFixed(2)} hectares at coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}).${cityWarning}
      
      CRITICAL INSTRUCTIONS:
      1. Use the provided coordinates to research the SPECIFIC geographic region and determine the EXACT state/province/country
      2. Identify NATIVE species endemic to this specific region - research what actually lives there
      3. Focus on species that would be DIRECTLY affected by habitat loss in this location
      4. For animal/plant impacts: Describe which will be MARGINALLY affected (able to adapt/move) vs SEVERELY affected (habitat-dependent)
      5. ONLY mention extinction if the area represents a CRITICAL percentage of the species' range (e.g., >50% of habitat loss)
      6. Do NOT overstate effects - a few hundred trees replanted will NOT single-handedly revive species populations
      7. Ensure all species names and impacts are accurate and researched for THIS specific location${cityData.hasCities ? "\n8. NOTE: Urban/city areas detected in this region. Recalculate tree estimates to account for less forested urban areas. Provide stronger accuracy warning." : ""}
      
      For human health impact section:
      - Research what the LOCAL population actually depends on the forest for (water, medicine, hunting grounds, etc.)
      - Format as bullet points separated by newlines, each describing a specific health impact (water quality, air quality, medicinal plants loss, disease vector spread, etc.)
      - Be specific about which communities and what they use the forest for
      - IMPORTANT: Use format like "Impact 1\nImpact 2\nImpact 3" with each impact on a new line
      
      For cost estimate:
      - Research ACTUAL reforestation costs for this region (varies by location)
      - Include logistics of replanting in this specific terrain
      - Add professional assessment and monitoring costs
      - Format as range if estimate is for smaller areas: e.g., "$500K - $2M (NOTE: Smaller estimates less accurate)"
      
      For climate change & future impact:
      - Quantify how this deforestation contributes to regional/global climate change
      - Describe local climate feedback loops (e.g., reduced evapotranspiration → drier summers → more wildfires)
      - Explain impacts on watershed regulation, temperature extremes, and seasonal patterns
      - Discuss how loss of this forest reduces climate resilience for this region
      - Include references to tipping points or critical thresholds if applicable
      - Explain what future climate scenarios would look like (10-50 year timescale) without reforestation
      
      For environmental changes section:
      - Describe biodiversity losses: which specific animal and plant species populations will decline, habitat fragmentation effects
      - Explain water system impacts: changes to watershed function, water flow, quality, seasonal patterns
      - Detail soil degradation: erosion rates, nutrient loss, compaction, desertification risk specific to THIS location
      - Include quantified impacts where possible (e.g., "30-40% loss of endemic species habitat", "5x erosion increase")
      - Write as a cohesive paragraph, not bullet points
      
      Return ONLY raw JSON with these exact fields:
      {
        "estimated_trees": number,
        "co2_stored_tons": number,
        "co2_annual_absorption": number,
        "biodiversity_score": number (1-100),
        "water_impact_score": number (1-100),
        "soil_erosion_risk": "low" | "medium" | "high",
        "trees_to_replant": number,
        "years_to_recover": number,
        "accuracy_note": "string - include warning if area is small (e.g., <100 hectares) that estimates may be significantly less reliable. If cities detected, add warning about urban area impact on tree estimates.",
        "conservation_plan": {
          "description": "string",
          "cost_estimate": "string - just the cost value (e.g., '$500K-2M') without notes",
          "cost_note": "string - detailed note about cost accuracy and inclusions (e.g., 'This estimate covers initial reforestation, professional assessment, and long-term monitoring for an area of this immense scale. Costs can fluctuate based on specific site conditions, labor, and market rates for native seedlings.')",
          "steps": [{"title": "string", "description": "string - include region-specific native tree species to plant"}],
          "effectiveness_timeline": [{"period": "string", "recovery_percent": number}]
        },
        "comparisons": [{"label": "string", "tons": number}],
        "summary": "string",
        "environmental_changes": "string describing biodiversity losses, water system impacts, and soil degradation specific to THIS location - write as flowing paragraph with quantified impacts",
        "human_health_impact": "string with bullet point impacts separated by newlines (e.g. 'Water source contamination\\nMedicinal plant loss\\nAir quality degradation') - specific details about how THIS local population would be affected including water sources, medicinal plants, food sources, disease impacts, air quality effects specific to the region",
        "climate_future_impact": "string describing how this deforestation will accelerate climate change in this region, impacts on local climate patterns, climate resilience loss, watershed changes, and future scenarios without reforestation (10-50 year outlook)",
        "ecosystem": {
          "biodiversity_overview": "string describing what's actually at risk in this specific location",
          "animal_impacts": ["Species name (scientific) - specific impact on THIS population (marginal adaptation vs severe habitat loss)"],
          "plant_impacts": ["Species name - how deforestation affects THIS plant in this region"],
          "region_info": "string - brief note on the state/province/country and its ecological characteristics"
        }
      }
    `;

    try {
      const geminiText = await queryGemini(prompt);
      const aiData = JSON.parse(geminiText);

      const record = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        area_name: areaName || "Unnamed Area",
        area_hectares: area,
        forest_type: fType || "unknown",
        created_date: new Date().toISOString(),
        estimated_trees: aiData.estimated_trees,
        co2_stored_tons: aiData.co2_stored_tons,
        co2_annual_absorption: aiData.co2_annual_absorption,
        biodiversity_score: aiData.biodiversity_score,
        water_impact_score: aiData.water_impact_score,
        soil_erosion_risk: aiData.soil_erosion_risk,
        trees_to_replant: aiData.trees_to_replant,
        years_to_recover: aiData.years_to_recover,
        accuracy_note: aiData.accuracy_note,
        cities_detected: cityData.cities,
        has_cities: cityData.hasCities,
        analysis_json: JSON.stringify({
          conservation_plan: aiData.conservation_plan,
          comparison_chart: aiData.comparisons,
          accuracy_note: aiData.accuracy_note,
          region_info: aiData.ecosystem?.region_info,
          biodiversity_overview: aiData.ecosystem?.biodiversity_overview,
          animal_impacts: aiData.ecosystem?.animal_impacts,
          plant_impacts: aiData.ecosystem?.plant_impacts,
          human_health_impact: aiData.human_health_impact,
          environmental_changes: aiData.environmental_changes,
          climate_future_impact: aiData.climate_future_impact,
          summary: aiData.summary,
          cities_detected: cityData.cities,
          has_cities: cityData.hasCities,
          original_response: geminiText,
        }),
      };

      setResult({
        ...aiData,
        estimated_trees: record.estimated_trees,
        co2_stored_tons: record.co2_stored_tons,
        co2_annual_absorption: record.co2_annual_absorption,
        accuracy_note: aiData.accuracy_note,
        comparisons: {
          co2_comparison: aiData.comparisons,
          impact_breakdown: [
            { name: "Biodiversity", value: aiData.biodiversity_score },
            { name: "Water", value: aiData.water_impact_score },
            { name: "Soil", value: aiData.soil_erosion_risk === "high" ? 80 : 40 },
          ],
        }
      });

      setAnalysis({
        conservation_plan: aiData.conservation_plan,
        comparison_chart: "Analysis complete based on ecological data.",
        cost_note: aiData.conservation_plan?.cost_note,
      });

      const current = loadAssessmentsFromCookie();
      const updated = [record, ...current].slice(0, 100);
      saveAssessmentsToCookie(updated);
      
      // Trigger a custom event so other pages know data was updated
      window.dispatchEvent(new CustomEvent('assessmentSaved', { detail: { assessment: record } }));

    } catch (err) {
      toast({ title: "Analysis failed", description: err.message });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Header Section */}
      <div className="bg-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-4">
              <Leaf className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Hack PSU 2026</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-3">Finding Forester</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Select a forest area on the map and our AI analysis will determine the ecological impact of deforestation and provide a conservation recovery plan.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Map Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}>
              <MapSelector
                onAreaSelected={handleAreaSelected}
                selectedPoints={selectedPoints}
                setSelectedPoints={setSelectedPoints} />
            </motion.div>
          </div>

          {/* Right Panel Column */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}>
              {areaData ? (
                <AreaInfoPanel
                  areaData={areaData}
                  areaName={areaName}
                  setAreaName={setAreaName}
                  forestType={forestType}
                  setForestType={setForestType}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading} />
              ) : (
                <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <LeafIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">No Area Selected</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Click "Draw Area" on the map to start selecting a forest region for analysis.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6">

              {result.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                  <h3 className="font-heading text-lg font-semibold mb-2 text-primary">
                    Assessment Summary
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{result.summary}</p>
                  
                  {result.accuracy_note && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        ⚠️ <strong>Accuracy Note:</strong> {result.accuracy_note}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {result.environmental_changes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold">Environmental Changes</h3>
                      <p className="text-xs text-muted-foreground">Impact on biodiversity, water systems, and soil</p>
                    </div>
                  </div>
                  <div className="bg-green-50/50 border border-green-100 rounded-lg p-4">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{result.environmental_changes}</p>
                  </div>
                </motion.div>
              )}
              
              <BiodiversityPanel ecosystem={result.ecosystem} humanHealthImpact={result.human_health_impact} />
              
              {result.climate_future_impact && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Cloud className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold">Climate Change & Future Impact</h3>
                      <p className="text-xs text-muted-foreground">Long-term climate effects of deforestation</p>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{result.climate_future_impact}</p>
                  </div>
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 gap-6">
                <ConservationPlan data={result} analysis={analysis} />
                <ComparisonChart analysis={analysis} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}