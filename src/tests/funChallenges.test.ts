import { describe, expect, it } from 'vitest';
import { funChallenges, funChallengeToExercise, pickFunExercises } from '../content/funChallenges';
import { correctAnswer } from '../correction/correctAnswer';
import { exerciseSchema } from '../schemas/exercise.schema';

describe('retos divertidos', () => {
  it('hay retos cargados y con IDs únicos', () => {
    expect(funChallenges.length).toBeGreaterThan(0);
    const ids = funChallenges.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada reto se convierte en un Exercise válido y autoconsistente', () => {
    for (const challenge of funChallenges) {
      const ex = funChallengeToExercise(challenge);
      const parsed = exerciseSchema.safeParse(ex);
      expect(parsed.success, `${challenge.id}: esquema inválido`).toBe(true);

      // El corrector debe aceptar la respuesta declarada como correcta.
      const written = challenge.answer.unit
        ? `${String(challenge.answer.value).replace('.', ',')} ${challenge.answer.unit}`
        : String(challenge.answer.value).replace('.', ',');
      const result = correctAnswer(ex, written);
      expect(result.isCorrect, `${challenge.id}: el motor no acepta su propia respuesta (${written})`).toBe(true);
    }
  });

  it('pickFunExercises es reproducible por semilla', () => {
    const a = pickFunExercises(5, 999);
    const b = pickFunExercises(5, 999);
    expect(a.map((e) => e.id)).toEqual(b.map((e) => e.id));
  });
});
