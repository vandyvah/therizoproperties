import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, AlertTriangle, CheckCircle, Info, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AreaData {
  name: string;
  riskLevel: "low" | "medium" | "high";
  drainageQuality: "excellent" | "good" | "poor";
  historicalIncidents: number;
  lastMajorFlood: string | null;
  notes: string;
  recommendation: string;
}

const lagosFloodData: Record<string, AreaData> = {
  "ikoyi": {
    name: "Ikoyi",
    riskLevel: "low",
    drainageQuality: "excellent",
    historicalIncidents: 2,
    lastMajorFlood: "2017",
    notes: "Well-maintained drainage infrastructure. Elevated terrain.",
    recommendation: "Safe for investment. Premium area with minimal flood history.",
  },
  "vi": {
    name: "Victoria Island",
    riskLevel: "medium",
    drainageQuality: "good",
    historicalIncidents: 8,
    lastMajorFlood: "2022",
    notes: "Coastal area with occasional flooding during heavy rains. Bar Beach Road most affected.",
    recommendation: "Invest in elevated properties. Avoid ground floors near Bar Beach.",
  },
  "lekki-phase1": {
    name: "Lekki Phase 1",
    riskLevel: "low",
    drainageQuality: "excellent",
    historicalIncidents: 3,
    lastMajorFlood: "2019",
    notes: "Modern drainage systems. Well-planned estate infrastructure.",
    recommendation: "Excellent investment area. Low flood risk with good infrastructure.",
  },
  "ajah": {
    name: "Ajah",
    riskLevel: "high",
    drainageQuality: "poor",
    historicalIncidents: 15,
    lastMajorFlood: "2023",
    notes: "Low-lying area with inadequate drainage. Regular flooding during rainy season.",
    recommendation: "Exercise caution. Prioritize elevated plots. Avoid properties near drainage channels.",
  },
  "yaba": {
    name: "Yaba",
    riskLevel: "medium",
    drainageQuality: "good",
    historicalIncidents: 6,
    lastMajorFlood: "2021",
    notes: "Mixed terrain. Some areas flood-prone near railway and market areas.",
    recommendation: "Focus on elevated areas like Sabo and Herbert Macaulay corridors.",
  },
  "banana-island": {
    name: "Banana Island",
    riskLevel: "low",
    drainageQuality: "excellent",
    historicalIncidents: 0,
    lastMajorFlood: null,
    notes: "Purpose-built island with world-class drainage. No recorded flood incidents.",
    recommendation: "Ultra-premium location. Zero flood risk. Best-in-class infrastructure.",
  },
  "ikeja-gra": {
    name: "Ikeja GRA",
    riskLevel: "low",
    drainageQuality: "good",
    historicalIncidents: 4,
    lastMajorFlood: "2020",
    notes: "Government Reserved Area with maintained infrastructure. Some pockets affected during extreme weather.",
    recommendation: "Safe investment. Focus on properties with compound drainage.",
  },
  "surulere": {
    name: "Surulere",
    riskLevel: "medium",
    drainageQuality: "poor",
    historicalIncidents: 12,
    lastMajorFlood: "2022",
    notes: "Older infrastructure. Stadium area and Bode Thomas particularly vulnerable.",
    recommendation: "Invest in well-maintained estates with private drainage. Avoid low-lying streets.",
  },
};

const riskColors = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const drainageColors = {
  excellent: "text-green-600",
  good: "text-amber-600",
  poor: "text-red-600",
};

const RiskIcon = ({ level }: { level: "low" | "medium" | "high" }) => {
  if (level === "low") return <CheckCircle className="w-5 h-5 text-green-600" />;
  if (level === "medium") return <Info className="w-5 h-5 text-amber-600" />;
  return <AlertTriangle className="w-5 h-5 text-red-600" />;
};

export const FloodMappingOverlay = () => {
  const [selectedArea, setSelectedArea] = useState<string>("ikoyi");
  const data = lagosFloodData[selectedArea];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg">
          <Droplets className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-ink">
            Lagos Flood Risk Mapping
          </h3>
          <p className="text-sm text-slate">
            Historical flood data & drainage quality by area
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-2 block">Select Area</label>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="bg-navy text-ivory border-0 h-12 w-full md:w-64">
            <MapPin className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-warm-white border-sand">
            {Object.entries(lagosFloodData).map(([key, area]) => (
              <SelectItem key={key} value={key}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Risk Level Card */}
          <Card className={`p-5 border-l-4 ${data.riskLevel === "low" ? "border-l-green-500" : data.riskLevel === "medium" ? "border-l-amber-500" : "border-l-red-500"}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-ink">{data.name}</h4>
              <Badge className={riskColors[data.riskLevel]}>
                {data.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate">Flood Risk Level</span>
                <div className="flex items-center gap-2">
                  <RiskIcon level={data.riskLevel} />
                  <span className="font-medium text-ink capitalize">{data.riskLevel}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate">Drainage Quality</span>
                <span className={`font-medium capitalize ${drainageColors[data.drainageQuality]}`}>
                  {data.drainageQuality}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-sm text-slate flex items-center gap-1">
                      Historical Incidents <Info className="w-3 h-3" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-navy text-ivory border-0">
                      <p className="text-xs">Major flood events recorded in past 10 years</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium text-ink">{data.historicalIncidents}</span>
              </div>

              {data.lastMajorFlood && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate">Last Major Flood</span>
                  <span className="font-medium text-ink">{data.lastMajorFlood}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Notes & Recommendation */}
          <div className="space-y-4">
            <Card className="p-4 bg-warm-white border border-sand">
              <h5 className="text-sm font-semibold text-ink mb-2">Area Notes</h5>
              <p className="text-sm text-slate">{data.notes}</p>
            </Card>

            <Card className="p-4 bg-gold/5 border border-gold/20">
              <h5 className="text-sm font-semibold text-gold mb-2">Investment Recommendation</h5>
              <p className="text-sm text-ink">{data.recommendation}</p>
            </Card>
          </div>
        </div>
      )}

      <div className="bg-navy/5 rounded-lg p-4">
        <p className="text-xs text-slate">
          <strong className="text-ink">Data Source:</strong> Historical flood records (2014-2024), Lagos State Drainage Infrastructure reports, 
          and Therizo on-ground assessments. For property-specific flood risk analysis, contact our team.
        </p>
      </div>
    </div>
  );
};
