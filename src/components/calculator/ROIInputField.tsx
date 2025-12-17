import React, { memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface ROIInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  goldLabel?: boolean;
  suffix?: string;
  error?: string;
  touched?: boolean;
}

export const ROIInputField = memo(function ROIInputField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  goldLabel = false,
  suffix = "",
  error,
  touched,
}: ROIInputFieldProps) {
  return (
    <div>
      <Label
        htmlFor={id}
        className={`text-sm mb-2 block ${goldLabel ? "text-gold" : "font-medium text-ink"}`}
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`bg-navy text-ivory border-0 h-12 text-base placeholder:text-ivory/50 focus:ring-2 focus:ring-gold ${
            suffix ? "pr-12" : ""
          } ${error && touched ? "ring-2 ring-destructive" : ""}`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/50 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && touched && (
        <div className="flex items-center gap-1.5 mt-1.5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});
