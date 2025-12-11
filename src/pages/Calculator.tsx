import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { Link } from "react-router-dom";
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

type Strategy = "long-term" | "airbnb" | "compare";

interface FormData {
  strategy: Strategy;
  purchasePrice: string;
  renovationCosts: string;
  monthlyRent: string;
  airbnbNightlyRate: string;
  airbnbOccupancy: string;
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
  const [formData, setFormData] = useState<FormData>({
    strategy: "long-term",
    purchasePrice: "85000000",
    renovationCosts: "5000000",
    monthlyRent: "600000",
    airbnbNightlyRate: "75000",
    airbnbOccupancy: "55",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const parseNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, "")) || 0;
  };

  // Calculate results in real-time
  const { longTermResults, airbnbResults } = useMemo(() => {
    const purchasePrice = parseNumber(formData.purchasePrice);
    const renovationCosts = parseNumber(formData.renovationCosts);
    const monthlyRent = parseNumber(formData.monthlyRent);
    const airbnbNightlyRate = parseNumber(formData.airbnbNightlyRate);
    const airbnbOccupancy = parseNumber(formData.airbnbOccupancy) / 100;

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

    return { longTermResults, airbnbResults };
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

      {/* Calculator Main Section */}
      <section className="pb-16 bg-background">
        <div className="container-wide">
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
                      className={`px-4 sm:px-6 py-2.5 text-sm font-medium transition-all ${
                        formData.strategy === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Purchase Price */}
              <div>
                <Label htmlFor="purchasePrice" className="text-sm font-medium text-foreground mb-2 block">
                  Property Purchase Price (₦)
                </Label>
                <Input
                  id="purchasePrice"
                  type="text"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                  className="bg-primary text-primary-foreground border-0 h-12 text-base placeholder:text-primary-foreground/50"
                />
              </div>

              {/* Renovation */}
              <div>
                <Label htmlFor="renovationCosts" className="text-sm font-medium text-foreground mb-2 block">
                  Renovation & Fit-Out (₦)
                </Label>
                <Input
                  id="renovationCosts"
                  type="text"
                  value={formData.renovationCosts}
                  onChange={(e) => handleInputChange("renovationCosts", e.target.value)}
                  className="bg-primary text-primary-foreground border-0 h-12 text-base placeholder:text-primary-foreground/50"
                />
              </div>

              {/* Income Assumptions */}
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Income Assumptions
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="monthlyRent" className="text-sm text-gold mb-2 block">
                      Monthly Rent (Long Term)
                    </Label>
                    <Input
                      id="monthlyRent"
                      type="text"
                      value={formData.monthlyRent}
                      onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                      className="bg-primary text-primary-foreground border-0 h-12 text-base placeholder:text-primary-foreground/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="airbnbNightlyRate" className="text-sm text-gold mb-2 block">
                      Nightly Rate (Airbnb)
                    </Label>
                    <Input
                      id="airbnbNightlyRate"
                      type="text"
                      value={formData.airbnbNightlyRate}
                      onChange={(e) => handleInputChange("airbnbNightlyRate", e.target.value)}
                      className="bg-primary text-primary-foreground border-0 h-12 text-base placeholder:text-primary-foreground/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="airbnbOccupancy" className="text-sm text-gold mb-2 block">
                      Occupancy Rate (%)
                    </Label>
                    <Input
                      id="airbnbOccupancy"
                      type="text"
                      value={formData.airbnbOccupancy}
                      onChange={(e) => handleInputChange("airbnbOccupancy", e.target.value)}
                      className="bg-primary text-primary-foreground border-0 h-12 text-base placeholder:text-primary-foreground/50"
                    />
                  </div>
                </div>
              </div>
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
