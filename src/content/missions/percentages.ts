import type { Mission, TheoryCard } from '../../domain/types';

export const missions: Mission[] = [
  {
    id: 'mission.percentages.market_discounts',
    moduleId: 'module.proportionality_finance',
    title: 'Mercado de descuentos imposibles',
    narrativeTitle: 'Mercado de descuentos imposibles',
    learningGoal: 'Calcular descuentos, aumentos e IVA distinguiendo cantidad descontada, precio final y porcentaje de variación.',
    estimatedMinutes: 12,
    prerequisites: [],
    nodeIds: ['node.percentages.calculate_part'],
    theoryCardIds: ['theory.percentages.discount'],
    exerciseIds: ['exercise.mv-2eso-a5-percentages-001'],
    curriculum: { sense: 'A', knowledgeCodes: ['MAT.2.A.5.1'], competencies: ['CE1', 'CE2', 'CE7'], criteria: ['1.1', '2.2', '7.2'] },
  },
  {
    id: 'mission.equations.first_steps',
    moduleId: 'module.algebra_lab',
    title: 'Primeras incógnitas',
    learningGoal: 'Comprender qué representa la incógnita y comprobar soluciones sencillas.',
    estimatedMinutes: 10,
    prerequisites: [],
    nodeIds: [],
    theoryCardIds: [],
    exerciseIds: [],
    curriculum: { sense: 'D', knowledgeCodes: ['MAT.2.D'], competencies: ['CE2'], criteria: ['2.1'] },
  },
];

export const theoryCards: TheoryCard[] = [
  {
    id: 'theory.percentages.discount',
    nodeIds: ['node.percentages.calculate_part'],
    title: 'Porcentaje como parte de 100',
    body: 'Un porcentaje compara una parte con 100. Para calcular una cantidad, convierte el porcentaje en decimal y multiplícalo por el total.',
    workedExample: 'Si un producto cuesta 40 € y tiene un 25 % de descuento: 40 · 0,25 = 10 € de descuento. El precio final sería 30 €.',
    commonMistake: 'Confundir la cantidad descontada con el precio final.',
  },
];
