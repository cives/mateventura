import type { GeneratorDef } from '../builders';
import { gcd } from '../builders';

const MODULE = 'module.numbers_calculation_estimation';

function p(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

export const numberGenerators: GeneratorDef[] = [
  {
    family: 'jerarquia_enteros',
    title: 'Jerarquía de operaciones',
    emoji: '🔼',
    moduleId: MODULE,
    nodeIds: ['node.numbers.operations_priority'],
    skillFamily: 'enteros',
    difficulties: [1, 2, 3, 4],
    build(rng, difficulty) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const c = rng.int(2, 9);
      if (difficulty <= 2) {
        const value = a + b * c;
        return {
          statement: `🔼 Calcula respetando la jerarquía:   ${a} + ${b} · ${c}`,
          expectedAnswer: { kind: 'number', value, tolerance: 0.001 },
          placeholder: 'Ej.: 23',
          explanation: {
            text: `Primero el producto: ${b} · ${c} = ${b * c}. Luego la suma: ${a} + ${b * c} = ${value}.`,
            steps: [`${b} · ${c} = ${b * c}`, `${a} + ${b * c} = ${value}`],
            check: 'La multiplicación se hace antes que la suma.',
          },
          commonErrors: [{ code: 'orden_izq_derecha', trigger: { kind: 'numeric_value', value: (a + b) * c, tolerance: 0.001 }, feedback: 'Has operado de izquierda a derecha. La multiplicación tiene prioridad sobre la suma.', detectable: true }],
          hints: [{ level: 1, text: 'Multiplicaciones y divisiones van antes que sumas y restas.' }],
        };
      }
      const d = rng.int(2, 6);
      const value = a * (b + c) - d;
      return {
        statement: `🔼 Calcula respetando la jerarquía:   ${a} · (${b} + ${c}) − ${d}`,
        expectedAnswer: { kind: 'number', value, tolerance: 0.001 },
        placeholder: 'Ej.: 19',
        explanation: {
          text: `Primero el paréntesis: ${b} + ${c} = ${b + c}. Producto: ${a} · ${b + c} = ${a * (b + c)}. Resta: ${a * (b + c)} − ${d} = ${value}.`,
          steps: [`(${b} + ${c}) = ${b + c}`, `${a} · ${b + c} = ${a * (b + c)}`, `${a * (b + c)} − ${d} = ${value}`],
          check: 'Paréntesis → multiplicación/división → suma/resta.',
        },
        hints: [
          { level: 1, text: 'Empieza siempre por lo que hay dentro del paréntesis.' },
          { level: 2, text: 'Después multiplica y al final resta.' },
        ],
      };
    },
  },
  {
    family: 'enteros_signos',
    title: 'Operaciones con enteros',
    emoji: '➖',
    moduleId: MODULE,
    nodeIds: ['node.numbers.integer_operations'],
    skillFamily: 'enteros',
    difficulties: [1, 2, 3],
    build(rng, difficulty) {
      const a = rng.nonZero(difficulty * 5 + 5);
      const b = rng.nonZero(difficulty * 5 + 5);
      const op = rng.pick(['+', '−', '·'] as const);
      const value = op === '+' ? a + b : op === '−' ? a - b : a * b;
      return {
        statement: `➖ Calcula:   ${p(a)} ${op} ${p(b)}`,
        expectedAnswer: { kind: 'number', value, tolerance: 0.001 },
        placeholder: 'Ej.: -7',
        explanation: {
          text: `Regla de signos: ${p(a)} ${op} ${p(b)} = ${value}.`,
          steps: [`${p(a)} ${op} ${p(b)} = ${value}`],
          check: op === '·' ? 'Mismo signo → positivo; signos distintos → negativo.' : 'Cuida el signo del resultado.',
        },
        hints: [{ level: 1, text: op === '·' ? 'Menos por menos da más; menos por más da menos.' : 'Restar un negativo es como sumar.' }],
      };
    },
  },
  {
    family: 'fracciones_suma',
    title: 'Suma y resta de fracciones',
    emoji: '🍕',
    moduleId: MODULE,
    nodeIds: ['node.numbers.fraction_operations'],
    skillFamily: 'fracciones',
    difficulties: [2, 3, 4],
    build(rng) {
      const b = rng.int(2, 9);
      let d = rng.int(2, 9);
      while (d === b) d = rng.int(2, 9);
      const a = rng.int(1, b - 1);
      const c = rng.int(1, d - 1);
      const op = rng.pick(['+', '−'] as const);
      const num = op === '+' ? a * d + c * b : a * d - c * b;
      const den = b * d;
      const g = gcd(num, den);
      const sNum = num / g;
      const sDen = den / g;
      return {
        statement: `🍕 Calcula y simplifica:   ${a}/${b} ${op} ${c}/${d}`,
        expectedAnswer: { kind: 'percent_equivalence', valueAsDecimal: num / den, tolerance: 0.01 },
        placeholder: `Ej.: ${sNum}/${sDen}`,
        explanation: {
          text: `Reducimos a común denominador ${den}: ${a * d}/${den} ${op} ${c * b}/${den} = ${num}/${den} = ${sNum}/${sDen}.`,
          steps: [`Común denominador: ${den}`, `${a * d}/${den} ${op} ${c * b}/${den} = ${num}/${den}`, `Simplificando: ${sNum}/${sDen}`],
          check: 'Puedes escribir la fracción simplificada o su valor decimal.',
        },
        hints: [
          { level: 1, text: 'Necesitas el mismo denominador en las dos fracciones.' },
          { level: 2, text: `Un denominador común sencillo es ${den} (el producto).` },
          { level: 3, text: 'Al final simplifica dividiendo numerador y denominador por su máximo común divisor.' },
        ],
      };
    },
  },
  {
    family: 'decimales_operacion',
    title: 'Operaciones con decimales',
    emoji: '🔟',
    moduleId: MODULE,
    nodeIds: ['node.numbers.decimal_operations'],
    skillFamily: 'decimales',
    difficulties: [2, 3],
    build(rng) {
      const a = rng.int(11, 99) / 10;
      const b = rng.int(2, 9);
      const value = Math.round(a * b * 100) / 100;
      return {
        statement: `🔟 Calcula:   ${String(a).replace('.', ',')} · ${b}`,
        expectedAnswer: { kind: 'number', value, tolerance: 0.001 },
        placeholder: 'Ej.: 12,6',
        explanation: {
          text: `Multiplica como si no hubiera coma (${a * 10} · ${b} = ${a * 10 * b}) y coloca un decimal: ${String(value).replace('.', ',')}.`,
          steps: [`${a * 10} · ${b} = ${a * 10 * b}`, `Coloca la coma: ${String(value).replace('.', ',')}`],
          check: 'El resultado tiene tantos decimales como entre los dos factores (aquí, 1).',
        },
        hints: [{ level: 1, text: 'Multiplica ignorando la coma y colócala al final contando los decimales.' }],
      };
    },
  },
  {
    family: 'potencias',
    title: 'Potencias',
    emoji: '⚡',
    moduleId: MODULE,
    nodeIds: ['node.numbers.powers'],
    skillFamily: 'potencias',
    difficulties: [2, 3, 4],
    build(rng, difficulty) {
      if (difficulty <= 2) {
        const base = rng.int(2, 6);
        // 2² coincide con 2·2 (potencia = producto), lo que choca con la trampa; lo evitamos.
        const exp = base === 2 ? 3 : rng.int(2, 3);
        const value = base ** exp;
        return {
          statement: `⚡ Calcula la potencia:   ${base}^${exp}`,
          expectedAnswer: { kind: 'number', value, tolerance: 0.001 },
          placeholder: 'Ej.: 27',
          explanation: {
            text: `${base}^${exp} significa multiplicar ${base} por sí mismo ${exp} veces: ${Array(exp).fill(base).join(' · ')} = ${value}.`,
            steps: [`${Array(exp).fill(base).join(' · ')} = ${value}`],
            check: 'Una potencia NO es multiplicar la base por el exponente.',
          },
          commonErrors: [{ code: 'potencia_como_producto', trigger: { kind: 'numeric_value', value: base * exp, tolerance: 0.001 }, feedback: `${base}^${exp} no es ${base}·${exp}. Es ${base} multiplicado por sí mismo ${exp} veces.`, detectable: true }],
          hints: [{ level: 1, text: 'El exponente dice cuántas veces se repite la base como factor.' }],
        };
      }
      const base = rng.int(2, 5);
      const e1 = rng.int(2, 4);
      // si e1=e2=2, la suma (4) coincide con el producto (4) y la trampa choca con la solución.
      const e2 = e1 === 2 ? rng.int(3, 4) : rng.int(2, 4);
      const value = base ** (e1 + e2);
      return {
        statement: `⚡ Expresa como una sola potencia y calcula:   ${base}^${e1} · ${base}^${e2}`,
        expectedAnswer: { kind: 'number', value, tolerance: 0.001 },
        placeholder: `Ej.: ${value}`,
        explanation: {
          text: `Producto de potencias de igual base: se suman los exponentes. ${base}^${e1} · ${base}^${e2} = ${base}^${e1 + e2} = ${value}.`,
          steps: [`${base}^${e1} · ${base}^${e2} = ${base}^(${e1}+${e2})`, `${base}^${e1 + e2} = ${value}`],
          check: 'Misma base: los exponentes se SUMAN (no se multiplican).',
        },
        commonErrors: [{ code: 'multiplica_exponentes', trigger: { kind: 'numeric_value', value: base ** (e1 * e2), tolerance: 0.001 }, feedback: 'En un producto de potencias de igual base los exponentes se suman, no se multiplican.', detectable: true }],
        hints: [{ level: 1, text: 'Misma base en un producto → suma de exponentes.' }],
      };
    },
  },
];
