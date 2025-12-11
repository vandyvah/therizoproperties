import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Banknote, Calendar, TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MortgageData {
  propertyPrice: string;
  foreignIncome: string;
  currency: "USD" | "GBP" | "EUR";
  loanTermYears: string;
  interestRate: string;
  downPaymentPercent: string;
}

const exchangeRates = {
  USD: 1550,
  GBP: 1950,
  EUR: 1680,
};

const formatCurrency = (value: number, symbol = "₦"): string => {
  return `${symbol}${new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;
};

const formatForeignCurrency = (value: number, currency: "USD" | "GBP" | "EUR"): string => {
  const symbols = { USD: "$", GBP: "£", EUR: "€" };
  return `${symbols[currency]}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;
};

export const DiasporaMortgageCalculator = () => {
  const [data, setData] = useState<MortgageData>({
    propertyPrice: "150000000",
    foreignIncome: "8000",
    currency: "USD",
    loanTermYears: "20",
    interestRate: "12",
    downPaymentPercent: "30",
  });

  const parseNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, "")) || 0;
  };

  const handleChange = (field: keyof MortgageData, value: string) => {
    if (field === "currency") {
      setData((prev) => ({ ...prev, [field]: value as "USD" | "GBP" | "EUR" }));
    } else {
      const sanitized = value.replace(/[^0-9.,]/g, "");
      setData((prev) => ({ ...prev, [field]: sanitized }));
    }
  };

  const results = useMemo(() => {
    const propertyPrice = parseNumber(data.propertyPrice);
    const foreignMonthlyIncome = parseNumber(data.foreignIncome);
    const rate = exchangeRates[data.currency];
    const loanTerm = parseNumber(data.loanTermYears);
    const annualInterest = parseNumber(data.interestRate) / 100;
    const downPaymentPct = parseNumber(data.downPaymentPercent) / 100;

    const monthlyIncomeNGN = foreignMonthlyIncome * rate;
    const annualIncomeNGN = monthlyIncomeNGN * 12;
    const downPayment = propertyPrice * downPaymentPct;
    const loanAmount = propertyPrice - downPayment;

    // Monthly payment calculation (PMT formula)
    const monthlyInterest = annualInterest / 12;
    const numPayments = loanTerm * 12;
    const monthlyPayment =
      monthlyInterest > 0
        ? (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, numPayments)) /
          (Math.pow(1 + monthlyInterest, numPayments) - 1)
        : loanAmount / numPayments;

    const dtiRatio = monthlyIncomeNGN > 0 ? (monthlyPayment / monthlyIncomeNGN) * 100 : 0;
    const totalPayments = monthlyPayment * numPayments;
    const totalInterest = totalPayments - loanAmount;
    const maxLoanBasedOnIncome = monthlyIncomeNGN * 0.4 * numPayments * 0.6; // 40% DTI, 60% factor for interest

    const isEligible = dtiRatio <= 45 && downPaymentPct >= 0.2;

    return {
      monthlyIncomeNGN,
      annualIncomeNGN,
      downPayment,
      loanAmount,
      monthlyPayment,
      dtiRatio,
      totalInterest,
      totalPayments,
      maxLoanBasedOnIncome,
      isEligible,
      foreignMonthlyIncome,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg">
          <Globe className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Diaspora Mortgage Calculator
          </h3>
          <p className="text-sm text-muted-foreground">
            For foreign-income backed financing
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Property Price (₦)</Label>
            <Input
              value={data.propertyPrice}
              onChange={(e) => handleChange("propertyPrice", e.target.value)}
              className="bg-primary text-primary-foreground border-0 h-12"
              placeholder="150,000,000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">Monthly Income</Label>
              <Input
                value={data.foreignIncome}
                onChange={(e) => handleChange("foreignIncome", e.target.value)}
                className="bg-primary text-primary-foreground border-0 h-12"
                placeholder="8,000"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Currency</Label>
              <Select value={data.currency} onValueChange={(v) => handleChange("currency", v)}>
                <SelectTrigger className="bg-primary text-primary-foreground border-0 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">Loan Term (Years)</Label>
              <Input
                value={data.loanTermYears}
                onChange={(e) => handleChange("loanTermYears", e.target.value)}
                className="bg-primary text-primary-foreground border-0 h-12"
                placeholder="20"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Interest Rate (%)</Label>
              <Input
                value={data.interestRate}
                onChange={(e) => handleChange("interestRate", e.target.value)}
                className="bg-primary text-primary-foreground border-0 h-12"
                placeholder="12"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Down Payment (%)</Label>
            <Input
              value={data.downPaymentPercent}
              onChange={(e) => handleChange("downPaymentPercent", e.target.value)}
              className="bg-primary text-primary-foreground border-0 h-12"
              placeholder="30"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Card className={`p-4 border-l-4 ${results.isEligible ? "border-l-green-500 bg-green-500/5" : "border-l-amber-500 bg-amber-500/5"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Eligibility Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${results.isEligible ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {results.isEligible ? "Likely Eligible" : "Review Required"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {formatForeignCurrency(results.foreignMonthlyIncome, data.currency)}/month income
            </p>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-foreground">Monthly Payment</span>
            </div>
            <p className="text-2xl font-bold text-gold">{formatCurrency(results.monthlyPayment)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Income in NGN: {formatCurrency(results.monthlyIncomeNGN)}/month
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        DTI Ratio <Info className="w-3 h-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        Debt-to-Income ratio. Most lenders require below 45%
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className={`text-lg font-bold ${results.dtiRatio <= 35 ? "text-green-600" : results.dtiRatio <= 45 ? "text-amber-600" : "text-red-600"}`}>
                {results.dtiRatio.toFixed(1)}%
              </p>
            </Card>

            <Card className="p-3 bg-card border border-border">
              <span className="text-xs text-muted-foreground">Down Payment</span>
              <p className="text-lg font-bold text-foreground">{formatCurrency(results.downPayment)}</p>
            </Card>
          </div>

          <Card className="p-3 bg-card border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loan Amount</span>
              <span className="font-medium text-foreground">{formatCurrency(results.loanAmount)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-medium text-foreground">{formatCurrency(results.totalInterest)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground font-medium">Total Payments</span>
              <span className="font-bold text-foreground">{formatCurrency(results.totalPayments)}</span>
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-primary/5 rounded-lg p-4 mt-4">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> This calculator provides estimates for diaspora clients with foreign-currency income. 
          Actual mortgage terms depend on bank policies, documentation, and credit assessment. 
          Contact Therizo for personalized financing guidance.
        </p>
      </div>
    </div>
  );
};
