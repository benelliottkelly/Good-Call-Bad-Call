export type OddsFormat = "AMERICAN" | "FRACTIONAL";

/**
 * Convert decimal odds to display format
 */
export function formatOdds(decimalOdds: number, format: OddsFormat): string {
  if (format === "AMERICAN") {
    if (decimalOdds >= 2) return `+${Math.round((decimalOdds - 1) * 100)}`;
    return `${Math.round(-100 / (decimalOdds - 1))}`;
  } else {
    const numerator = decimalOdds - 1;
    return `${numerator}/1`;
  }
}

/**
 * Parse user input odds to decimal
 */
export function parseOddsInput(input: string, format: OddsFormat): number {
  const trimmed = input.trim().replace("+", "");
  if (!trimmed) return 2; // default min

  if (format === "AMERICAN") {
    const n = parseFloat(trimmed);
    if (isNaN(n)) return 2;
    return n >= 0 ? 1 + n / 100 : 1 - 100 / n;
  } else {
    const parts = trimmed.split("/");
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const denom = parseFloat(parts[1]);
      if (isNaN(num) || isNaN(denom) || denom === 0) return 2;
      return 1 + num / denom;
    }
    const n = parseFloat(trimmed);
    return isNaN(n) ? 2 : 1 + n;
  }
}
