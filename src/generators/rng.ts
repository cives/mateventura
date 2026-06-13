// Generador de números pseudoaleatorio con semilla (mulberry32).
// Determinista: la misma semilla produce siempre la misma secuencia.
// Esto permite reproducir un ejercicio exacto a partir de su semilla,
// generar "el reto del día" igual para todos y escribir tests estables.

export interface Rng {
  /** Número real en [0, 1). */
  next(): number;
  /** Entero en [min, max] (ambos incluidos). */
  int(min: number, max: number): number;
  /** Elige un elemento de la lista. */
  pick<T>(items: readonly T[]): T;
  /** true con probabilidad p (por defecto 0,5). */
  chance(p?: number): boolean;
  /** Entero distinto de cero en [-max, max] sin el 0. */
  nonZero(max: number, min?: number): number;
  /** La semilla con la que se creó. */
  readonly seed: number;
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  if (a === 0) a = 0x9e3779b9; // evita la semilla degenerada 0

  function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  const rng: Rng = {
    seed,
    next,
    int(min, max) {
      const lo = Math.ceil(min);
      const hi = Math.floor(max);
      return lo + Math.floor(next() * (hi - lo + 1));
    },
    pick(items) {
      return items[Math.floor(next() * items.length)];
    },
    chance(p = 0.5) {
      return next() < p;
    },
    nonZero(max, min = 1) {
      const magnitude = rng.int(min, max);
      return rng.chance() ? magnitude : -magnitude;
    },
  };

  return rng;
}

/** Convierte un texto (por ejemplo una fecha "2026-06-11") en una semilla estable. */
export function seedFromString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Semilla del día actual (cambia cada jornada, igual durante todo el día). */
export function dailySeed(date: Date = new Date()): number {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return seedFromString(key);
}
