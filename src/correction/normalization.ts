export function normalizeDecimalText(rawAnswer: unknown): string {
  return String(rawAnswer).trim().replace(',', '.').replace(/\s+/g, ' ');
}

export function readFirstNumber(rawAnswer: unknown): number | null {
  const normalized = normalizeDecimalText(rawAnswer);
  const match = normalized.match(/[-+]?\d+(?:\.\d+)?/u);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

export function readPercentEquivalent(rawAnswer: unknown): number | null {
  const normalized = normalizeDecimalText(rawAnswer);

  const fraction = normalized.match(/^([-+]?\d+(?:\.\d+)?)\s*\/\s*([-+]?\d+(?:\.\d+)?)$/u);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }

  const value = readFirstNumber(rawAnswer);
  if (value === null) return null;
  return normalized.includes('%') ? value / 100 : value;
}

export function hasUnit(rawAnswer: unknown, unit: string): boolean {
  return normalizeDecimalText(rawAnswer).includes(unit);
}
