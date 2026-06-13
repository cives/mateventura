import type { Exercise } from '../../domain/types';

export const percentageExercises: Exercise[] = [
  {
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
    hints: [
      { level: 1, text: '25 % significa 25 de cada 100, es decir, 0,25.' },
      { level: 2, text: 'Multiplica 40 por 0,25 para obtener la cantidad descontada.' },
    ],
    explanation: { text: 'El descuento es 40 · 0,25 = 10 €. El precio final sería 30 €, pero aquí se preguntaba cuánto se descuenta.' },
    commonErrors: [
      {
        code: 'percentages.final_price_instead_of_discount',
        detectable: true,
        ifNumericValueEquals: 30,
        feedback: 'Has calculado el precio final, no el descuento. La pregunta pide la cantidad que se rebaja.',
      },
    ],
    curriculum: { sense: 'A', knowledgeCodes: ['MAT.2.A.2.5', 'MAT.2.A.5.2'], competencies: ['CE1', 'CE2', 'CE6'], criteria: ['1.1', '1.3', '6.1'] },
  },
];
