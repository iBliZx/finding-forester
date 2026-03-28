import { useState, useRef, useCallback, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Polygon, useMapEvents, useMap } from "react-leaflet";
import { MapPin, Trash2, Undo2, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

function DrawHandler({ points, setPoints, isDrawing }) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    },
  });
  return null;
}

function FitPolygon({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length >= 2) {
      const lats = points.map(([lat]) => lat);
      const lngs = points.map(([, lng]) => lng);
      const southWest = L.latLng(Math.min(...lats), Math.min(...lngs));
      const northEast = L.latLng(Math.max(...lats), Math.max(...lngs));
      const bounds = L.latLngBounds(southWest, northEast);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true, duration: 1 });
    }
  }, [points, map]);
  return null;
}

function MapResetController({ resetTrigger }) {
  const map = useMap();
  useEffect(() => {
    if (resetTrigger > 0) {
      map.setView([0, 20], 3);
    }
  }, [resetTrigger, map]);
  return null;
}

function calculateAreaHectares(points) {
  if (points.length < 3) return 0;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const lat1 = toRad(points[i][0]);
    const lat2 = toRad(points[j][0]);
    const dLng = toRad(points[j][1] - points[i][1]);
    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  const calculatedArea = Math.abs((area * R * R) / 2) / 10000;
  return parseFloat(calculatedArea.toFixed(2));
}

export default function MapSelector({ onAreaSelected, selectedPoints, setSelectedPoints }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [fitPoints, setFitPoints] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Auto-fit when points are restored from localStorage or initially loaded
  useEffect(() => {
    if (selectedPoints.length >= 3 && !fitPoints && !isDrawing) {
      setFitPoints([...selectedPoints]);
    }
  }, [selectedPoints, fitPoints, isDrawing]);

  const handleReset = () => {
    setSelectedPoints([]);
    setIsDrawing(false);
    setFitPoints(null);
    setResetTrigger((prev) => prev + 1);
  };

  const handleUndo = () => {
    setSelectedPoints((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setSelectedPoints([]);
    setIsDrawing(false);
  };

  const handleFinish = () => {
    if (selectedPoints.length >= 3) {
      setIsDrawing(false);
      const area = calculateAreaHectares(selectedPoints);
      const center = selectedPoints.reduce(
        (acc, p) => [acc[0] + p[0] / selectedPoints.length, acc[1] + p[1] / selectedPoints.length],
        [0, 0]
      );
      onAreaSelected({ points: selectedPoints, areaHectares: area, center });
      setFitPoints([...selectedPoints]);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-border shadow-sm bg-card">
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        {!isDrawing ? (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setSelectedPoints([]);
                setIsDrawing(true);
              }}
              className="shadow-lg gap-2"
              size="sm"
            >
              <MapPin className="h-4 w-4" />
              Draw Area
            </Button>
            {selectedPoints.length > 0 && (
              <Button
                onClick={handleReset}
                variant="secondary"
                size="sm"
                className="shadow-lg gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset Map
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button onClick={handleFinish} disabled={selectedPoints.length < 3} size="sm" className="shadow-lg">
              Finish ({selectedPoints.length} pts)
            </Button>
            <Button onClick={handleUndo} variant="secondary" size="sm" className="shadow-lg gap-1">
              <Undo2 className="h-3 w-3" /> Undo
            </Button>
            <Button onClick={handleClear} variant="destructive" size="sm" className="shadow-lg gap-1">
              <Trash2 className="h-3 w-3" /> Clear
            </Button>
          </div>
        )}
      </div>

      {isDrawing && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
          <p className="text-xs font-medium text-foreground">Click on the map to mark forest boundary points</p>
        </div>
      )}

      <div className="h-[450px] sm:h-[550px]">
        <MapContainer
          center={[0, 20]}
          zoom={3}
          className="h-full w-full"
          style={{ borderRadius: "0.75rem" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DrawHandler points={selectedPoints} setPoints={setSelectedPoints} isDrawing={isDrawing} />
          <MapResetController resetTrigger={resetTrigger} />
          {fitPoints && <FitPolygon points={fitPoints} />}
          {selectedPoints.length >= 3 && (
            <Polygon
              positions={selectedPoints}
              pathOptions={{
                color: "hsl(152, 55%, 28%)",
                fillColor: "hsl(152, 55%, 28%)",
                fillOpacity: 0.25,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}