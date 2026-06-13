import type {
  CommonErrorSpec,
  Difficulty,
  Exercise,
  ExpectedAnswer,
  Hint,
} from '../domain/types';
import type { Rng } from './rng';

// Un generador toma un RNG con semilla y una dificultad, y devuelve la parte
// "interesante" de un ejercicio. El armazón (id, curso, asignatura, etc.) lo
// rellena `makeExercise`. Así cada generador se concentra solo en la matemática.

export interface GeneratedCore {
  statement: string;
  expectedAnswer: ExpectedAnswer;
  explanation: { text: string; steps?: string[]; check?: string };
  hints: Hint[];
  commonErrors?: CommonErrorSpec[];
  placeholder?: string;
  /** Para enunciados de respuesta libre numérica sin unidad. */
}

export interface GeneratorDef {
  /** Clave única de familia. NO debe contener la subcadena "porcentaje" (colisiona con un corrector heredado). */
  family: string;
  title: string;
  emoji: string;
  moduleId: string;
  nodeIds: string[];
  skillFamily: string;
  difficulties: Difficulty[];
  build: (rng: Rng, difficulty: Difficulty) => GeneratedCore;
}

/** Empareja la respuesta esperada con el corrector adecuado del núcleo. */
function correctorFor(expected: ExpectedAnswer): Exercise['correction'] {
  switch (expected.kind) {
    case 'number_with_unit':
      return { corrector: 'numeric_with_unit', acceptedDecimalSeparators: [',', '.'], acceptEquivalentUnits: false };
    case 'percent_equivalence':
      return { corrector: 'percent_equivalence', acceptedDecimalSeparators: [',', '.'] };
    case 'linear_equation_solution':
      return { corrector: 'linear_equation_solution', validateBySubstitution: true };
    case 'multiple_choice':
      return { corrector: 'multiple_choice' };
    case 'number':
      return { corrector: 'numeric', acceptedDecimalSeparators: [',', '.'], acceptBareNumber: true };
    default:
      return { corrector: 'numeric', acceptedDecimalSeparators: [',', '.'] };
  }
}

function inputFor(expected: ExpectedAnswer, placeholder?: string): Exercise['answerInput'] {
  if (expected.kind === 'multiple_choice') {
    return { kind: 'choice', placeholder };
  }
  return { kind: 'text', placeholder: placeholder ?? 'Escribe tu respuesta' };
}

/** Valor numérico canónico de una respuesta esperada (para depurar trampas). */
function expectedNumericValue(expected: ExpectedAnswer): number | null {
  switch (expected.kind) {
    case 'number':
    case 'number_with_unit':
      return expected.value;
    case 'percent_equivalence':
      return expected.valueAsDecimal;
    case 'linear_equation_solution':
      return expected.value;
    default:
      return null;
  }
}

/**
 * Salvaguarda sistémico: una trampa nunca debe coincidir con la respuesta correcta.
 * Para ciertos parámetros (descuento del 50 %, área = perímetro, etc.) el "error típico"
 * y la solución valen lo mismo; en esos casos descartamos la trampa.
 */
function sanitizeTraps(core: GeneratedCore): CommonErrorSpec[] {
  const traps = core.commonErrors ?? [];
  const answer = expectedNumericValue(core.expectedAnswer);
  if (answer === null) return traps;
  return traps.filter((trap) => {
    if (trap.trigger?.kind !== 'numeric_value') return true;
    return Math.abs(trap.trigger.value - answer) > Math.max(trap.trigger.tolerance, 0.005);
  });
}

export function makeExercise(def: GeneratorDef, core: GeneratedCore, rng: Rng, difficulty: Difficulty): Exercise {
  const id = `gen.${def.family}.${rng.seed}.${difficulty}`;
  return {
    id,
    version: 1,
    source: { kind: 'created_for_mvp', extractionStatus: 'created' },
    course: '2ESO',
    subject: 'Matemáticas',
    moduleId: def.moduleId,
    missionIds: [`practice.${def.family}`],
    nodeIds: def.nodeIds,
    family: def.family,
    difficulty,
    statement: core.statement,
    answerInput: inputFor(core.expectedAnswer, core.placeholder),
    expectedAnswer: core.expectedAnswer,
    correction: correctorFor(core.expectedAnswer),
    hints: core.hints,
    explanation: core.explanation,
    commonErrors: sanitizeTraps(core),
    curriculum: { sense: 'A', knowledgeCodes: [], competencies: [], criteria: [] },
  };
}

// ---- Utilidades numéricas compartidas por los generadores ----

/** Redondea a 2 decimales evitando ruido de coma flotante. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Formatea un número en estilo español: coma decimal, sin ceros sobrantes. */
export function fmt(value: number): string {
  const rounded = round2(value);
  return String(rounded).replace('.', ',');
}

/** Máximo común divisor (para simplificar fracciones). */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/** Devuelve un error común numérico detectable por el corrector. */
export function numericTrap(code: string, value: number, feedback: string, tolerance = 0.01): CommonErrorSpec {
  return { code, trigger: { kind: 'numeric_value', value: round2(value), tolerance }, feedback, detectable: true };
}

/** Elige un contexto temático y rellena su plantilla. Mantiene los enunciados frescos y divertidos. */
export function flavor(rng: Rng, contexts: readonly string[]): string {
  return rng.pick(contexts);
}
