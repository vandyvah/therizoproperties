import { useState, useEffect } from "react";

/**
 * Custom hook that debounces a value by a specified delay.
 * Useful for preventing expensive calculations from running on every keystroke.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 150ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Formats a numeric string with thousand separators.
 * Handles partial input gracefully (e.g., trailing commas, decimals).
 * 
 * @param value - The string to format
 * @returns The formatted string with thousand separators
 */
export function formatWithSeparators(value: string): string {
  // Remove all non-numeric characters except decimal point
  const numericOnly = value.replace(/[^0-9.]/g, "");
  
  // Split by decimal point
  const parts = numericOnly.split(".");
  
  // Format the integer part with thousand separators
  const integerPart = parts[0] || "";
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Handle decimal part if present
  if (parts.length > 1) {
    return `${formattedInteger}.${parts[1]}`;
  }
  
  return formattedInteger;
}

/**
 * Removes thousand separators from a formatted string.
 * 
 * @param value - The formatted string
 * @returns The raw numeric string
 */
export function removeFormatting(value: string): string {
  return value.replace(/,/g, "");
}

/**
 * Parses a formatted string to a number.
 * 
 * @param value - The formatted string
 * @returns The parsed number, or 0 if invalid
 */
export function parseFormattedNumber(value: string): number {
  return parseFloat(removeFormatting(value)) || 0;
}
