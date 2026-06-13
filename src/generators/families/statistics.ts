import type { GeneratorDef } from '../builders';
import { fmt } from '../builders';
import type { Rng } from '../rng';

const MODULE = 'module.numbers_calculation_estimation';

function listaConMediaEntera(rng: Rng, n: number, min: number, max: number): number[] {
  // Genera n-1 valores libres y ajusta el último para que la media sea entera.
  for (let intento = 0; intento < 40; intento += 1) {
    const objetivo = rng.int(min + 1, max - 1);
    const datos: number[] = [];
    let suma = 0;
    for (let i = 0; i < n - 1; i += 1) {
      const v = rng.int(min, max);
      datos.push(v);
      suma += v;
    }
    const ultimo = objetivo * n - suma;
    if (ultimo >= min && ultimo <= max) {
      datos.push(ultimo);
      return datos;
    }
  }
  return Array(n).fill(rng.int(min, max));
}

export const statisticsGenerators: GeneratorDef[] = [
  {
    family: 'media_aritmetica',
    title: 'Media aritmética',
    emoji: '📈',
    moduleId: MODULE,
    nodeIds: ['node.stats.mean'],
    skillFamily: 'estadistica',
    difficulties: [2, 3],
    build(rng, difficulty) {
      const n = difficulty >= 3 ? 5 : 4;
      const datos = listaConMediaEntera(rng, n, 2, 12);
      const suma = datos.reduce((a, b) => a + b, 0);
      const media = suma / n;
      return {
        statement: `📈 Ángeles ha sacado estas notas: ${datos.join(', ')}. ¿Cuál es su nota media?`,
        expectedAnswer: { kind: 'number', value: media, tolerance: 0.01 },
        placeholder: 'Ej.: 7',
        explanation: {
          text: `Media = suma ÷ número de datos = ${suma} ÷ ${n} = ${fmt(media)}.`,
          steps: [`Suma: ${datos.join(' + ')} = ${suma}`, `${suma} ÷ ${n} = ${fmt(media)}`],
          check: 'La media siempre está entre el dato menor y el mayor.',
        },
        hints: [
          { level: 1, text: 'Suma todos los datos.' },
          { level: 2, text: `Divide la suma entre el número de datos (${n}).` },
        ],
      };
    },
  },
  {
    family: 'mediana',
    title: 'Mediana',
    emoji: '🎯',
    moduleId: MODULE,
    nodeIds: ['node.stats.median'],
    skillFamily: 'estadistica',
    difficulties: [2, 3],
    build(rng) {
      const n = 5;
      const datos = Array.from({ length: n }, () => rng.int(1, 20));
      const ordenados = [...datos].sort((a, b) => a - b);
      const mediana = ordenados[Math.floor(n / 2)];
      return {
        statement: `🎯 Tiempos (en minutos) de 5 carreras: ${datos.join(', ')}. Calcula la mediana.`,
        expectedAnswer: { kind: 'number', value: mediana, tolerance: 0.001 },
        placeholder: 'Ej.: 9',
        explanation: {
          text: `Ordenamos: ${ordenados.join(', ')}. La mediana es el valor central: ${mediana}.`,
          steps: [`Ordenados: ${ordenados.join(', ')}`, `Valor central: ${mediana}`],
          check: 'Con 5 datos, la mediana es el 3.º una vez ordenados.',
        },
        commonErrors: [{ code: 'no_ordena', trigger: { kind: 'numeric_value', value: datos[Math.floor(n / 2)], tolerance: 0.001 }, feedback: 'Antes de tomar el valor central hay que ORDENAR los datos.', detectable: true }],
        hints: [{ level: 1, text: 'Primero ordena los datos de menor a mayor.' }],
      };
    },
  },
  {
    family: 'moda_rango',
    title: 'Moda y rango',
    emoji: '🏆',
    moduleId: MODULE,
    nodeIds: ['node.stats.mode_range'],
    skillFamily: 'estadistica',
    difficulties: [1, 2],
    build(rng) {
      const moda = rng.int(2, 9);
      const datos = [moda, moda, moda, rng.int(10, 15), rng.int(16, 20)];
      // mezcla determinista
      for (let i = datos.length - 1; i > 0; i -= 1) {
        const j = rng.int(0, i);
        [datos[i], datos[j]] = [datos[j], datos[i]];
      }
      const max = Math.max(...datos);
      const min = Math.min(...datos);
      const rango = max - min;
      const preguntaModa = rng.chance();
      return preguntaModa
        ? {
            statement: `🏆 Goles por partido: ${datos.join(', ')}. ¿Cuál es la moda (el valor que más se repite)?`,
            expectedAnswer: { kind: 'number', value: moda, tolerance: 0.001 },
            placeholder: 'Ej.: 3',
            explanation: { text: `El valor que más aparece es ${moda} (sale 3 veces).`, steps: [`Moda = ${moda}`], check: 'La moda es el dato más frecuente.' },
            hints: [{ level: 1, text: 'Cuenta cuántas veces aparece cada número.' }],
          }
        : {
            statement: `🏆 Goles por partido: ${datos.join(', ')}. ¿Cuál es el rango (diferencia entre el mayor y el menor)?`,
            expectedAnswer: { kind: 'number', value: rango, tolerance: 0.001 },
            placeholder: 'Ej.: 14',
            explanation: { text: `Rango = máximo − mínimo = ${max} − ${min} = ${rango}.`, steps: [`${max} − ${min} = ${rango}`], check: 'El rango mide cuánto se dispersan los datos.' },
            hints: [{ level: 1, text: 'Resta el dato más pequeño al más grande.' }],
          };
    },
  },
];
