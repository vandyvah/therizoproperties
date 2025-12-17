import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, X, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface SavedCalculation {
  id: string;
  name: string;
  location: string;
  strategy: string;
  totalInvestment: number;
  annualLongTermIncome: number;
  roiLongTerm: number;
  nightsBooked: number;
  annualAirbnbIncome: number;
  roiAirbnb: number;
  annualCombinedIncome: number;
  roiCombined: number;
  createdAt: Date;
}

interface PropertyComparisonProps {
  savedCalculations: SavedCalculation[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatShortCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₦${(value / 1000).toFixed(0)}K`;
  }
  return `₦${value}`;
};

export function PropertyComparison({
  savedCalculations,
  onRemove,
  onClearAll,
}: PropertyComparisonProps) {
  const { toast } = useToast();

  if (savedCalculations.length === 0) {
    return (
      <div className="bg-warm-white rounded-lg border border-sand p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-sand/50 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-7 h-7 text-slate" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink mb-2">
          No Properties Saved
        </h3>
        <p className="text-slate text-sm max-w-md mx-auto">
          Calculate an ROI above and click "Save to Compare" to add properties to your comparison list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">
          Saved Comparisons ({savedCalculations.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-slate hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-4 min-w-max pb-2">
          {savedCalculations.map((calc) => (
            <Card
              key={calc.id}
              className="w-72 flex-shrink-0 bg-warm-white border-sand relative group"
            >
              <button
                onClick={() => onRemove(calc.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-sand/50 text-slate hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-5 space-y-4">
                {/* Header */}
                <div>
                  <h4 className="font-display font-bold text-ink truncate pr-6">
                    {calc.name}
                  </h4>
                  <p className="text-xs text-slate">{calc.location}</p>
                </div>

                {/* Investment */}
                <div className="border-t border-sand pt-3">
                  <span className="text-xs text-slate block mb-1">Total Investment</span>
                  <span className="font-semibold text-ink text-sm">
                    {formatShortCurrency(calc.totalInvestment)}
                  </span>
                </div>

                {/* Long-Term ROI */}
                <div className="bg-gold/10 rounded-lg p-3">
                  <span className="text-xs text-slate block mb-1">Long-Term ROI</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-gold">
                      {calc.roiLongTerm.toFixed(2)}%
                    </span>
                    <span className="text-xs text-slate">
                      ({formatShortCurrency(calc.annualLongTermIncome)}/yr)
                    </span>
                  </div>
                </div>

                {/* Airbnb ROI */}
                <div className="bg-navy/5 rounded-lg p-3">
                  <span className="text-xs text-slate block mb-1">Airbnb ROI</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-navy">
                      {calc.roiAirbnb.toFixed(2)}%
                    </span>
                    <span className="text-xs text-slate">
                      ({formatShortCurrency(calc.annualAirbnbIncome)}/yr)
                    </span>
                  </div>
                </div>

                {/* Best Strategy Badge */}
                <div className="flex justify-center">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      calc.roiAirbnb > calc.roiLongTerm
                        ? "bg-navy text-white"
                        : "bg-gold text-navy"
                    }`}
                  >
                    Best: {calc.roiAirbnb > calc.roiLongTerm ? "Airbnb" : "Long-Term"} (
                    {Math.max(calc.roiAirbnb, calc.roiLongTerm).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Table */}
      {savedCalculations.length > 1 && (
        <div className="bg-warm-white rounded-lg border border-sand overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand/30">
                  <th className="text-left p-3 font-medium text-ink">Property</th>
                  <th className="text-right p-3 font-medium text-ink">Investment</th>
                  <th className="text-right p-3 font-medium text-ink">LT ROI</th>
                  <th className="text-right p-3 font-medium text-ink">Airbnb ROI</th>
                  <th className="text-right p-3 font-medium text-ink">Best Option</th>
                </tr>
              </thead>
              <tbody>
                {savedCalculations.map((calc, idx) => {
                  const bestROI = Math.max(calc.roiLongTerm, calc.roiAirbnb);
                  const bestStrategy = calc.roiAirbnb > calc.roiLongTerm ? "Airbnb" : "Long-Term";
                  return (
                    <tr key={calc.id} className={idx % 2 === 0 ? "bg-white" : "bg-sand/10"}>
                      <td className="p-3 font-medium text-ink">{calc.name}</td>
                      <td className="p-3 text-right text-slate">
                        {formatShortCurrency(calc.totalInvestment)}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-gold font-semibold">
                          {calc.roiLongTerm.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-navy font-semibold">
                          {calc.roiAirbnb.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            bestStrategy === "Airbnb"
                              ? "bg-navy/10 text-navy"
                              : "bg-gold/20 text-amber-700"
                          }`}
                        >
                          {bestStrategy} ({bestROI.toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
