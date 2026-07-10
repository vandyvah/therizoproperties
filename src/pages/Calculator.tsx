import { useState, useMemo, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Download, AlertCircle, Calculator, Globe, Droplets, Building2, Loader2, RotateCcw, Info, MapPin, Plus, BarChart3 } from "lucide-react";
import { DiasporaMortgageCalculator } from "@/components/calculator/DiasporaMortgageCalculator";
import { FloodMappingOverlay } from "@/components/calculator/FloodMappingOverlay";
import { InfrastructureTimeline } from "@/components/calculator/InfrastructureTimeline";
import { PropertyComparison, SavedCalculation } from "@/components/calculator/PropertyComparison";
import { ROIInputField } from "@/components/calculator/ROIInputField";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDebounce, formatWithSeparators, parseFormattedNumber } from "@/hooks/useDebounce";
import { jsPDF } from "jspdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { z } from "zod";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createFAQSchema } from "@/components/seo/JsonLd";

const calculatorFAQs = [
  { question: "How accurate are the ROI calculations?", answer: "Our calculations show gross ROI based on the numbers you enter. Actual returns depend on market conditions, expenses, and occupancy rates." },
  { question: "What is gross ROI?", answer: "Gross ROI is your annual income divided by total investment, before deducting taxes, repairs, management fees, and other operating expenses." },
];

const LOCATIONS = [
  "Lagos - Ikoyi",
  "Lagos - Victoria Island",
  "Lagos - Lekki Phase 1",
  "Lagos - Lekki Phase 2",
  "Lagos - Ajah",
  "Lagos - Banana Island",
  "Abuja - Maitama",
  "Abuja - Asokoro",
  "Abuja - Wuse",
  "Abuja - Jabi",
  "Port Harcourt",
  "Ibadan",
  "Ogun State",
  "Other",
];

type Strategy = "long-term" | "airbnb" | "compare";

interface FormData {
  strategy: Strategy;
  location: string;
  purchasePrice: string;
  renovationCost: string;
  annualRent: string;
  nightlyRate: string;
  occupancyRate: string;
}

interface FormErrors {
  purchasePrice?: string;
  renovationCost?: string;
  annualRent?: string;
  nightlyRate?: string;
  occupancyRate?: string;
}

// Validation schema
const calculatorSchema = z.object({
  purchasePrice: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num > 0;
  }, "Purchase price must be greater than 0"),
  renovationCost: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num >= 0;
  }, "Renovation cost must be 0 or greater"),
  annualRent: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num >= 0;
  }, "Annual rent must be 0 or greater"),
  nightlyRate: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num >= 0;
  }, "Nightly rate must be 0 or greater"),
  occupancyRate: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num >= 0 && num <= 100;
  }, "Occupancy must be between 0 and 100"),
});

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

