const FRACTION_MAP: Record<string, number> = {
  '1/8': 0.125,
  '1/4': 0.25,
  '1/3': 1 / 3,
  '3/8': 0.375,
  '1/2': 0.5,
  '5/8': 0.625,
  '2/3': 2 / 3,
  '3/4': 0.75,
  '7/8': 0.875,
};

const DISPLAY_FRACTIONS: [number, string][] = [
  [0.125, '1/8'],
  [0.25, '1/4'],
  [1 / 3, '1/3'],
  [0.375, '3/8'],
  [0.5, '1/2'],
  [0.625, '5/8'],
  [2 / 3, '2/3'],
  [0.75, '3/4'],
  [0.875, '7/8'],
];

/**
 * Parse a quantity string into a number.
 * Handles integers, decimals, fractions ("1/2"), and mixed numbers ("1 1/2").
 * Returns null if unparseable.
 */
function parseQuantity(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  // Pure decimal/integer
  if (/^\d+(\.\d+)?$/.test(s)) {
    return parseFloat(s);
  }

  // Pure fraction (e.g. "1/2")
  const fractionMatch = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    const denom = parseInt(fractionMatch[2]);
    if (denom === 0) return null;
    return parseInt(fractionMatch[1]) / denom;
  }

  // Mixed number (e.g. "1 1/2" or "2 3/4")
  const mixedMatch = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const denom = parseInt(mixedMatch[3]);
    if (denom === 0) return null;
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / denom;
  }

  return null;
}

/**
 * Format a number as a clean quantity string.
 * Prefers common fractions (1/2, 1/4, etc.) over decimals.
 */
function formatQuantity(value: number): string {
  if (value <= 0) return '0';

  const whole = Math.floor(value);
  const frac = value - whole;

  if (frac < 0.01) return String(whole);

  // Find closest display fraction
  const closest = DISPLAY_FRACTIONS.reduce<[number, string] | null>((best, [num, str]) => {
    const diff = Math.abs(frac - num);
    if (!best || diff < Math.abs(frac - best[0])) return [num, str];
    return best;
  }, null);

  if (closest && Math.abs(frac - closest[0]) < 0.05) {
    return whole > 0 ? `${whole} ${closest[1]}` : closest[1];
  }

  // Fall back to rounded decimal
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

/**
 * Scale a quantity string by a factor.
 * Returns the original string if the quantity can't be parsed.
 */
export function scaleQuantity(raw: string, factor: number): string {
  const parsed = parseQuantity(raw);
  if (parsed === null) return raw;
  return formatQuantity(parsed * factor);
}
