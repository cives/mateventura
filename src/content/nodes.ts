import type { LearningNode } from '../domain/types';

export const nodes: LearningNode[] = [
  {
    id: 'node.percentages.calculate_part',
    moduleId: 'module.proportionality_finance',
    missionIds: ['mission.percentages.market_discounts'],
    title: 'Calcular la parte que representa un porcentaje',
    description: 'Pasar del porcentaje a una cantidad concreta dentro de un total.',
    skillFamily: 'porcentajes',
    difficultyRange: [1, 3],
    prerequisites: ['node.percentages.meaning'],
    commonErrorCodes: ['parte_vs_final', 'referencia_porcentual'],
    curriculum: { sense: 'A', knowledgeCodes: ['MAT.2.A.5.1'], competencies: ['CE1', 'CE2'], criteria: ['1.1', '2.2'] },
  },
];
