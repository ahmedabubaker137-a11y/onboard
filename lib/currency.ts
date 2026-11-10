import { CURRENCY_RATES } from "./constants";
import type { CurrencyCode } from "./types";

/**
 * Standard benchmark base salaries (in USD) for cohort roles.
 */
export const ROLE_BENCHMARK_SALARIES_USD: Record<string, number> = {
  "Staff Distributed Systems Engineer": 185000,
  "Senior Product Designer": 145000,
  "Enterprise Account Executive": 165000,
  "People Operations Specialist": 105000,
  "Frontend Software Engineer": 140000,
  "Staff Backend Architect": 195000,
  "Lead Product Strategist": 160000,
};

/**
 * Retrieves the base annual USD salary for an employee role.
 */
export function getRoleSalaryUsd(jobTitle: string): number {
  if (ROLE_BENCHMARK_SALARIES_USD[jobTitle]) {
    return ROLE_BENCHMARK_SALARIES_USD[jobTitle];
  }
  const lower = jobTitle.toLowerCase();
  if (lower.includes("architect") || lower.includes("principal")) return 195000;
  if (lower.includes("staff") || lower.includes("lead")) return 175000;
  if (lower.includes("senior")) return 150000;
  if (lower.includes("executive") || lower.includes("sales")) return 160000;
  if (lower.includes("designer")) return 140000;
  if (lower.includes("operations") || lower.includes("people")) return 105000;
  return 130000;
}

/**
 * Formats a USD amount into the target currency with exchange rate conversion and proper symbol.
 */
export function formatCurrency(amountInUsd: number, currency: CurrencyCode = "USD"): string {
  const config = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = Math.round(amountInUsd * config.rate);

  const formattedNumber = converted.toLocaleString("en-US");

  if (currency === "AED") {
    return `${config.symbol} ${formattedNumber}`;
  }
  if (currency === "PKR") {
    return `Rs. ${formattedNumber}`;
  }
  if (currency === "CAD") {
    return `CA$${formattedNumber}`;
  }
  return `${config.symbol}${formattedNumber}`;
}

/**
 * Converts a salary range string like "$150,000 - $185,000" into the active currency.
 */
export function convertSalaryRange(rangeString: string, currency: CurrencyCode = "USD"): string {
  if (!rangeString) return rangeString;
  if (currency === "USD") return rangeString;

  // Extract all digit groups with commas
  const numbers = rangeString.match(/(\d[\d,]*)/g);
  if (!numbers || numbers.length === 0) return rangeString;

  const convertedNumbers = numbers.map((numStr) => {
    const rawVal = parseInt(numStr.replace(/,/g, ""), 10);
    if (isNaN(rawVal)) return numStr;
    return formatCurrency(rawVal, currency);
  });

  if (convertedNumbers.length === 2) {
    return `${convertedNumbers[0]} - ${convertedNumbers[1]}`;
  }
  return convertedNumbers.join(" - ");
}
