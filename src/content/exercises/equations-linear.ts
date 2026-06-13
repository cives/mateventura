import type { Exercise } from '../../domain/types';

export const linearEquationExercises: Exercise[] = [
  {
    id: 'exercise.mv-2eso-d4-equations-001',
    version: 1,
    course: '2ESO',
    subject: 'Matemáticas',
    moduleId: 'module.algebra_functions',
    missionIds: ['mission.equations.balance_lab'],
    nodeIds: ['node.equations.linear_simple_solution', 'node.equations.substitution_check'],
    family: 'ecuaciones_1g_directas',
    difficulty: 2,
    statement: 'Resuelve la ecuación: 3x + 5 = 17',
    answerInput: { kind: 'text', placeholder: 'Ej.: x = 4' },
    expectedAnswer: { kind: 'linear_equation_solution', variable: 'x', value: 4 },
    correction: { corrector: 'linear_equation_solution', acceptBareNumber: true, validateBySubstitution: true },
    hints: [
      { level: 1, text: 'Primero deja el término con x solo: resta 5 en ambos lados.' },
      { level: 2, text: 'Si 3x = 12, divide entre 3.' },
    ],
    explanation: { text: '3x + 5 = 17. Restamos 5: 3x = 12. Dividimos entre 3: x = 4.' },
    commonErrors: [
      { code: 'equations.inverse_operation_error', detectable: false, feedback: 'Revisa la operación inversa: para quitar +5 se resta 5 en los dos lados.' },
    ],
    curriculum: { sense: 'D', knowledgeCodes: ['MAT.2.D.4'], competencies: ['CE1', 'CE2', 'CE7'], criteria: ['1.1', '2.2', '7.1'] },
  },
];
