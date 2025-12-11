import { useState, useMemo, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Download, AlertCircle, Calculator, Globe, Droplets, Building2 } from "lucide-react";
import { DiasporaMortgageCalculator } from "@/components/calculator/DiasporaMortgageCalculator";
import { FloodMappingOverlay } from "@/components/calculator/FloodMappingOverlay";
import { InfrastructureTimeline } from "@/components/calculator/InfrastructureTimeline";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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

type Strategy = "long-term" | "airbnb" | "compare";

interface FormData {
  strategy: Strategy;
  purchasePrice: string;
  renovationCosts: string;
  monthlyRent: string;
  airbnbNightlyRate: string;
  airbnbOccupancy: string;
}

interface FormErrors {
  purchasePrice?: string;
  renovationCosts?: string;
  monthlyRent?: string;
  airbnbNightlyRate?: string;
  airbnbOccupancy?: string;
}

interface Results {
  totalInvestment: number;
  grossAnnualIncome: number;
  annualExpenses: number;
  netAnnualIncome: number;
  capRate: number;
  cashOnCash: number;
  paybackPeriod: number;
}

// Validation schema
const calculatorSchema = z.object({
  purchasePrice: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num > 0;
  }, "Purchase price must be greater than 0"),
  renovationCosts: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num >= 0;
  }, "Renovation costs must be 0 or greater"),
  monthlyRent: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num >= 0;
  }, "Monthly rent must be 0 or greater"),
  airbnbNightlyRate: z.string().refine(val => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num >= 0;
  }, "Nightly rate must be 0 or greater"),
  airbnbOccupancy: z.string().refine(val => {
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
  
  const [formData, setFormData] = useState<FormData>({
    strategy: "long-term",
    purchasePrice: "85000000",
    renovationCosts: "5000000",
    monthlyRent: "600000",
    airbnbNightlyRate: "75000",
    airbnbOccupancy: "55",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleTabChange = () => {
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Allow only numbers and commas
    const sanitizedValue = value.replace(/[^0-9,]/g, "");
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

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

  const parseNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, "")) || 0;
  };

  // Calculate results in real-time
  const { longTermResults, airbnbResults, hasValidInputs } = useMemo(() => {
    const purchasePrice = parseNumber(formData.purchasePrice);
    const renovationCosts = parseNumber(formData.renovationCosts);
    const monthlyRent = parseNumber(formData.monthlyRent);
    const airbnbNightlyRate = parseNumber(formData.airbnbNightlyRate);
    const airbnbOccupancy = parseNumber(formData.airbnbOccupancy) / 100;

    const hasValidInputs = purchasePrice > 0;
    const totalInvestment = purchasePrice + renovationCosts;
    const managementFee = 0.1; // 10%
    const annualExpenseBase = totalInvestment * 0.02; // 2% of total for taxes/insurance/maintenance

    // Long-term rental calculation
    const ltGrossAnnualIncome = monthlyRent * 12;
    const ltManagementCost = ltGrossAnnualIncome * managementFee;
    const ltAnnualExpenses = annualExpenseBase + ltManagementCost;
    const ltNetAnnualIncome = ltGrossAnnualIncome - ltAnnualExpenses;
    const ltCapRate = purchasePrice > 0 ? (ltNetAnnualIncome / purchasePrice) * 100 : 0;
    const ltCashOnCash = totalInvestment > 0 ? (ltNetAnnualIncome / totalInvestment) * 100 : 0;
    const ltPaybackPeriod = ltNetAnnualIncome > 0 ? totalInvestment / ltNetAnnualIncome : 0;

    const longTermResults: Results = {
      totalInvestment,
      grossAnnualIncome: ltGrossAnnualIncome,
      annualExpenses: ltAnnualExpenses,
      netAnnualIncome: ltNetAnnualIncome,
      capRate: ltCapRate,
      cashOnCash: ltCashOnCash,
      paybackPeriod: ltPaybackPeriod,
    };

    // Airbnb calculation
    const abGrossAnnualIncome = airbnbNightlyRate * 365 * airbnbOccupancy;
    const abManagementCost = abGrossAnnualIncome * managementFee;
    const abAnnualExpenses = annualExpenseBase + abManagementCost;
    const abNetAnnualIncome = abGrossAnnualIncome - abAnnualExpenses;
    const abCapRate = purchasePrice > 0 ? (abNetAnnualIncome / purchasePrice) * 100 : 0;
    const abCashOnCash = totalInvestment > 0 ? (abNetAnnualIncome / totalInvestment) * 100 : 0;
    const abPaybackPeriod = abNetAnnualIncome > 0 ? totalInvestment / abNetAnnualIncome : 0;

    const airbnbResults: Results = {
      totalInvestment,
      grossAnnualIncome: abGrossAnnualIncome,
      annualExpenses: abAnnualExpenses,
      netAnnualIncome: abNetAnnualIncome,
      capRate: abCapRate,
      cashOnCash: abCashOnCash,
      paybackPeriod: abPaybackPeriod,
    };

    return { longTermResults, airbnbResults, hasValidInputs };
  }, [formData]);

  // Chart data
  const chartData = useMemo(() => {
    return [
      {
        name: "Long Term",
        Income: longTermResults.netAnnualIncome,
        Expenses: longTermResults.annualExpenses,
      },
      {
        name: "Airbnb",
        Income: airbnbResults.netAnnualIncome,
        Expenses: airbnbResults.annualExpenses,
      },
    ];
  }, [longTermResults, airbnbResults]);

  const currentResults = formData.strategy === "airbnb" ? airbnbResults : longTermResults;
  const projectionTitle = formData.strategy === "airbnb" ? "Airbnb Projection" : "Long-Term Projection";

  const generatePDF = () => {
    if (!validateAll()) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(26, 38, 52); // Navy
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Therizo ROI Report", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
    
    // Investment Details Section
    doc.setTextColor(26, 38, 52);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Investment Details", 20, 60);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    
    let y = 75;
    const leftCol = 20;
    const rightCol = 120;
    
    doc.text("Property Purchase Price:", leftCol, y);
    doc.text(formatCurrency(parseNumber(formData.purchasePrice)), rightCol, y);
    y += 10;
    
    doc.text("Renovation & Fit-Out:", leftCol, y);
    doc.text(formatCurrency(parseNumber(formData.renovationCosts)), rightCol, y);
    y += 10;
    
    doc.text("Total Investment:", leftCol, y);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(currentResults.totalInvestment), rightCol, y);
    doc.setFont("helvetica", "normal");
    y += 20;
    
    // Results Section
    doc.setTextColor(26, 38, 52);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(projectionTitle, 20, y);
    y += 15;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    
    doc.text("Gross Annual Income:", leftCol, y);
    doc.text(formatCurrency(currentResults.grossAnnualIncome), rightCol, y);
    y += 10;
    
    doc.text("Annual Expenses:", leftCol, y);
    doc.text(formatCurrency(currentResults.annualExpenses), rightCol, y);
    y += 10;
    
    doc.text("Net Annual Income:", leftCol, y);
    doc.setTextColor(180, 145, 60); // Gold
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(currentResults.netAnnualIncome), rightCol, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    y += 15;
    
    // Key Metrics Box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(leftCol - 5, y, pageWidth - 35, 40, 3, 3, 'F');
    y += 12;
    
    doc.setTextColor(26, 38, 52);
    doc.setFontSize(12);
    doc.text("Cap Rate:", leftCol, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${currentResults.capRate.toFixed(2)}%`, leftCol + 50, y);
    doc.setFont("helvetica", "normal");
    
    doc.text("Cash-on-Cash:", rightCol - 20, y);
    doc.setTextColor(180, 145, 60);
    doc.setFont("helvetica", "bold");
    doc.text(`${currentResults.cashOnCash.toFixed(1)}%`, rightCol + 45, y);
    doc.setFont("helvetica", "normal");
    y += 15;
    
    doc.setTextColor(26, 38, 52);
    doc.text("Payback Period:", leftCol, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${currentResults.paybackPeriod.toFixed(1)} Years`, leftCol + 50, y);
    y += 30;
    
    // Disclaimer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "italic");
    const disclaimer = "Disclaimer: These figures are projections based on the numbers entered. They are not financial advice or a guarantee of returns. Market conditions, regulation, and unforeseen costs can change outcomes.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 40);
    doc.text(splitDisclaimer, leftCol, y);
    
    // Footer
    doc.setFillColor(180, 145, 60); // Gold
    doc.rect(0, 280, pageWidth, 17, 'F');
    doc.setTextColor(26, 38, 52);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Therizo Property & Development Corporation", pageWidth / 2, 290, { align: "center" });
    
    // Save
    doc.save("therizo-roi-report.pdf");
    
    toast({
      title: "PDF Generated",
      description: "Your ROI report has been downloaded successfully.",
    });
  };

  const InputField = ({ 
    id, 
    label, 
    value, 
    onChange, 
    placeholder,
    goldLabel = false 
  }: { 
    id: keyof FormData; 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    placeholder?: string;
    goldLabel?: boolean;
  }) => (
    <div>
      <Label 
        htmlFor={id} 
        className={`text-sm mb-2 block ${goldLabel ? 'text-gold' : 'font-medium text-foreground'}`}
      >
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => handleBlur(id)}
        placeholder={placeholder}
        className={`bg-primary text-primary-foreground border-0 h-12 text-base placeholder:text-primary-foreground/50 ${
          errors[id as keyof FormErrors] && touched[id] ? 'ring-2 ring-destructive' : ''
        }`}
      />
      {errors[id as keyof FormErrors] && touched[id] && (
        <div className="flex items-center gap-1.5 mt-1.5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errors[id as keyof FormErrors]}</span>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      {/* Header */}
      <section className="pt-28 pb-12 bg-background">
        <div className="container-wide text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Therizo ROI Calculator
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Before you commit capital, run the numbers. Estimate your potential returns in
            Nigerian Naira (₦) for both long-term rental and Airbnb strategies.
          </p>
        </div>
      </section>

      {/* Calculator Tools Tabs */}
      <section className="pb-16 bg-background" ref={contentRef}>
        <div className="container-wide">
          <Tabs defaultValue="roi" className="space-y-8" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
              <TabsTrigger 
                value="roi" 
                className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy bg-card border border-border py-3"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">ROI Calculator</span>
                <span className="sm:hidden">ROI</span>
              </TabsTrigger>
              <TabsTrigger 
                value="diaspora" 
                className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy bg-card border border-border py-3"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Diaspora Mortgage</span>
                <span className="sm:hidden">Mortgage</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flood" 
                className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy bg-card border border-border py-3"
              >
                <Droplets className="w-4 h-4" />
                <span className="hidden sm:inline">Flood Mapping</span>
                <span className="sm:hidden">Flood</span>
              </TabsTrigger>
              <TabsTrigger 
                value="infrastructure" 
                className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-navy bg-card border border-border py-3"
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
                <Label className="text-sm font-medium text-foreground mb-3 block">
                  Strategy
                </Label>
                <div className="inline-flex rounded-lg border border-border overflow-hidden">
                  {[
                    { value: "long-term", label: "Long Term" },
                    { value: "airbnb", label: "Airbnb" },
                    { value: "compare", label: "Compare" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange("strategy", option.value as Strategy)}
                      className={`px-4 sm:px-6 py-2.5 text-sm font-medium transition-all border-r border-border last:border-r-0 ${
                        formData.strategy === option.value
                          ? "bg-gold text-navy"
                          : "bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Purchase Price */}
              <InputField
                id="purchasePrice"
                label="Property Purchase Price (₦)"
                value={formData.purchasePrice}
                onChange={(value) => handleInputChange("purchasePrice", value)}
              />

              {/* Renovation */}
              <InputField
                id="renovationCosts"
                label="Renovation & Fit-Out (₦)"
                value={formData.renovationCosts}
                onChange={(value) => handleInputChange("renovationCosts", value)}
              />

              {/* Income Assumptions */}
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Income Assumptions
                </h3>
                <div className="space-y-4">
                  <InputField
                    id="monthlyRent"
                    label="Monthly Rent (Long Term)"
                    value={formData.monthlyRent}
                    onChange={(value) => handleInputChange("monthlyRent", value)}
                    goldLabel
                  />
                  <InputField
                    id="airbnbNightlyRate"
                    label="Nightly Rate (Airbnb)"
                    value={formData.airbnbNightlyRate}
                    onChange={(value) => handleInputChange("airbnbNightlyRate", value)}
                    goldLabel
                  />
                  <InputField
                    id="airbnbOccupancy"
                    label="Occupancy Rate (%)"
                    value={formData.airbnbOccupancy}
                    onChange={(value) => handleInputChange("airbnbOccupancy", value)}
                    goldLabel
                  />
                </div>
              </div>

              {/* Download PDF Button */}
              <Button 
                onClick={generatePDF}
                variant="outline"
                size="lg"
                className="w-full"
                disabled={!hasValidInputs}
              >
                <Download className="mr-2" size={18} />
                Download PDF Report
              </Button>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {/* Projection Card */}
              <div className="border-l-4 border-gold bg-card rounded-r-lg p-6 shadow-sm">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">
                  {projectionTitle}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gold text-sm">Total Investment</span>
                    <span className="font-semibold text-foreground text-lg">
                      {formatCurrency(currentResults.totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gold text-sm">Net Annual Income</span>
                    <span className="font-bold text-gold text-lg">
                      {formatCurrency(currentResults.netAnnualIncome)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex justify-between items-end">
                    <span className="font-display text-lg font-semibold text-foreground">
                      Cash-on-Cash
                    </span>
                    <span className="font-display text-3xl sm:text-4xl font-bold text-gold">
                      {currentResults.cashOnCash.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-sm text-muted-foreground">
                      Payback: {currentResults.paybackPeriod.toFixed(1)} Years
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <h4 className="font-display text-base font-semibold text-foreground mb-4">
                  Annual Net Income vs Expenses
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
                        width={60}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
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
                        dataKey="Expenses" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        name="Expenses"
                      />
                      <Bar 
                        dataKey="Income" 
                        fill="hsl(var(--gold))" 
                        radius={[4, 4, 0, 0]}
                        name="Income"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Compare View - Additional Card */}
              {formData.strategy === "compare" && (
                <div className="border-l-4 border-primary bg-card rounded-r-lg p-6 shadow-sm">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">
                    Airbnb Projection
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Total Investment</span>
                      <span className="font-semibold text-foreground text-lg">
                        {formatCurrency(airbnbResults.totalInvestment)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Net Annual Income</span>
                      <span className="font-bold text-gold text-lg">
                        {formatCurrency(airbnbResults.netAnnualIncome)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex justify-between items-end">
                      <span className="font-display text-lg font-semibold text-foreground">
                        Cash-on-Cash
                      </span>
                      <span className="font-display text-3xl sm:text-4xl font-bold text-gold">
                        {airbnbResults.cashOnCash.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-sm text-muted-foreground">
                        Payback: {airbnbResults.paybackPeriod.toFixed(1)} Years
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
            </TabsContent>

            {/* Diaspora Mortgage Tab */}
            <TabsContent value="diaspora" className="mt-0">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <DiasporaMortgageCalculator />
              </div>
            </TabsContent>

            {/* Flood Mapping Tab */}
            <TabsContent value="flood" className="mt-0">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <FloodMappingOverlay />
              </div>
            </TabsContent>

            {/* Infrastructure Timeline Tab */}
            <TabsContent value="infrastructure" className="mt-0">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <InfrastructureTimeline />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-primary">
        <div className="container-narrow text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Discuss These Numbers with Therizo
          </h2>
          <p className="text-base sm:text-lg text-primary-foreground/80 leading-relaxed mb-8 max-w-2xl mx-auto">
            Share your results with us and we will match you with properties
            that fit your risk tolerance, budget, and target returns.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-gold to-gold-light text-navy font-semibold px-8 py-6 text-base hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link to="/contact">
              <Send size={18} className="mr-2" />
              Send My ROI to a Senior Consultant
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Calculator_Page;
