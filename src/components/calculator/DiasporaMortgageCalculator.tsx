import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Banknote, TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDebounce, formatWithSeparators, parseFormattedNumber } from "@/hooks/useDebounce";

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
  const initialData: MortgageData = {
    propertyPrice: "150,000,000",
    foreignIncome: "8,000",
    currency: "USD",
    loanTermYears: "20",
    interestRate: "12",
    downPaymentPercent: "30",
  };

  const [data, setData] = useState<MortgageData>(initialData);
  const debouncedData = useDebounce(data, 150);

  const handleChange = (field: keyof MortgageData, value: string) => {
    if (field === "currency") {
      setData((prev) => ({ ...prev, [field]: value as "USD" | "GBP" | "EUR" }));
    } else if (field === "loanTermYears" || field === "interestRate" || field === "downPaymentPercent") {
      // Don't format small numbers like percentages and years
      const sanitized = value.replace(/[^0-9.]/g, "");
      setData((prev) => ({ ...prev, [field]: sanitized }));
    } else {
      // Format with thousand separators for currency fields
      const formattedValue = formatWithSeparators(value);
      setData((prev) => ({ ...prev, [field]: formattedValue }));
    }
  };

  // Calculate results using debounced data to prevent typing lag
  const results = useMemo(() => {
    const propertyPrice = parseFormattedNumber(debouncedData.propertyPrice);
    const foreignMonthlyIncome = parseFormattedNumber(debouncedData.foreignIncome);
    const rate = exchangeRates[debouncedData.currency];
    const loanTerm = parseFormattedNumber(debouncedData.loanTermYears);
    const annualInterest = parseFormattedNumber(debouncedData.interestRate) / 100;
    const downPaymentPct = parseFormattedNumber(debouncedData.downPaymentPercent) / 100;

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
  }, [debouncedData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg">
          <Globe className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-ink">
            Diaspora Mortgage Calculator
          </h3>
          <p className="text-sm text-slate">
            For foreign-income backed financing
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-ink mb-2 block">Property Price (₦)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={data.propertyPrice}
              onChange={(e) => handleChange("propertyPrice", e.target.value)}
              className="bg-navy text-ivory border-0 h-12 placeholder:text-ivory/50 focus:ring-2 focus:ring-gold"
              placeholder="150,000,000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-ink mb-2 block">Monthly Income</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={data.foreignIncome}
                onChange={(e) => handleChange("foreignIncome", e.target.value)}
                className="bg-navy text-ivory border-0 h-12 placeholder:text-ivory/50 focus:ring-2 focus:ring-gold"
                placeholder="8,000"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-ink mb-2 block">Currency</Label>
              <Select value={data.currency} onValueChange={(v) => handleChange("currency", v)}>
                <SelectTrigger className="bg-navy text-ivory border-0 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-warm-white border-sand">
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-ink mb-2 block">Loan Term (Years)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={data.loanTermYears}
                onChange={(e) => handleChange("loanTermYears", e.target.value)}
                className="bg-navy text-ivory border-0 h-12 placeholder:text-ivory/50 focus:ring-2 focus:ring-gold"
                placeholder="20"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-ink mb-2 block">Interest Rate (%)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={data.interestRate}
                onChange={(e) => handleChange("interestRate", e.target.value)}
                className="bg-navy text-ivory border-0 h-12 placeholder:text-ivory/50 focus:ring-2 focus:ring-gold"
                placeholder="12"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-ink mb-2 block">Down Payment (%)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={data.downPaymentPercent}
              onChange={(e) => handleChange("downPaymentPercent", e.target.value)}
              className="bg-navy text-ivory border-0 h-12 placeholder:text-ivory/50 focus:ring-2 focus:ring-gold"
              placeholder="30"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Card className={`p-4 border-l-4 ${results.isEligible ? "border-l-green-500 bg-green-500/5" : "border-l-amber-500 bg-amber-500/5"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink">Eligibility Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${results.isEligible ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {results.isEligible ? "Likely Eligible" : "Review Required"}
              </span>
            </div>
            <p className="text-xs text-slate">
              Based on {formatForeignCurrency(results.foreignMonthlyIncome, data.currency)}/month income
            </p>
          </Card>

          <Card className="p-4 bg-warm-white border border-sand">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-ink">Monthly Payment</span>
            </div>
            <p className="text-2xl font-bold text-gold">{formatCurrency(results.monthlyPayment)}</p>
            <p className="text-xs text-slate mt-1">
              Income in NGN: {formatCurrency(results.monthlyIncomeNGN)}/month
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-warm-white border border-sand">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-slate" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs text-slate flex items-center gap-1">
                        DTI Ratio <Info className="w-3 h-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-navy text-ivory border-0">
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

            <Card className="p-3 bg-warm-white border border-sand">
              <span className="text-xs text-slate">Down Payment</span>
              <p className="text-lg font-bold text-ink">{formatCurrency(results.downPayment)}</p>
            </Card>
          </div>

          <Card className="p-3 bg-warm-white border border-sand">
            <div className="flex justify-between text-sm">
              <span className="text-slate">Loan Amount</span>
              <span className="font-medium text-ink">{formatCurrency(results.loanAmount)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-slate">Total Interest</span>
              <span className="font-medium text-ink">{formatCurrency(results.totalInterest)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-sand">
              <span className="text-slate font-medium">Total Payments</span>
              <span className="font-bold text-ink">{formatCurrency(results.totalPayments)}</span>
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-navy/5 rounded-lg p-4 mt-4">
        <p className="text-xs text-slate">
          <strong className="text-ink">Note:</strong> This calculator provides estimates for diaspora clients with foreign-currency income. 
          Actual mortgage terms depend on bank policies, documentation, and credit assessment. 
          Contact Therizo for personalized financing guidance.
        </p>
      </div>
    </div>
  );
};