const Calculator_Page = () => {
  const { toast } = useToast();
  const contentRef = useRef<HTMLElement>(null);
  
  // Default example values as specified
  const initialFormData: FormData = {
    strategy: "compare",
    location: "Lagos - Lekki Phase 1",
    purchasePrice: "60,000,000",
    renovationCost: "10,000,000",
    annualRent: "600,000",
    nightlyRate: "150,000",
    occupancyRate: "65",
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const debouncedFormData = useDebounce(formData, 250);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [propertyName, setPropertyName] = useState("");

  const handleTabChange = () => {
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Handle input change - store RAW value while typing (no formatting)
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    if (field === "strategy") {
      setFormData((prev) => ({ ...prev, [field]: value as Strategy }));
      return;
    }
    
    if (field === "location") {
      setFormData((prev) => ({ ...prev, [field]: value }));
      return;
    }
    
    // For occupancy, only allow digits and clamp to 0-100
    if (field === "occupancyRate") {
      const sanitizedValue = value.replace(/[^0-9]/g, "");
      const numValue = parseInt(sanitizedValue) || 0;
      const clampedValue = Math.min(numValue, 100).toString();
      setFormData((prev) => ({ ...prev, [field]: sanitizedValue ? clampedValue : "" }));
    } else {
      // For currency fields: allow only digits and commas, don't reformat while typing
      const sanitizedValue = value.replace(/[^0-9,]/g, "");
      setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
    }
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Handle blur - format value and validate
  const handleFieldBlur = useCallback((field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Format currency fields on blur
    if (field !== "strategy" && field !== "location" && field !== "occupancyRate") {
      setFormData(prev => ({
        ...prev,
        [field]: formatWithSeparators(prev[field])
      }));
    }
    
    validateField(field);
  }, []);

  const validateField = (field: keyof FormData) => {
    try {
      const schema = calculatorSchema.shape[field as keyof typeof calculatorSchema.shape];
      if (schema) {
        schema.parse(formData[field]);
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };

  const validateAll = (): boolean => {
    try {
      calculatorSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof FormErrors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form before proceeding.",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Calculate results using debounced data - CORRECT FORMULAS
  const results = useMemo(() => {
    const purchasePrice = parseFormattedNumber(debouncedFormData.purchasePrice);
    const renovationCost = parseFormattedNumber(debouncedFormData.renovationCost);
    const annualRent = parseFormattedNumber(debouncedFormData.annualRent);
    const nightlyRate = parseFormattedNumber(debouncedFormData.nightlyRate);
    const occupancyRate = parseFormattedNumber(debouncedFormData.occupancyRate);

    // 1) Total Investment
    const totalInvestment = purchasePrice + renovationCost;

    // 2) Long-Term Rental Annual Income
    const annualLongTermIncome = annualRent * 12;

    // 3) Gross ROI (Long-Term)
    const roiLongTerm = totalInvestment > 0 ? (annualLongTermIncome / totalInvestment) * 100 : 0;

    // 4) Airbnb Nights Booked
    const nightsBooked = 365 * (occupancyRate / 100);

    // 5) Airbnb Annual Income
    const annualAirbnbIncome = nightsBooked * nightlyRate;

    // 6) Gross ROI (Airbnb)
    const roiAirbnb = totalInvestment > 0 ? (annualAirbnbIncome / totalInvestment) * 100 : 0;

    // 7) Combined Annual Income + ROI
    const annualCombinedIncome = annualLongTermIncome + annualAirbnbIncome;
    const roiCombined = totalInvestment > 0 ? (annualCombinedIncome / totalInvestment) * 100 : 0;

    const hasValidInputs = purchasePrice > 0;

    return {
      totalInvestment,
      annualLongTermIncome,
      roiLongTerm,
      nightsBooked,
      annualAirbnbIncome,
      roiAirbnb,
      annualCombinedIncome,
      roiCombined,
      hasValidInputs,
    };
  }, [debouncedFormData]);

  // Chart data
  const chartData = useMemo(() => {
    return [
      {
        name: "Long-Term",
        "Annual Income": results.annualLongTermIncome,
        "Gross ROI %": results.roiLongTerm,
      },
      {
        name: "Airbnb",
        "Annual Income": results.annualAirbnbIncome,
        "Gross ROI %": results.roiAirbnb,
      },
    ];
  }, [results]);

  const handleCalculate = useCallback(async () => {
    if (!validateAll()) return;
    
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setHasCalculated(true);
    setIsCalculating(false);
    
    toast({
      title: "Calculation Complete",
      description: "Your gross ROI projections are ready.",
    });
  }, [toast]);

  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setHasCalculated(false);
    setPropertyName("");
    toast({
      title: "Calculator Reset",
      description: "All inputs have been reset to defaults.",
    });
  }, [toast]);

  const handleSaveToCompare = useCallback(() => {
    if (!results.hasValidInputs || !hasCalculated) return;
    
    const name = propertyName.trim() || `Property ${savedCalculations.length + 1}`;
    
    const newCalculation: SavedCalculation = {
      id: crypto.randomUUID(),
      name,
      location: formData.location,
      strategy: formData.strategy,
      totalInvestment: results.totalInvestment,
      annualLongTermIncome: results.annualLongTermIncome,
      roiLongTerm: results.roiLongTerm,
      nightsBooked: results.nightsBooked,
      annualAirbnbIncome: results.annualAirbnbIncome,
      roiAirbnb: results.roiAirbnb,
      annualCombinedIncome: results.annualCombinedIncome,
      roiCombined: results.roiCombined,
      createdAt: new Date(),
    };

    setSavedCalculations(prev => [...prev, newCalculation]);
    setPropertyName("");
    
    toast({
      title: "Property Saved",
      description: `"${name}" has been added to your comparison list.`,
    });
  }, [results, hasCalculated, propertyName, formData, savedCalculations.length, toast]);

  const handleRemoveFromCompare = useCallback((id: string) => {
    setSavedCalculations(prev => prev.filter(calc => calc.id !== id));
    toast({
      title: "Removed",
      description: "Property removed from comparison.",
    });
  }, [toast]);

  const handleClearAllComparisons = useCallback(() => {
    setSavedCalculations([]);
    toast({
      title: "Cleared",
      description: "All saved comparisons have been removed.",
    });
  }, [toast]);

  const generatePDF = () => {
    if (!validateAll()) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header with enhanced branding
    doc.setFillColor(8, 26, 47); // Navy
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Gold accent line
    doc.setFillColor(199, 168, 106); // Gold
    doc.rect(0, 55, pageWidth, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("THERIZO", 20, 25);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(199, 168, 106); // Gold
    doc.text("Property & Development Corporation", 20, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`ROI Analysis Report  •  ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 48);
    
    // Property Location Badge
    doc.setFillColor(199, 168, 106);
    doc.roundedRect(pageWidth - 80, 15, 60, 25, 2, 2, 'F');
    doc.setTextColor(8, 26, 47);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("LOCATION", pageWidth - 50, 24, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const locationText = formData.location.length > 15 ? formData.location.substring(0, 14) + "..." : formData.location;
    doc.text(locationText, pageWidth - 50, 33, { align: "center" });
    
    // Investment Details Section
    let y = 75;
    const leftCol = 20;
    const rightCol = 130;
    
    doc.setFillColor(247, 243, 234); // Ivory background
    doc.roundedRect(15, y - 10, pageWidth - 30, 55, 3, 3, 'F');
    
    doc.setTextColor(8, 26, 47);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Investment Summary", leftCol, y);
    y += 15;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    
    doc.text("Property Location:", leftCol, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 26, 47);
    doc.text(formData.location, rightCol, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Purchase Price:", leftCol, y);
    doc.text(formatCurrency(parseFormattedNumber(formData.purchasePrice)), rightCol, y);
    y += 10;
    
    doc.text("Renovation & Fit-Out:", leftCol, y);
    doc.text(formatCurrency(parseFormattedNumber(formData.renovationCost)), rightCol, y);
    y += 10;
    
    doc.text("Total Investment:", leftCol, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(199, 168, 106);
    doc.text(formatCurrency(results.totalInvestment), rightCol, y);
    y += 25;
    
    // Long-Term Results
    doc.setTextColor(8, 26, 47);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Long-Term Rental", 20, y);
    y += 12;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Annual Income:", leftCol, y);
    doc.text(formatCurrency(results.annualLongTermIncome), rightCol, y);
    y += 8;
    doc.text("Gross ROI:", leftCol, y);
    doc.setTextColor(199, 168, 106); // Gold
    doc.setFont("helvetica", "bold");
    doc.text(`${results.roiLongTerm.toFixed(2)}%`, rightCol, y);
    y += 15;
    
    // Airbnb Results
    doc.setTextColor(8, 26, 47);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Airbnb", 20, y);
    y += 12;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Nights Booked/Year:", leftCol, y);
    doc.text(`${results.nightsBooked.toFixed(0)} nights`, rightCol, y);
    y += 8;
    doc.text("Annual Income:", leftCol, y);
    doc.text(formatCurrency(results.annualAirbnbIncome), rightCol, y);
    y += 8;
    doc.text("Gross ROI:", leftCol, y);
    doc.setTextColor(199, 168, 106);
    doc.setFont("helvetica", "bold");
    doc.text(`${results.roiAirbnb.toFixed(2)}%`, rightCol, y);
    y += 15;
    
    // Combined Results
    doc.setTextColor(8, 26, 47);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Combined Strategy", 20, y);
    y += 12;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Total Annual Income:", leftCol, y);
    doc.text(formatCurrency(results.annualCombinedIncome), rightCol, y);
    y += 8;
    doc.text("Gross ROI:", leftCol, y);
    doc.setTextColor(199, 168, 106);
    doc.setFont("helvetica", "bold");
    doc.text(`${results.roiCombined.toFixed(2)}%`, rightCol, y);
    y += 20;
    
    // Disclaimer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "italic");
    const disclaimer = "Disclaimer: This is gross ROI (before taxes, vacancy beyond occupancy estimate, repairs, management fees, and FX risk). Use it to compare scenarios. Actual returns depend on market conditions and operating expenses.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 40);
    doc.text(splitDisclaimer, leftCol, y);
    
    // Footer with enhanced branding
    doc.setFillColor(8, 26, 47); // Navy
    doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
    
    // Gold accent on footer
    doc.setFillColor(199, 168, 106);
    doc.rect(0, pageHeight - 25, pageWidth, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Therizo Property & Development Corporation", pageWidth / 2, pageHeight - 14, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(199, 168, 106);
    doc.text("therizoproperties.com  •  +234 803 483 0087", pageWidth / 2, pageHeight - 6, { align: "center" });
    
    doc.save(`therizo-roi-report-${formData.location.replace(/\s/g, '-').toLowerCase()}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Your ROI report has been downloaded successfully.",
    });
  };

  // InputField component moved to src/components/calculator/ROIInputField.tsx

  return (
    <Layout>
      <SEOHead
        title="Nigerian Property ROI Calculator | Rental Yield & Investment Returns"
        description="Free ROI calculator for Nigerian real estate. Calculate rental yields and gross returns for Lagos, Abuja property investments. Compare long-term vs Airbnb strategies."
        canonicalUrl="/calculator"
        keywords="Nigerian property ROI calculator, Lagos rental yield calculator, Abuja real estate investment returns, property investment Nigeria, Airbnb vs rental income Nigeria"
        ogImage="https://therizoproperties.com/og/og-calculator.jpg"
      />
      <JsonLd data={createFAQSchema(calculatorFAQs)} />
      
      {/* Header */}
      <section className="pt-28 pb-12 bg-ivory">
        <div className="container-wide text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-navy mb-4">
            Therizo ROI Calculator
          </h1>
          <p className="text-base sm:text-lg text-slate max-w-3xl mx-auto leading-relaxed">
            Before you commit capital, run the numbers. Estimate your potential gross returns in
            Nigerian Naira (₦) for both long-term rental and Airbnb strategies.
          </p>
        </div>
      </section>

      {/* Calculator Tools Tabs */}
      <section className="pb-16 bg-ivory" ref={contentRef}>
        <div className="container-wide">
          <Tabs defaultValue="roi" className="space-y-8" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
              <TabsTrigger 
                value="roi" 
                className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy bg-warm-white border border-sand text-ink py-3"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">ROI Calculator</span>
                <span className="sm:hidden">ROI</span>
              </TabsTrigger>
              <TabsTrigger 
                value="diaspora" 
                className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy bg-warm-white border border-sand text-ink py-3"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Diaspora Mortgage</span>
                <span className="sm:hidden">Mortgage</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flood" 
                className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy bg-warm-white border border-sand text-ink py-3"
              >
                <Droplets className="w-4 h-4" />
                <span className="hidden sm:inline">Flood Mapping</span>
                <span className="sm:hidden">Flood</span>
              </TabsTrigger>
              <TabsTrigger 
                value="infrastructure" 
                className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy bg-warm-white border border-sand text-ink py-3"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Infrastructure</span>
                <span className="sm:hidden">Projects</span>
              </TabsTrigger>
            </TabsList>

            {/* ROI Calculator Tab */}
            <TabsContent value="roi" className="mt-0">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column - Form */}
                <div className="space-y-8">
                  {/* Strategy Toggle */}
                  <div>
                    <Label className="text-sm font-medium text-ink mb-3 block">
                      Strategy
                    </Label>
                    <div className="inline-flex rounded-lg border border-sand overflow-hidden">
                      {[
                        { value: "long-term", label: "Long Term" },
                        { value: "airbnb", label: "Airbnb" },
                        { value: "compare", label: "Compare Both" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange("strategy", option.value as Strategy)}
                          className={`px-4 sm:px-6 py-2.5 text-sm font-medium transition-all border-r border-sand last:border-r-0 ${
                            formData.strategy === option.value
                              ? "bg-gold text-navy"
                              : "bg-warm-white text-ink hover:bg-sand/30"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property Location */}
                  <div>
                    <Label className="text-sm font-medium text-ink mb-2 block">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Property Location
                    </Label>
                    <Select 
                      value={formData.location} 
                      onValueChange={(value) => handleInputChange("location", value)}
                    >
                      <SelectTrigger className="bg-navy text-ivory border-0 h-12">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="bg-navy border-navy/50">
                        {LOCATIONS.map((loc) => (
                          <SelectItem 
                            key={loc} 
                            value={loc}
                            className="text-ivory hover:bg-gold/20 focus:bg-gold/20 focus:text-ivory"
                          >
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Purchase Price */}
                  <ROIInputField
                    id="purchasePrice"
                    label="Property Purchase Price (₦)"
                    value={formData.purchasePrice}
                    onChange={(value) => handleInputChange("purchasePrice", value)}
                    onBlur={() => handleFieldBlur("purchasePrice")}
                    placeholder="60,000,000"
                    error={errors.purchasePrice}
                    touched={touched.purchasePrice}
                  />

                  {/* Renovation */}
                  <ROIInputField
                    id="renovationCost"
                    label="Renovation & Fit-Out (₦)"
                    value={formData.renovationCost}
                    onChange={(value) => handleInputChange("renovationCost", value)}
                    onBlur={() => handleFieldBlur("renovationCost")}
                    placeholder="10,000,000"
                    error={errors.renovationCost}
                    touched={touched.renovationCost}
                  />

                  {/* Income Assumptions */}
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink mb-4">
                      Income Assumptions
                    </h3>
                    <div className="space-y-4">
                      <ROIInputField
                        id="annualRent"
                        label="Long-Term Monthly Rent (₦/month)"
                        value={formData.annualRent}
                        onChange={(value) => handleInputChange("annualRent", value)}
                        onBlur={() => handleFieldBlur("annualRent")}
                        placeholder="600,000"
                        goldLabel
                        error={errors.annualRent}
                        touched={touched.annualRent}
                      />
                      <ROIInputField
                        id="nightlyRate"
                        label="Airbnb Nightly Rate (₦/night)"
                        value={formData.nightlyRate}
                        onChange={(value) => handleInputChange("nightlyRate", value)}
                        onBlur={() => handleFieldBlur("nightlyRate")}
                        placeholder="150,000"
                        goldLabel
                        error={errors.nightlyRate}
                        touched={touched.nightlyRate}
                      />
                      <ROIInputField
                        id="occupancyRate"
                        label="Airbnb Occupancy Rate (%)"
                        value={formData.occupancyRate}
                        onChange={(value) => handleInputChange("occupancyRate", value)}
                        onBlur={() => handleFieldBlur("occupancyRate")}
                        placeholder="65"
                        goldLabel
                        error={errors.occupancyRate}
                        touched={touched.occupancyRate}
                      />
                      <p className="text-xs text-slate">Days per year: 365 (fixed)</p>
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <Button 
                    onClick={handleCalculate}
                    size="lg"
                    className={`w-full relative overflow-hidden bg-gradient-to-r from-gold via-amber-400 to-gold text-navy font-bold text-base tracking-wide shadow-lg shadow-gold/40 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 hover:scale-[1.02] ${
                      results.hasValidInputs && !isCalculating && !hasCalculated ? 'animate-pulse' : ''
                    }`}
                    disabled={!results.hasValidInputs || isCalculating}
                  >
                    <span className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none" />
                    {isCalculating ? (
                      <span className="relative z-10 flex items-center justify-center">
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Calculating...
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center">
                        <Calculator className="mr-2" size={20} />
                        Calculate
                      </span>
                    )}
                  </Button>

                  {/* Download PDF Button */}
                  <Button 
                    onClick={generatePDF}
                    variant="outline"
                    size="lg"
                    className="w-full border-sand text-ink hover:bg-sand/30"
                    disabled={!results.hasValidInputs || !hasCalculated}
                  >
                    <Download className="mr-2" size={18} />
                    Download PDF Report
                  </Button>

                  {/* Reset Button */}
                  <Button 
                    onClick={handleReset}
                    variant="ghost"
                    size="lg"
                    className="w-full text-slate hover:text-ink"
                  >
                    <RotateCcw className="mr-2" size={18} />
                    Reset Calculator
                  </Button>
                </div>

                {/* Right Column - Results */}
                <div className="space-y-6">
                  {!hasCalculated ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-warm-white rounded-lg border border-sand p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-sand/50 flex items-center justify-center mb-4">
                        <Calculator className="w-8 h-8 text-slate" />
                      </div>
                      <h3 className="font-display text-xl font-semibold text-ink mb-2">
                        Ready to Calculate
                      </h3>
                      <p className="text-slate max-w-sm">
                        Enter your investment details and click "Calculate" to see your gross ROI projections.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Result Cards */}
                      <div className={`grid gap-4 animate-fade-in ${formData.strategy === "compare" ? "md:grid-cols-2" : ""}`}>
                        
                        {/* Long-Term Rental Card */}
                        {(formData.strategy === "long-term" || formData.strategy === "compare") && (
                          <div className="border-l-4 border-gold bg-warm-white rounded-r-lg p-5 shadow-sm">
                            <h3 className="font-display text-lg font-bold text-ink mb-4">
                              Long-Term Rental
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-slate text-sm">Total Investment</span>
                                <span className="font-semibold text-ink">
                                  {formatCurrency(results.totalInvestment)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate text-sm">Annual Income</span>
                                <span className="font-semibold text-ink">
                                  {formatCurrency(results.annualLongTermIncome)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-sand">
                                <span className="font-display font-semibold text-ink">Gross ROI</span>
                                <span className="font-display text-2xl font-bold text-gold">
                                  {results.roiLongTerm.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Airbnb Card */}
                        {(formData.strategy === "airbnb" || formData.strategy === "compare") && (
                          <div className="border-l-4 border-navy bg-warm-white rounded-r-lg p-5 shadow-sm">
                            <h3 className="font-display text-lg font-bold text-ink mb-4">
                              Airbnb
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-slate text-sm">Nights Booked/Year</span>
                                <span className="font-semibold text-ink">
                                  {results.nightsBooked.toFixed(0)} nights
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate text-sm">Annual Income</span>
                                <span className="font-semibold text-ink">
                                  {formatCurrency(results.annualAirbnbIncome)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-sand">
                                <span className="font-display font-semibold text-ink">Gross ROI</span>
                                <span className="font-display text-2xl font-bold text-gold">
                                  {results.roiAirbnb.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Combined Strategy Card */}
                      {formData.strategy === "compare" && (
                        <div className="border-2 border-gold bg-gradient-to-r from-gold/5 to-transparent rounded-lg p-5 shadow-sm animate-fade-in">
                          <h3 className="font-display text-lg font-bold text-ink mb-4">
                            Combined Strategy
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-slate text-sm">Total Annual Income</span>
                              <span className="font-semibold text-ink">
                                {formatCurrency(results.annualCombinedIncome)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gold/30">
                              <span className="font-display font-semibold text-ink">Gross ROI</span>
                              <span className="font-display text-3xl font-bold text-gold">
                                {results.roiCombined.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Assumptions Note */}
                      <div className="bg-muted/50 rounded-lg p-4 border border-sand animate-fade-in flex items-start gap-3">
                        <Info className="w-5 h-5 text-slate shrink-0 mt-0.5" />
                        <p className="text-sm text-slate leading-relaxed">
                          <strong>Assumptions:</strong> This is gross ROI (before taxes, vacancy beyond occupancy estimate, repairs, management fees, and FX risk). Use it to compare scenarios.
                        </p>
                      </div>

                      {/* Chart */}
                      <div className="bg-warm-white rounded-lg p-6 shadow-sm border border-sand animate-fade-in">
                        <h4 className="font-display text-base font-semibold text-ink mb-4">
                          Annual Income Comparison
                        </h4>
                        <div className="h-64 sm:h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barCategoryGap="20%">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                              />
                              <YAxis 
                                tickFormatter={(value) => formatShortCurrency(value)}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                                width={70}
                              />
                              <Tooltip 
                                formatter={(value: number, name: string) => {
                                  if (name === "Annual Income") return formatCurrency(value);
                                  return `${value.toFixed(2)}%`;
                                }}
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                              />
                              <Legend 
                                wrapperStyle={{ paddingTop: '16px' }}
                                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                              />
                              <Bar 
                                dataKey="Annual Income" 
                                fill="hsl(var(--gold))" 
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Save to Compare Section */}
                      <div className="bg-warm-white rounded-lg p-5 border border-sand animate-fade-in">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Input
                            type="text"
                            value={propertyName}
                            onChange={(e) => setPropertyName(e.target.value)}
                            placeholder="Name this property (optional)"
                            className="flex-1 bg-ivory border-sand h-11"
                          />
                          <Button
                            onClick={handleSaveToCompare}
                            className="bg-navy text-ivory hover:bg-navy/90 h-11 px-6"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Save to Compare
                          </Button>
                        </div>
                        {savedCalculations.length > 0 && (
                          <p className="text-xs text-slate mt-2">
                            {savedCalculations.length} {savedCalculations.length === 1 ? 'property' : 'properties'} saved for comparison
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Property Comparison Section */}
              <div className="mt-12 pt-8 border-t border-sand">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">
                      Property Comparison
                    </h3>
                    <p className="text-sm text-slate">
                      Compare multiple properties side by side
                    </p>
                  </div>
                </div>
                <PropertyComparison
                  savedCalculations={savedCalculations}
                  onRemove={handleRemoveFromCompare}
                  onClearAll={handleClearAllComparisons}
                />
              </div>
            </TabsContent>

            {/* Diaspora Mortgage Tab */}
            <TabsContent value="diaspora" className="mt-0">
              <div className="bg-warm-white rounded-lg p-6 shadow-sm border border-sand">
                <DiasporaMortgageCalculator />
              </div>
            </TabsContent>

            {/* Flood Mapping Tab */}
            <TabsContent value="flood" className="mt-0">
              <div className="bg-warm-white rounded-lg p-6 shadow-sm border border-sand">
                <FloodMappingOverlay />
              </div>
            </TabsContent>

            {/* Infrastructure Tab */}
            <TabsContent value="infrastructure" className="mt-0">
              <div className="bg-warm-white rounded-lg p-6 shadow-sm border border-sand">
                <InfrastructureTimeline />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-navy text-ivory">
        <div className="container-narrow text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
            Ready to Invest?
          </h2>
          <p className="text-ivory/80 mb-8 max-w-2xl mx-auto">
            Share your ROI results with our team and let us help you find properties
            that match your investment goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="gold" asChild>
              <Link to="/contact">
                <Send className="mr-2" size={18} />
                Contact Our Team
              </Link>
            </Button>
            <Button size="lg" variant="hero-outline" asChild>
              <Link to="/properties">
                View Properties
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Calculator_Page;
