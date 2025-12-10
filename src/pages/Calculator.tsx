import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Send, TrendingUp, Clock, Percent } from "lucide-react";
import { Link } from "react-router-dom";

type Strategy = "long-term" | "airbnb" | "compare";

interface FormData {
  strategy: Strategy;
  location: string;
  purchasePrice: string;
  renovationCosts: string;
  otherCosts: string;
  monthlyRent: string;
  airbnbNightlyRate: string;
  airbnbOccupancy: string;
  annualTax: string;
  annualInsurance: string;
  annualMaintenance: string;
  managementFee: string;
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

const locations = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ogun State",
  "Kano",
  "Ibadan",
  "Enugu",
  "Other Location",
];

const Calculator_Page = () => {
  const [formData, setFormData] = useState<FormData>({
    strategy: "long-term",
    location: "",
    purchasePrice: "",
    renovationCosts: "",
    otherCosts: "",
    monthlyRent: "",
    airbnbNightlyRate: "",
    airbnbOccupancy: "60",
    annualTax: "",
    annualInsurance: "",
    annualMaintenance: "",
    managementFee: "10",
  });

  const [longTermResults, setLongTermResults] = useState<Results | null>(null);
  const [airbnbResults, setAirbnbResults] = useState<Results | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowResults(false);
  };

  const parseNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, "")) || 0;
  };

  const calculateResults = () => {
    const purchasePrice = parseNumber(formData.purchasePrice);
    const renovationCosts = parseNumber(formData.renovationCosts);
    const otherCosts = parseNumber(formData.otherCosts);
    const monthlyRent = parseNumber(formData.monthlyRent);
    const airbnbNightlyRate = parseNumber(formData.airbnbNightlyRate);
    const airbnbOccupancy = parseNumber(formData.airbnbOccupancy) / 100;
    const annualTax = parseNumber(formData.annualTax);
    const annualInsurance = parseNumber(formData.annualInsurance);
    const annualMaintenance = parseNumber(formData.annualMaintenance);
    const managementFee = parseNumber(formData.managementFee) / 100;

    const totalInvestment = purchasePrice + renovationCosts + otherCosts;

    // Long-term rental calculation
    if (formData.strategy === "long-term" || formData.strategy === "compare") {
      const grossAnnualIncome = monthlyRent * 12;
      const managementCost = grossAnnualIncome * managementFee;
      const annualExpenses =
        annualTax + annualInsurance + annualMaintenance + managementCost;
      const netAnnualIncome = grossAnnualIncome - annualExpenses;
      const capRate =
        purchasePrice > 0 ? (netAnnualIncome / purchasePrice) * 100 : 0;
      const cashOnCash =
        totalInvestment > 0 ? (netAnnualIncome / totalInvestment) * 100 : 0;
      const paybackPeriod =
        netAnnualIncome > 0 ? totalInvestment / netAnnualIncome : 0;

      setLongTermResults({
        totalInvestment,
        grossAnnualIncome,
        annualExpenses,
        netAnnualIncome,
        capRate,
        cashOnCash,
        paybackPeriod,
      });
    }

    // Airbnb calculation
    if (formData.strategy === "airbnb" || formData.strategy === "compare") {
      const grossAnnualIncome = airbnbNightlyRate * 365 * airbnbOccupancy;
      const managementCost = grossAnnualIncome * managementFee;
      const annualExpenses =
        annualTax + annualInsurance + annualMaintenance + managementCost;
      const netAnnualIncome = grossAnnualIncome - annualExpenses;
      const capRate =
        purchasePrice > 0 ? (netAnnualIncome / purchasePrice) * 100 : 0;
      const cashOnCash =
        totalInvestment > 0 ? (netAnnualIncome / totalInvestment) * 100 : 0;
      const paybackPeriod =
        netAnnualIncome > 0 ? totalInvestment / netAnnualIncome : 0;

      setAirbnbResults({
        totalInvestment,
        grossAnnualIncome,
        annualExpenses,
        netAnnualIncome,
        capRate,
        cashOnCash,
        paybackPeriod,
      });
    }

    setShowResults(true);
  };

  const ResultCard = ({
    title,
    results,
  }: {
    title: string;
    results: Results;
  }) => (
    <Card className="border-gold/30">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-xl text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between py-3 border-b border-border">
          <span className="text-muted-foreground">Total Investment</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(results.totalInvestment)}
          </span>
        </div>
        <div className="flex justify-between py-3 border-b border-border">
          <span className="text-muted-foreground">Gross Annual Income</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(results.grossAnnualIncome)}
          </span>
        </div>
        <div className="flex justify-between py-3 border-b border-border">
          <span className="text-muted-foreground">Annual Expenses</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(results.annualExpenses)}
          </span>
        </div>
        <div className="flex justify-between py-3 border-b border-border bg-gold/5 -mx-6 px-6">
          <span className="text-foreground font-medium">Net Annual Income</span>
          <span className="font-bold text-gold text-lg">
            {formatCurrency(results.netAnnualIncome)}
          </span>
        </div>
        <div className="flex justify-between py-3 border-b border-border">
          <span className="text-muted-foreground">Cap Rate</span>
          <span className="font-semibold text-foreground">
            {results.capRate.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between py-3 border-b border-border">
          <span className="text-muted-foreground">Cash-on-Cash Return</span>
          <span className="font-semibold text-gold">
            {results.cashOnCash.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-muted-foreground">Payback Period</span>
          <span className="font-semibold text-foreground">
            {results.paybackPeriod.toFixed(1)} years
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-primary">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                <Calculator className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Investment Tool</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary-foreground mb-6">
              Therizo ROI Calculator
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Before you commit capital, run the numbers. The Therizo ROI
              Calculator helps you estimate your potential returns in Nigerian
              Naira (₦) for both long-term rental and Airbnb strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Form */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            {/* Strategy Selection */}
            <div className="mb-10">
              <Label className="text-lg font-display font-semibold mb-4 block">
                Investment Strategy
              </Label>
              <RadioGroup
                value={formData.strategy}
                onValueChange={(value) =>
                  handleInputChange("strategy", value as Strategy)
                }
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long-term" id="long-term" />
                  <Label htmlFor="long-term" className="cursor-pointer">
                    Long-Term Rental
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="airbnb" id="airbnb" />
                  <Label htmlFor="airbnb" className="cursor-pointer">
                    Airbnb
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compare" id="compare" />
                  <Label htmlFor="compare" className="cursor-pointer">
                    Compare Both
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Location */}
            <div className="mb-10">
              <Label className="text-lg font-display font-semibold mb-4 block">
                Property Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Acquisition Costs */}
            <div className="mb-10">
              <h3 className="text-lg font-display font-semibold mb-6">
                Acquisition Costs (₦)
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="purchasePrice" className="mb-2 block">
                    Property Purchase Price
                  </Label>
                  <Input
                    id="purchasePrice"
                    type="text"
                    placeholder="e.g., 150,000,000"
                    value={formData.purchasePrice}
                    onChange={(e) =>
                      handleInputChange("purchasePrice", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="renovationCosts" className="mb-2 block">
                    Renovation & Fit-Out
                  </Label>
                  <Input
                    id="renovationCosts"
                    type="text"
                    placeholder="e.g., 10,000,000"
                    value={formData.renovationCosts}
                    onChange={(e) =>
                      handleInputChange("renovationCosts", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="otherCosts" className="mb-2 block">
                    Other Acquisition Costs
                  </Label>
                  <Input
                    id="otherCosts"
                    type="text"
                    placeholder="Legal, stamp duty, etc."
                    value={formData.otherCosts}
                    onChange={(e) =>
                      handleInputChange("otherCosts", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Income Assumptions */}
            <div className="mb-10">
              <h3 className="text-lg font-display font-semibold mb-6">
                Income Assumptions
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {(formData.strategy === "long-term" ||
                  formData.strategy === "compare") && (
                  <div>
                    <Label htmlFor="monthlyRent" className="mb-2 block">
                      Monthly Rental Income (₦)
                    </Label>
                    <Input
                      id="monthlyRent"
                      type="text"
                      placeholder="e.g., 1,500,000"
                      value={formData.monthlyRent}
                      onChange={(e) =>
                        handleInputChange("monthlyRent", e.target.value)
                      }
                    />
                  </div>
                )}
                {(formData.strategy === "airbnb" ||
                  formData.strategy === "compare") && (
                  <>
                    <div>
                      <Label htmlFor="airbnbNightlyRate" className="mb-2 block">
                        Airbnb Nightly Rate (₦)
                      </Label>
                      <Input
                        id="airbnbNightlyRate"
                        type="text"
                        placeholder="e.g., 80,000"
                        value={formData.airbnbNightlyRate}
                        onChange={(e) =>
                          handleInputChange("airbnbNightlyRate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="airbnbOccupancy" className="mb-2 block">
                        Airbnb Occupancy Rate (%)
                      </Label>
                      <Input
                        id="airbnbOccupancy"
                        type="text"
                        placeholder="e.g., 60"
                        value={formData.airbnbOccupancy}
                        onChange={(e) =>
                          handleInputChange("airbnbOccupancy", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="mb-10">
              <h3 className="text-lg font-display font-semibold mb-6">
                Annual Operating Expenses (₦)
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="annualTax" className="mb-2 block">
                    Annual Property Tax
                  </Label>
                  <Input
                    id="annualTax"
                    type="text"
                    placeholder="e.g., 200,000"
                    value={formData.annualTax}
                    onChange={(e) =>
                      handleInputChange("annualTax", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="annualInsurance" className="mb-2 block">
                    Annual Insurance
                  </Label>
                  <Input
                    id="annualInsurance"
                    type="text"
                    placeholder="e.g., 300,000"
                    value={formData.annualInsurance}
                    onChange={(e) =>
                      handleInputChange("annualInsurance", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="annualMaintenance" className="mb-2 block">
                    Annual Maintenance
                  </Label>
                  <Input
                    id="annualMaintenance"
                    type="text"
                    placeholder="e.g., 500,000"
                    value={formData.annualMaintenance}
                    onChange={(e) =>
                      handleInputChange("annualMaintenance", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="managementFee" className="mb-2 block">
                    Management Fee (%)
                  </Label>
                  <Input
                    id="managementFee"
                    type="text"
                    placeholder="e.g., 10"
                    value={formData.managementFee}
                    onChange={(e) =>
                      handleInputChange("managementFee", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="text-center mb-16">
              <Button variant="gold" size="xl" onClick={calculateResults}>
                <Calculator size={20} className="mr-2" />
                Calculate Potential Returns
              </Button>
            </div>

            {/* Results */}
            {showResults && (
              <div className="animate-fade-up">
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-10">
                  Your Projected Returns
                </h2>

                <div
                  className={`grid gap-8 ${
                    formData.strategy === "compare"
                      ? "md:grid-cols-2"
                      : "max-w-xl mx-auto"
                  }`}
                >
                  {(formData.strategy === "long-term" ||
                    formData.strategy === "compare") &&
                    longTermResults && (
                      <ResultCard
                        title="Long-Term Rental Projection"
                        results={longTermResults}
                      />
                    )}
                  {(formData.strategy === "airbnb" ||
                    formData.strategy === "compare") &&
                    airbnbResults && (
                      <ResultCard
                        title="Airbnb Projection"
                        results={airbnbResults}
                      />
                    )}
                </div>

                {/* Disclaimer */}
                <div className="mt-10 p-6 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Disclaimer:</strong> These figures are projections
                    based on the numbers you entered. They are not financial
                    advice or a guarantee of returns. Market conditions,
                    regulation, and unforeseen costs can change outcomes.
                    Therizo can help you refine these assumptions with real
                    market data for your chosen location.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      {showResults && (
        <section className="section-padding bg-primary">
          <div className="container-narrow text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary-foreground mb-6">
              Discuss These Numbers with Therizo
            </h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed mb-10 max-w-2xl mx-auto">
              Share your results with us and we will match you with properties
              that fit your risk tolerance, budget, and target returns.
            </p>
            <Button variant="gold" size="xl" asChild>
              <Link to="/contact">
                <Send size={20} className="mr-2" />
                Send My ROI to a Senior Consultant
              </Link>
            </Button>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Calculator_Page;
