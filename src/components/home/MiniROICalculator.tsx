import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, ArrowRight, TrendingUp } from "lucide-react";
import { useDebounce, formatWithSeparators, parseFormattedNumber } from "@/hooks/useDebounce";

type Strategy = "long-term" | "airbnb" | "combined";

interface MiniFormData {
  strategy: Strategy;
  purchasePrice: string;
  renovationCost: string;
  annualRent: string;
  nightlyRate: string;
  occupancyRate: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function MiniROICalculator() {
  const [formData, setFormData] = useState<MiniFormData>({
    strategy: "long-term",
    purchasePrice: "",
    renovationCost: "",
    annualRent: "",
    nightlyRate: "",
    occupancyRate: "",
  });
  const [showResults, setShowResults] = useState(false);
  
  const debouncedFormData = useDebounce(formData, 250);

  const handleInputChange = (field: keyof MiniFormData, value: string) => {
    if (field === "strategy") {
      setFormData(prev => ({ ...prev, [field]: value as Strategy }));
      setShowResults(false);
      return;
    }
    
    if (field === "occupancyRate") {
      const sanitized = value.replace(/[^0-9]/g, "");
      const clamped = sanitized ? Math.min(parseInt(sanitized), 100).toString() : "";
      setFormData(prev => ({ ...prev, [field]: clamped }));
    } else {
      setFormData(prev => ({ ...prev, [field]: formatWithSeparators(value) }));
    }
    setShowResults(false);
  };

  const results = useMemo(() => {
    const purchasePrice = parseFormattedNumber(debouncedFormData.purchasePrice);
    const renovationCost = parseFormattedNumber(debouncedFormData.renovationCost);
    const annualRent = parseFormattedNumber(debouncedFormData.annualRent);
    const nightlyRate = parseFormattedNumber(debouncedFormData.nightlyRate);
    const occupancyRate = parseFormattedNumber(debouncedFormData.occupancyRate);

    const totalInvestment = purchasePrice + renovationCost;
    
    // Long-term calculations
    const annualLongTermIncome = annualRent * 12;
    const roiLongTerm = totalInvestment > 0 ? (annualLongTermIncome / totalInvestment) * 100 : 0;
    
    // Airbnb calculations
    const nightsBooked = 365 * (occupancyRate / 100);
    const annualAirbnbIncome = nightsBooked * nightlyRate;
    const roiAirbnb = totalInvestment > 0 ? (annualAirbnbIncome / totalInvestment) * 100 : 0;
    
    // Combined calculations
    const annualCombinedIncome = annualLongTermIncome + annualAirbnbIncome;
    const roiCombined = totalInvestment > 0 ? (annualCombinedIncome / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      annualLongTermIncome,
      roiLongTerm,
      nightsBooked,
      annualAirbnbIncome,
      roiAirbnb,
      annualCombinedIncome,
      roiCombined,
    };
  }, [debouncedFormData]);

  const getDisplayResults = () => {
    const { strategy } = formData;
    if (strategy === "long-term") {
      return {
        annualIncome: results.annualLongTermIncome,
        roi: results.roiLongTerm,
      };
    } else if (strategy === "airbnb") {
      return {
        annualIncome: results.annualAirbnbIncome,
        roi: results.roiAirbnb,
      };
    } else {
      return {
        annualIncome: results.annualCombinedIncome,
        roi: results.roiCombined,
      };
    }
  };

  const isValidForCalculation = () => {
    const purchasePrice = parseFormattedNumber(formData.purchasePrice);
    if (purchasePrice <= 0) return false;
    
    if (formData.strategy === "long-term") {
      return parseFormattedNumber(formData.annualRent) > 0;
    } else if (formData.strategy === "airbnb") {
      return parseFormattedNumber(formData.nightlyRate) > 0 && parseFormattedNumber(formData.occupancyRate) > 0;
    } else {
      return (
        parseFormattedNumber(formData.annualRent) > 0 ||
        (parseFormattedNumber(formData.nightlyRate) > 0 && parseFormattedNumber(formData.occupancyRate) > 0)
      );
    }
  };

  const handleGenerate = () => {
    if (isValidForCalculation()) {
      setShowResults(true);
    }
  };

  const displayResults = getDisplayResults();

  return (
    <div className="bg-navy/80 backdrop-blur-xl rounded-xl border border-ivory/10 p-5 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
          <Calculator className="w-4 h-4 text-gold" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ivory">Quick ROI</h3>
      </div>
      
      <p className="text-ivory/60 text-xs mb-5 leading-relaxed">
        Calculate your Return on Investment when you buy or sell a property or asset from us.
      </p>

      <div className="space-y-4">
        {/* Strategy Selector */}
        <div>
          <Label className="text-ivory/70 text-xs mb-1.5 block">Strategy</Label>
          <Select value={formData.strategy} onValueChange={(val) => handleInputChange("strategy", val)}>
            <SelectTrigger className="bg-navy/60 border-ivory/20 text-ivory h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-navy border-ivory/20">
              <SelectItem value="long-term" className="text-ivory hover:bg-ivory/10">Long-Term Rental</SelectItem>
              <SelectItem value="airbnb" className="text-ivory hover:bg-ivory/10">Airbnb</SelectItem>
              <SelectItem value="combined" className="text-ivory hover:bg-ivory/10">Combined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Purchase Price */}
        <div>
          <Label className="text-ivory/70 text-xs mb-1.5 block">Purchase Price (₦)</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={formData.purchasePrice}
            onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
            placeholder="60,000,000"
            className="bg-navy/60 border-ivory/20 text-ivory h-10 placeholder:text-ivory/30"
          />
        </div>

        {/* Renovation Cost */}
        <div>
          <Label className="text-ivory/70 text-xs mb-1.5 block">Renovation/Fit-Out (₦)</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={formData.renovationCost}
            onChange={(e) => handleInputChange("renovationCost", e.target.value)}
            placeholder="10,000,000"
            className="bg-navy/60 border-ivory/20 text-ivory h-10 placeholder:text-ivory/30"
          />
        </div>

        {/* Conditional Fields Based on Strategy */}
        {(formData.strategy === "long-term" || formData.strategy === "combined") && (
          <div>
            <Label className="text-gold/90 text-xs mb-1.5 block">Monthly Rent (₦)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={formData.annualRent}
              onChange={(e) => handleInputChange("annualRent", e.target.value)}
              placeholder="600,000"
              className="bg-navy/60 border-ivory/20 text-ivory h-10 placeholder:text-ivory/30"
            />
          </div>
        )}

        {(formData.strategy === "airbnb" || formData.strategy === "combined") && (
          <>
            <div>
              <Label className="text-gold/90 text-xs mb-1.5 block">Nightly Rate (₦)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formData.nightlyRate}
                onChange={(e) => handleInputChange("nightlyRate", e.target.value)}
                placeholder="150,000"
                className="bg-navy/60 border-ivory/20 text-ivory h-10 placeholder:text-ivory/30"
              />
            </div>
            <div>
              <Label className="text-gold/90 text-xs mb-1.5 block">Occupancy Rate (%)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formData.occupancyRate}
                onChange={(e) => handleInputChange("occupancyRate", e.target.value)}
                placeholder="65"
                className="bg-navy/60 border-ivory/20 text-ivory h-10 placeholder:text-ivory/30"
              />
            </div>
          </>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!isValidForCalculation()}
          className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold h-11"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Generate ROI
        </Button>

        {/* Results */}
        {showResults && (
          <div className="bg-ivory/5 rounded-lg p-4 border border-ivory/10 animate-fade-in space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-ivory/70 text-xs">Total Investment</span>
              <span className="text-ivory font-semibold text-sm">
                {formatCurrency(results.totalInvestment)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ivory/70 text-xs">Annual Income</span>
              <span className="text-gold font-semibold text-sm">
                {formatCurrency(displayResults.annualIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-ivory/10">
              <span className="text-ivory font-medium text-sm">Gross ROI</span>
              <span className="text-gold font-bold text-xl">
                {displayResults.roi.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Link to Full Calculator */}
        <Link
          to="/calculator"
          className="flex items-center justify-center gap-2 text-gold/80 hover:text-gold text-xs font-medium transition-colors pt-2"
        >
          Open full ROI calculator
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
