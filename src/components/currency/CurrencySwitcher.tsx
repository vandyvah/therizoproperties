import { useState, createContext, useContext, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Currency = "NGN" | "USD" | "GBP" | "EUR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountNGN: number) => string;
  rates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates relative to NGN (approximate rates - in production, use an API)
const exchangeRates: Record<Currency, number> = {
  NGN: 1,
  USD: 0.00063, // 1 NGN = 0.00063 USD (approx 1590 NGN per USD)
  GBP: 0.00050, // 1 NGN = 0.00050 GBP
  EUR: 0.00058, // 1 NGN = 0.00058 EUR
};

const currencySymbols: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

const currencyNames: Record<Currency, string> = {
  NGN: "Nigerian Naira",
  USD: "US Dollar",
  GBP: "British Pound",
  EUR: "Euro",
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("NGN");

  const formatPrice = (amountNGN: number): string => {
    const convertedAmount = amountNGN * exchangeRates[currency];
    const symbol = currencySymbols[currency];

    if (currency === "NGN") {
      // Format in Nigerian style with abbreviations
      if (convertedAmount >= 1_000_000_000) {
        return `${symbol}${(convertedAmount / 1_000_000_000).toFixed(1)}B`;
      } else if (convertedAmount >= 1_000_000) {
        return `${symbol}${(convertedAmount / 1_000_000).toFixed(0)}M`;
      } else if (convertedAmount >= 1_000) {
        return `${symbol}${(convertedAmount / 1_000).toFixed(0)}K`;
      }
      return `${symbol}${convertedAmount.toLocaleString()}`;
    }

    // Format for other currencies
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedAmount);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        rates: exchangeRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

interface CurrencySwitcherProps {
  variant?: "default" | "compact" | "inline";
  className?: string;
}

export function CurrencySwitcher({ variant = "default", className }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();

  const currencies: Currency[] = ["NGN", "USD", "GBP", "EUR"];

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-1 text-sm", className)}>
        {currencies.map((curr) => (
          <button
            key={curr}
            onClick={() => setCurrency(curr)}
            className={cn(
              "px-2 py-1 rounded transition-colors",
              currency === curr
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {currencySymbols[curr]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={variant === "compact" ? "sm" : "default"}
          className={cn("gap-2", className)}
        >
          <span className="font-medium">{currencySymbols[currency]}</span>
          <span className="text-muted-foreground">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr}
            onClick={() => setCurrency(curr)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currency === curr && "bg-accent/10"
            )}
          >
            <span className="flex items-center gap-2">
              <span className="font-medium text-lg">{currencySymbols[curr]}</span>
              <span>{curr}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {currencyNames[curr]}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
