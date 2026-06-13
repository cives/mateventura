import { describe, expect, it } from 'vitest';
import { correctAnswer } from '../../correction/correctAnswer';
import { contentSeed } from '../../content/seed';
import type { Exercise } from '../../domain/types';

const exercise: Exercise = {
  id: 'exercise.mv-2eso-a5-percentages-001',
  version: 1,
  course: '2ESO',
  subject: 'Matemáticas',
  moduleId: 'module.proportionality_finance',
  missionIds: ['mission.percentages.market_discounts'],
  nodeIds: ['node.percentages.calculate_part'],
  family: 'porcentaje_parte_total',
  difficulty: 2,
  statement: 'Un videojuego cuesta 40 €. Tiene un descuento del 25 %. ¿Cuánto dinero se descuenta?',
  answerInput: { kind: 'text', placeholder: 'Ej.: 10 €' },
  expectedAnswer: { kind: 'number_with_unit', value: 10, unit: '€', tolerance: 0.01, unitRequired: false },
  correction: { corrector: 'numeric_with_unit', acceptedDecimalSeparators: [',', '.'], acceptEquivalentUnits: false },
  hints: [],
  explanation: { text: 'El descuento es 40 · 0,25 = 10 €.' },
  commonErrors: [],
  curriculum: { sense: 'A', knowledgeCodes: ['MAT.2.A.5.1'], competencies: ['CE1'], criteria: ['1.1'] },
};

describe('correctAnswer', () => {
  it('acepta respuestas numéricas con coma decimal y unidad opcional', () => {
    expect(correctAnswer(exercise, '10,00 €')).toMatchObject({ isCorrect: true });
    expect(correctAnswer(exercise, '10')).toMatchObject({ isCorrect: true });
  });

  it('detecta errores típicos en los ejercicios nuevos del banco ampliado', () => {
    const cases: Array<{ exerciseId: string; answer: string; expectedErrorCode: string }> = [
      { exerciseId: 'exercise.mv-2eso-a5-percentages-007', answer: '28', expectedErrorCode: 'parte_vs_final' },
      { exerciseId: 'exercise.mv-2eso-a5-percentages-008', answer: '10.2', expectedErrorCode: 'parte_vs_final' },
      { exerciseId: 'exercise.mv-2eso-a5-percentages-009', answer: '40.5', expectedErrorCode: 'wrong_reference_amount' },
      { exerciseId: 'exercise.mv-2eso-a5-percentages-010', answer: '40,5', expectedErrorCode: 'wrong_reference_amount' },
      { exerciseId: 'exercise.mv-2eso-a5-percentages-011', answer: '30', expectedErrorCode: 'ignores_units_or_context' },
      { exerciseId: 'exercise.mv-2eso-a5-percentages-012', answer: '63', expectedErrorCode: 'parte_vs_final' },
    ];

    for (const { exerciseId, answer, expectedErrorCode } of cases) {
      const seededExercise = contentSeed.exercises.find((candidate) => candidate.id === exerciseId);
      expect(seededExercise, `No existe ${exerciseId} en contentSeed`).toBeDefined();

      const result = correctAnswer(seededExercise as Exercise, answer);
      expect(result.isCorrect, `${exerciseId} debería marcarse como incorrecto`).toBe(false);
      expect(result.errorCode, `errorCode inesperado para ${exerciseId} con respuesta ${answer}`).toBe(expectedErrorCode);
      expect(result.nextAction, `nextAction inesperada para ${exerciseId} con respuesta ${answer}`).toBe('repair');
    }
  });

  it('acepta x=valor y número desnudo en ecuaciones, y detecta error típico reparable', () => {
    const equation = contentSeed.exercises.find((candidate) => candidate.id === 'exercise.mv-2eso-d4-equations-001') as Exercise;
    expect(equation).toBeDefined();

    expect(correctAnswer(equation, 'x=8')).toMatchObject({ isCorrect: true, nextAction: 'continue' });
    expect(correctAnswer(equation, '8')).toMatchObject({ isCorrect: true, nextAction: 'continue' });

    const wrong = correctAnswer(equation, '22');
    expect(wrong.isCorrect).toBe(false);
    expect(wrong.errorCode).toBe('equations.inverse_operation_error');
    expect(wrong.nextAction).toBe('repair');
  });

  it('detecta el error típico coherente en ecuación de dos pasos (EQ-005)', () => {
    const equation = contentSeed.exercises.find((candidate) => candidate.id === 'exercise.mv-2eso-d4-equations-005') as Exercise;
    expect(equation).toBeDefined();

    const wrong = correctAnswer(equation, '14');
    expect(wrong.isCorrect).toBe(false);
    expect(wrong.errorCode).toBe('equations.inverse_operation_error');
    expect(wrong.nextAction).toBe('repair');
  });
});
