import type { Difficulty, Exercise } from '../domain/types';
import { makeExercise, type GeneratorDef } from './builders';
import { algebraGenerators } from './families/algebra';
import { geometryGenerators } from './families/geometry';
import { numberGenerators } from './families/numbers';
import { proportionalityGenerators } from './families/proportionality';
import { statisticsGenerators } from './families/statistics';
import { createRng, dailySeed } from './rng';

export { createRng, dailySeed, seedFromString } from './rng';
export type { GeneratorDef } from './builders';

/** Todos los generadores disponibles. Para ampliar el sistema basta con añadir aquí. */
export const allGenerators: GeneratorDef[] = [
  ...numberGenerators,
  ...proportionalityGenerators,
  ...geometryGenerators,
  ...algebraGenerators,
  ...statisticsGenerators,
];

const byFamily = new Map(allGenerators.map((g) => [g.family, g]));

export function getGenerator(family: string): GeneratorDef | undefined {
  return byFamily.get(family);
}

export function generatorsByModule(moduleId: string): GeneratorDef[] {
  return allGenerators.filter((g) => g.moduleId === moduleId);
}

/** Módulos que tienen práctica infinita disponible, con metadatos para la interfaz. */
export interface PracticeModuleInfo {
  moduleId: string;
  generators: number;
  emojis: string[];
}

export function practiceModules(): PracticeModuleInfo[] {
  const map = new Map<string, GeneratorDef[]>();
  for (const g of allGenerators) {
    const list = map.get(g.moduleId) ?? [];
    list.push(g);
    map.set(g.moduleId, list);
  }
  return [...map.entries()].map(([moduleId, gens]) => ({
    moduleId,
    generators: gens.length,
    emojis: [...new Set(gens.map((g) => g.emoji))].slice(0, 6),
  }));
}

function difficultyFor(def: GeneratorDef, target: Difficulty | undefined, rng: ReturnType<typeof createRng>): Difficulty {
  if (target && def.difficulties.includes(target)) return target;
  if (target) {
    // elige la dificultad disponible más cercana al objetivo
    return def.difficulties.reduce((best, d) => (Math.abs(d - target) < Math.abs(best - target) ? d : best), def.difficulties[0]);
  }
  return rng.pick(def.difficulties);
}

/** Genera UN ejercicio concreto de una familia con una semilla dada (reproducible). */
export function generateOne(family: string, seed: number, difficulty?: Difficulty): Exercise | null {
  const def = byFamily.get(family);
  if (!def) return null;
  const rng = createRng(seed);
  const diff = difficultyFor(def, difficulty, rng);
  return makeExercise(def, def.build(rng, diff), rng, diff);
}

const MIX = 2654435761;

/**
 * Genera un set de práctica infinito para un módulo.
 * `baseSeed` hace la tanda reproducible; cada ejercicio usa una semilla derivada.
 */
export function generatePracticeSet(
  moduleId: string,
  count: number,
  baseSeed: number,
  difficulty?: Difficulty,
): Exercise[] {
  const pool = generatorsByModule(moduleId);
  if (pool.length === 0) return [];
  const out: Exercise[] = [];
  let lastFamily = '';
  for (let i = 0; i < count; i += 1) {
    const seed = (baseSeed + i * MIX) >>> 0;
    const rng = createRng(seed);
    // evita repetir la misma familia dos veces seguidas cuando hay variedad
    let def = rng.pick(pool);
    if (pool.length > 2 && def.family === lastFamily) def = rng.pick(pool);
    lastFamily = def.family;
    const diff = difficultyFor(def, difficulty, rng);
    out.push(makeExercise(def, def.build(rng, diff), rng, diff));
  }
  return out;
}

/** El "Reto del día": un puñado de ejercicios variados, iguales para toda la jornada. */
export function dailyChallenge(count = 5, date = new Date()): Exercise[] {
  const seed = dailySeed(date);
  const rng = createRng(seed);
  const out: Exercise[] = [];
  for (let i = 0; i < count; i += 1) {
    const itemSeed = (seed + i * MIX) >>> 0;
    const itemRng = createRng(itemSeed);
    const def = itemRng.pick(allGenerators);
    const diff = def.difficulties[Math.min(i, def.difficulties.length - 1)];
    out.push(makeExercise(def, def.build(itemRng, diff), itemRng, diff));
    void rng;
  }
  return out;
}
