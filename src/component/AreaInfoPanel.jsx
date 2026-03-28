import { motion } from "framer-motion";
import { MapPin, Ruler, TreePine } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function AreaInfoPanel({
  areaData,
  areaName,
  setAreaName,
  forestType,
  setForestType,
  onAnalyze,
  isLoading,
}) {
  if (!areaData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <h3 className="font-heading text-base font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        Selected Area
      </h3>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Area Name</label>
          <Input
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder="e.g. Amazon Sector A3"
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Forest Type</label>
          <Select value={forestType} onValueChange={setForestType}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto_detect">Auto-detect from Location</SelectItem>
              <SelectItem value="tropical_rainforest">Tropical Rainforest</SelectItem>
              <SelectItem value="temperate_forest">Temperate Forest</SelectItem>
              <SelectItem value="boreal_forest">Boreal / Taiga</SelectItem>
              <SelectItem value="mangrove">Mangrove</SelectItem>
              <SelectItem value="dry_forest">Dry Tropical Forest</SelectItem>
              <SelectItem value="cloud_forest">Cloud Forest</SelectItem>
              <SelectItem value="mixed_forest">Mixed Forest</SelectItem>
              <SelectItem value="coniferous_forest">Coniferous Forest</SelectItem>
              <SelectItem value="deciduous_forest">Deciduous Forest</SelectItem>
              <SelectItem value="evergreen_forest">Evergreen Forest</SelectItem>
              <SelectItem value="savanna_woodland">Savanna Woodland</SelectItem>
              <SelectItem value="montane_forest">Montane Forest</SelectItem>
              <SelectItem value="riparian_forest">Riparian Forest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Ruler className="h-3.5 w-3.5" />
          <span>{areaData.areaHectares} ha</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {areaData.center[0].toFixed(4)}, {areaData.center[1].toFixed(4)}
          </span>
        </div>
      </div>

      <Button
        onClick={onAnalyze}
        disabled={isLoading || !areaName || !forestType}
        className="w-full gap-2"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <TreePine className="h-4 w-4" />
            Analyze Ecological Impact
          </>
        )}
      </Button>
    </motion.div>
  );
}