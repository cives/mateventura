import type { GeneratorDef } from '../builders';
import { numericTrap } from '../builders';

const MODULE = 'module.algebra_equations_functions';

function signed(n: number): string {
  return n < 0 ? `− ${Math.abs(n)}` : `+ ${n}`;
}

export const algebraGenerators: GeneratorDef[] = [
  {
    family: 'ec_un_paso',
    title: 'Ecuación de un paso',
    emoji: '⚖️',
    moduleId: MODULE,
    nodeIds: ['node.algebra.solve_one_step_add_subtract'],
    skillFamily: 'ecuaciones_lineales',
    difficulties: [1, 2],
    build(rng, difficulty) {
      const x = rng.nonZero(difficulty === 1 ? 9 : 15);
      const b = rng.nonZero(12);
      const c = x + b;
      return {
        statement: `⚖️ Resuelve la ecuación:   x ${signed(b)} = ${c}`,
        expectedAnswer: { kind: 'linear_equation_solution', variable: 'x', value: x },
        placeholder: 'Ej.: x = 5',
        explanation: {
          text: `Pasamos el ${signed(b)} al otro lado con la operación inversa: x = ${c} ${signed(-b)} = ${x}.`,
          steps: [`x = ${c} ${signed(-b)}`, `x = ${x}`],
          check: `Comprueba: ${x} ${signed(b)} = ${c}. ✓`,
        },
        commonErrors: [numericTrap('equations.sign_error', c + b, 'Cuidado con el signo: lo que suma a un lado, resta al pasar al otro.')],
        hints: [
          { level: 1, text: 'Para dejar la x sola, haz la operación inversa en los dos lados.' },
          { level: 2, text: `Si el término ${signed(b)} acompaña a la x, pásalo restando/sumando al otro miembro.` },
        ],
      };
    },
  },
  {
    family: 'ec_coeficiente',
    title: 'Ecuación con coeficiente',
    emoji: '✖️',
    moduleId: MODULE,
    nodeIds: ['node.algebra.solve_one_step_multiply_divide'],
    skillFamily: 'ecuaciones_lineales',
    difficulties: [1, 2, 3],
    build(rng) {
      const a = rng.int(2, 9);
      const x = rng.nonZero(9);
      const c = a * x;
      return {
        statement: `✖️ Resuelve la ecuación:   ${a}x = ${c}`,
        expectedAnswer: { kind: 'linear_equation_solution', variable: 'x', value: x },
        placeholder: 'Ej.: x = 4',
        explanation: {
          text: `Como ${a} multiplica a la x, dividimos ambos lados entre ${a}: x = ${c} ÷ ${a} = ${x}.`,
          steps: [`x = ${c} ÷ ${a}`, `x = ${x}`],
          check: `Comprueba: ${a} · ${x} = ${c}. ✓`,
        },
        commonErrors: [numericTrap('equations.coefficient_division_error', c - a, `Para quitar el ${a} que multiplica, hay que dividir, no restar.`)],
        hints: [
          { level: 1, text: 'El número pegado a la x la está multiplicando.' },
          { level: 2, text: `La operación inversa de multiplicar por ${a} es dividir entre ${a}.` },
        ],
      };
    },
  },
  {
    family: 'ec_dos_pasos',
    title: 'Ecuación de dos pasos',
    emoji: '🧩',
    moduleId: MODULE,
    nodeIds: ['node.algebra.solve_two_step_basic'],
    skillFamily: 'ecuaciones_lineales',
    difficulties: [2, 3, 4],
    build(rng, difficulty) {
      const a = rng.int(2, difficulty === 2 ? 6 : 9);
      const x = rng.nonZero(difficulty >= 4 ? 12 : 8);
      const b = rng.nonZero(15);
      const c = a * x + b;
      return {
        statement: `🧩 Resuelve la ecuación:   ${a}x ${signed(b)} = ${c}`,
        expectedAnswer: { kind: 'linear_equation_solution', variable: 'x', value: x },
        placeholder: 'Ej.: x = 3',
        explanation: {
          text: `Primero quitamos el ${signed(b)}: ${a}x = ${c} ${signed(-b)} = ${a * x}. Luego dividimos entre ${a}: x = ${x}.`,
          steps: [`${a}x = ${c} ${signed(-b)}`, `${a}x = ${a * x}`, `x = ${a * x} ÷ ${a} = ${x}`],
          check: `Comprueba: ${a} · ${x} ${signed(b)} = ${c}. ✓`,
        },
        commonErrors: [
          numericTrap('equations.inverse_operation_error', (c - b) / a, 'Has restado el término pero olvidaste un signo: revisa si era sumar o restar.'),
          numericTrap('equations.coefficient_division_error', c - b, `Te falta el último paso: dividir entre ${a}.`),
        ],
        hints: [
          { level: 1, text: 'Deshaz las operaciones en orden inverso: primero la suma/resta, luego el producto.' },
          { level: 2, text: `Paso 1: deja solo ${a}x a un lado. Paso 2: divide entre ${a}.` },
        ],
      };
    },
  },
  {
    family: 'ec_parentesis',
    title: 'Ecuación con paréntesis',
    emoji: '🎯',
    moduleId: MODULE,
    nodeIds: ['node.algebra.solve_two_step_basic'],
    skillFamily: 'ecuaciones_lineales',
    difficulties: [3, 4, 5],
    build(rng) {
      const a = rng.int(2, 6);
      const x = rng.nonZero(8);
      const b = rng.nonZero(7);
      const c = a * (x + b);
      return {
        statement: `🎯 Resuelve la ecuación:   ${a}(x ${signed(b)}) = ${c}`,
        expectedAnswer: { kind: 'linear_equation_solution', variable: 'x', value: x },
        placeholder: 'Ej.: x = 2',
        explanation: {
          text: `Dividimos entre ${a}: x ${signed(b)} = ${c / a}. Despejamos: x = ${c / a} ${signed(-b)} = ${x}.`,
          steps: [`x ${signed(b)} = ${c} ÷ ${a} = ${c / a}`, `x = ${c / a} ${signed(-b)} = ${x}`],
          check: `Comprueba: ${a}(${x} ${signed(b)}) = ${a}·${x + b} = ${c}. ✓`,
        },
        commonErrors: [numericTrap('equations.sign_error', c / a + b, 'Al pasar el término del paréntesis al otro lado, cambia su signo.')],
        hints: [
          { level: 1, text: 'Puedes empezar dividiendo los dos lados entre el número de fuera del paréntesis.' },
          { level: 2, text: 'O multiplica (propiedad distributiva) y luego resuelve como una de dos pasos.' },
        ],
      };
    },
  },
  {
    family: 'valor_numerico',
    title: 'Valor numérico de una expresión',
    emoji: '🔢',
    moduleId: MODULE,
    nodeIds: ['node.algebra.solve_one_step_add_subtract'],
    skillFamily: 'algebra_basica',
    difficulties: [2, 3],
    build(rng) {
      const a = rng.int(2, 6);
      const b = rng.nonZero(9);
      const x = rng.nonZero(6);
      const value = a * x + b;
      return {
        statement: `🔢 Calcula el valor numérico de la expresión  ${a}x ${signed(b)}  cuando  x = ${x}.`,
        expectedAnswer: { kind: 'number', value, tolerance: 0.001 },
        placeholder: 'Ej.: 17',
        explanation: {
          text: `Sustituye x por ${x}: ${a}·(${x}) ${signed(b)} = ${a * x} ${signed(b)} = ${value}.`,
          steps: [`${a}·${x} = ${a * x}`, `${a * x} ${signed(b)} = ${value}`],
          check: 'Respeta la jerarquía: primero el producto, luego la suma o resta.',
        },
        hints: [
          { level: 1, text: 'Cambia cada x por su valor entre paréntesis.' },
          { level: 2, text: 'Multiplica antes de sumar.' },
        ],
      };
    },
  },
];
