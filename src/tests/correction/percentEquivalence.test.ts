import { describe, expect, it, vi } from 'vitest';
import { correctAnswer } from '../../correction/correctAnswer';
import type { Exercise } from '../../domain/types';

const percentEquivalenceExercise: Exercise = {
  id: 'exercise.mv-2eso-a5-percentages-equivalence',
  version: 1,
  course: '2ESO',
  subject: 'Matemáticas',
  moduleId: 'module.proportionality_finance',
  missionIds: ['mission.percentages.market_discounts'],
  nodeIds: ['node.percentages.equivalence'],
  family: 'porcentaje_equivalencia',
  difficulty: 2,
  statement: 'Escribe el 25 % como número decimal.',
  answerInput: { kind: 'text', placeholder: 'Ej.: 0,25' },
  expectedAnswer: { kind: 'percent_equivalence', valueAsDecimal: 0.25, tolerance: 0.001 },
  correction: { corrector: 'percent_equivalence', acceptedDecimalSeparators: [',', '.'] },
  hints: [{ level: 1, text: 'Divide el porcentaje entre 100.' }],
  explanation: { text: '25 % equivale a 25/100 = 0,25.' },
  commonErrors: [
    {
      code: 'percentages.percent_not_divided_by_100',
      detectable: true,
      feedback: 'Has conservado 25 como si ya fuera un decimal; hay que dividir entre 100.',
      ifNumericValueEquals: 25,
    },
  ],
  curriculum: { sense: 'A', knowledgeCodes: ['MAT.2.A.5.1'], competencies: ['CE1'], criteria: ['1.1'] },
};

describe('corrector puro de equivalencias porcentuales', () => {
  it('acepta equivalencias con formatos adicionales de entrada', () => {
    expect(correctAnswer(percentEquivalenceExercise, '0,25')).toMatchObject({ isCorrect: true, normalizedAnswer: 0.25 });
    expect(correctAnswer(percentEquivalenceExercise, '0.25')).toMatchObject({ isCorrect: true, normalizedAnswer: 0.25 });
    expect(correctAnswer(percentEquivalenceExercise, '25%')).toMatchObject({ isCorrect: true, normalizedAnswer: 0.25 });
    expect(correctAnswer(percentEquivalenceExercise, '25 %')).toMatchObject({ isCorrect: true, normalizedAnswer: 0.25 });
    expect(correctAnswer(percentEquivalenceExercise, '1/4')).toMatchObject({ isCorrect: true, normalizedAnswer: 0.25 });
    expect(correctAnswer(percentEquivalenceExercise, '25/100')).toMatchObject({ isCorrect: true, normalizedAnswer: 0.25 });
    expect(correctAnswer(percentEquivalenceExercise, '+0,25')).toMatchObject({ isCorrect: true, normalizedAnswer: 0.25 });
  });

  it('detecta el error útil de no dividir el porcentaje entre cien', () => {
    expect(correctAnswer(percentEquivalenceExercise, '25')).toMatchObject({
      isCorrect: false,
      errorCode: 'percentages.percent_not_divided_by_100',
      nextAction: 'repair',
    });
  });

  it('no lee ni escribe localStorage desde el corrector', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    correctAnswer(percentEquivalenceExercise, '25 %');

    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });
});
