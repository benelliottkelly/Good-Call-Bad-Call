export type OddsFormat = "AMERICAN" | "FRACTIONAL";

/**
 * Convert decimal odds to display format
 */
export function formatOdds(decimalOdds: number, format: OddsFormat): string {
  if (format === "AMERICAN") {
    if (decimalOdds >= 2) return `+${Math.round((decimalOdds - 1) * 100)}`;
    return `${Math.round(-100 / (decimalOdds - 1))}`;
  } else {
    const frac = decimalToFraction(decimalOdds - 1); // numerator/denominator
    return `${frac.numerator}/${frac.denominator}`;
  }
}

/**
 * Convert a decimal number to a fraction
 * Returns numerator and denominator as integers
 */
function decimalToFraction(decimal: number, tolerance = 1.0e-6) {
  let numerator = 1;
  let denominator = 1;
  let error = Math.abs(numerator / denominator - decimal);

  while (error > tolerance) {
    if (numerator / denominator < decimal) {
      numerator++;
    } else {
      denominator++;
      numerator = Math.round(decimal * denominator);
    }
    error = Math.abs(numerator / denominator - decimal);
    // Safety to prevent infinite loops
    if (denominator > 1000) break;
  }

  // Simplify fraction
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const common = gcd(numerator, denominator);
  return { numerator: numerator / common, denominator: denominator / common };
}

/**
 * Parse user input odds to decimal
 */
export function parseOddsInput(input: string, format: OddsFormat): number {
  const trimmed = input.trim().replace("+", "");
  if (!trimmed) return NaN;

  if (format === "AMERICAN") {
    const n = parseFloat(trimmed);
    if (isNaN(n)) return NaN;
    return n >= 0 ? 1 + n / 100 : 1 - 100 / n;
  } else {
    const parts = trimmed.split("/");
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const denom = parseFloat(parts[1]);
      if (isNaN(num) || isNaN(denom) || denom === 0) return NaN;
      return 1 + num / denom;
    }
    return NaN
  }
}
