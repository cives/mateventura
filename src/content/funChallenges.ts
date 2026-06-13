import { z } from 'zod';
import type { Difficulty, Exercise } from '../domain/types';
import raw from './funChallenges.json';

// Esquema de un "reto divertido". Es el formato que rellena la rutina IA de
// autocompletado: datos simples y validables, nunca código.
export const funChallengeSchema = z.object({
  id: z.string().regex(/^fun\.\d{4,}$/),
  emoji: z.string().min(1),
  tag: z.string().min(1),
  title: z.string().min(1),
  statement: z.string().min(10),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  moduleId: z.string().min(1),
  answer: z.object({
    value: z.number(),
    unit: z.string().optional(),
    tolerance: z.number().nonnegative(),
  }),
  explanation: z.string().min(5),
  hint: z.string().min(3),
  createdAt: z.string(),
});

export const funChallengeFileSchema = z.object({
  version: z.string(),
  challenges: z.array(funChallengeSchema),
});

export type FunChallenge = z.infer<typeof funChallengeSchema>;

const parsed = funChallengeFileSchema.safeParse(raw);

/** Lista de retos divertidos válidos. Si el archivo está corrupto, no rompe la app. */
export const funChallenges: FunChallenge[] = parsed.success ? parsed.data.challenges : [];

/** Convierte un reto divertido en un Exercise jugable por el motor de corrección. */
export function funChallengeToExercise(challenge: FunChallenge): Exercise {
  const hasUnit = Boolean(challenge.answer.unit && challenge.answer.unit.length > 0);
  return {
    id: `funx.${challenge.id}`,
    version: 1,
    source: { kind: 'created_for_mvp', extractionStatus: 'created' },
    course: '2ESO',
    subject: 'Matemáticas',
    moduleId: challenge.moduleId,
    missionIds: ['fun.challenges'],
    nodeIds: ['fun.challenge'],
    family: `fun_${challenge.tag}`,
    difficulty: challenge.difficulty as Difficulty,
    statement: challenge.statement,
    answerInput: { kind: 'text', placeholder: hasUnit ? `Ej.: 12 ${challenge.answer.unit}` : 'Escribe tu respuesta' },
    expectedAnswer: hasUnit
      ? { kind: 'number_with_unit', value: challenge.answer.value, unit: challenge.answer.unit!, tolerance: challenge.answer.tolerance, unitRequired: false }
      : { kind: 'number', value: challenge.answer.value, tolerance: challenge.answer.tolerance },
    correction: hasUnit
      ? { corrector: 'numeric_with_unit', acceptedDecimalSeparators: [',', '.'] }
      : { corrector: 'numeric', acceptedDecimalSeparators: [',', '.'], acceptBareNumber: true },
    hints: [{ level: 1, text: challenge.hint }],
    explanation: { text: challenge.explanation },
    commonErrors: [],
    curriculum: { sense: 'A', knowledgeCodes: [], competencies: [], criteria: [] },
  };
}

/** Selecciona n retos pseudoaleatorios (estables por semilla) y los convierte en ejercicios. */
export function pickFunExercises(n: number, seed: number): Exercise[] {
  if (funChallenges.length === 0) return [];
  const order = [...funChallenges];
  // baraje determinista basado en la semilla
  let s = seed >>> 0;
  for (let i = order.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, Math.min(n, order.length)).map(funChallengeToExercise);
}
